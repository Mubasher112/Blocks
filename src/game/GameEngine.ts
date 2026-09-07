import { Board, BoardPosition } from './Board';
import { Piece } from './Piece';
import { PieceGenerator } from './PieceGenerator';
import { Scoring } from './Scoring';
import { ComboTracker } from './Combo';
import { NovaEngine } from './nova/NovaEngine';
import { NovaActionResult } from './nova/NovaTypes';
import { NOVA_CONFIG } from './nova/NovaConfig';

export interface GameStats {
  gamesPlayed: number;
  totalLinesCleared: number;
  totalBlocksPlaced: number;
  highScore: number;
  longestCombo: number;
}

export interface MoveResult {
  success: boolean;
  scoreGained: number;
  linesCleared: number;
  clearedCells: BoardPosition[];
  comboCount: number;
  isGameOver: boolean;
  isNewHighScore: boolean;
  trayRefreshed: boolean;
  isNovaClear?: boolean;
  novaEnergyEarned?: number;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export class GameEngine {
  private board: Board;
  private generator: PieceGenerator;
  private scoring: Scoring;
  private comboTracker: ComboTracker;
  private novaEngine: NovaEngine;

  private score: number = 0;
  private highScore: number = 0;
  private tray: (Piece | null)[] = [null, null, null];
  private status: GameStatus = 'MENU';

  // Game Statistics
  private stats: GameStats = {
    gamesPlayed: 0,
    totalLinesCleared: 0,
    totalBlocksPlaced: 0,
    highScore: 0,
    longestCombo: 0,
  };

  constructor(seed?: number, initialStats?: Partial<GameStats>) {
    this.board = new Board();
    this.generator = new PieceGenerator(seed);
    this.scoring = new Scoring();
    this.comboTracker = new ComboTracker();
    this.novaEngine = new NovaEngine();

    if (initialStats) {
      this.stats = { ...this.stats, ...initialStats };
      this.highScore = this.stats.highScore;
    }
  }

  /**
   * Starts or restarts a new classic game
   */
  public startNewGame(seed?: number): void {
    if (seed !== undefined) {
      this.generator = new PieceGenerator(seed);
    }

    this.board = new Board();
    this.score = 0;
    this.comboTracker.reset();
    this.novaEngine.reset();
    this.status = 'PLAYING';

    this.stats.gamesPlayed++;

    // Populate initial tray with 3 pieces
    this.refreshTray();

    // Check edge case where initial tray cannot fit on fresh board (extremely unlikely, but mathematically safe)
    if (!this.board.hasAnyValidMove(this.tray)) {
      this.status = 'GAMEOVER';
    }
  }

  /**
   * Refills empty tray with 3 new pieces
   */
  private refreshTray(): void {
    this.tray = this.generator.generateTray();
  }

  /**
   * Main gameplay action: attempts to place tray piece at (startR, startC)
   */
  public placePiece(trayIndex: number, startR: number, startC: number): MoveResult {
    if (this.status !== 'PLAYING') {
      return this.createFailedResult();
    }

    if (trayIndex < 0 || trayIndex >= this.tray.length) {
      return this.createFailedResult();
    }

    const piece = this.tray[trayIndex];
    if (!piece) {
      return this.createFailedResult();
    }

    // Check validity
    if (!this.board.canPlacePiece(piece, startR, startC)) {
      return this.createFailedResult();
    }

    // Save Undo snapshot before applying action
    this.saveSnapshot();

    // 1. Place piece
    this.board.placePiece(piece, startR, startC);
    this.stats.totalBlocksPlaced += piece.blockCount;

    // Calculate placement points
    const placementPoints = this.scoring.calculatePlacementPoints(piece.blockCount);

    // 2. Remove piece from tray
    this.tray[trayIndex] = null;

    // 3. Clear lines
    const clearResult = this.board.clearLines();
    this.stats.totalLinesCleared += clearResult.lineCount;

    // 4. Update Combo state
    const comboInfo = this.comboTracker.registerTurn(clearResult.lineCount);
    if (comboInfo.maxCombo > this.stats.longestCombo) {
      this.stats.longestCombo = comboInfo.maxCombo;
    }

    // 5. Calculate line clear points (apply 2x Nova multiplier if active)
    const isNovaActive = this.novaEngine.getState().status === 'ACTIVE';
    const clearPointsInfo = this.scoring.calculateClearPoints(
      clearResult.lineCount,
      comboInfo.comboCount
    );

    let clearPoints = clearPointsInfo.totalPoints;
    if (isNovaActive) {
      clearPoints *= NOVA_CONFIG.SCORE_MULTIPLIER;
    }

    // Evaluate Nova Clear & Prism bonuses
    const novaClearEval = this.novaEngine.evaluateNovaClear(clearResult.lineCount);

    let scoreGained = placementPoints + clearPoints + novaClearEval.bonusScore;
    this.score += scoreGained;

    // Calculate & add Nova Energy
    const energyEarned = this.novaEngine.calculateEnergyEarned(
      true,
      clearResult.lineCount,
      comboInfo.comboCount
    );
    this.novaEngine.addEnergy(energyEarned);

    // If in Nova mode, consume placement turn
    if (isNovaActive) {
      this.novaEngine.consumeNovaTurn();
    }

    let isNewHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.stats.highScore = this.highScore;
      isNewHighScore = true;
    }

    // 6. Check if tray is empty and needs refresh
    let trayRefreshed = false;
    const isTrayEmpty = this.tray.every(p => p === null);
    if (isTrayEmpty) {
      this.refreshTray();
      trayRefreshed = true;
    }

    // 7. Mathematical Game Over check: Can ANY remaining piece in tray fit ANYWHERE on board?
    const validMoveExists = this.board.hasAnyValidMove(this.tray);
    const isGameOver = !validMoveExists;

    if (isGameOver) {
      this.status = 'GAMEOVER';
    }

    return {
      success: true,
      scoreGained,
      linesCleared: clearResult.lineCount,
      clearedCells: clearResult.clearedCells,
      comboCount: comboInfo.comboCount,
      isGameOver,
      isNewHighScore,
      trayRefreshed,
      isNovaClear: novaClearEval.isNovaClear,
      novaEnergyEarned: energyEarned,
    };
  }

  // --- NOVA POWERS METHODS ---

  public getNovaEngine(): NovaEngine {
    return this.novaEngine;
  }

  public activateNova(): boolean {
    return this.novaEngine.activate();
  }

  public executePulse(r: number, c: number): NovaActionResult {
    this.saveSnapshot();
    const result = this.novaEngine.executePulse(this.board, r, c);

    if (result.success && result.linesCleared) {
      const clearPointsInfo = this.scoring.calculateClearPoints(
        result.linesCleared,
        this.comboTracker.getComboCount()
      );
      this.score += clearPointsInfo.totalPoints;
      result.scoreGained = clearPointsInfo.totalPoints;
    }

    // Check game over
    if (!this.board.hasAnyValidMove(this.tray)) {
      this.status = 'GAMEOVER';
    }

    return result;
  }

  public executeWild(trayIndex: number, newPiece: Piece): NovaActionResult {
    this.saveSnapshot();
    return this.novaEngine.executeWild(this.tray, trayIndex, newPiece);
  }

  public executeShuffle(): NovaActionResult {
    this.saveSnapshot();
    const result = this.novaEngine.executeShuffle(this.tray, this.generator);
    if (!this.board.hasAnyValidMove(this.tray)) {
      this.status = 'GAMEOVER';
    }
    return result;
  }

  public executePrism(): NovaActionResult {
    return this.novaEngine.executePrism();
  }

  public undo(): boolean {
    if (!this.novaEngine.canUndo()) return false;
    const snapshot = this.novaEngine.getUndoSnapshot();
    if (!snapshot) return false;

    // Restore board
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cellData = snapshot.boardGrid[r][c];
        this.board.setCell(
          r,
          c,
          cellData.state === 1 ? 'OCCUPIED' : 'EMPTY',
          cellData.color
        );
      }
    }

    // Restore tray, score, stats, nova
    this.tray = snapshot.tray;
    this.score = snapshot.score;
    this.highScore = snapshot.highScore;
    this.novaEngine = new NovaEngine(snapshot.novaState);
    this.novaEngine.markUndoUsed();
    this.status = 'PLAYING';

    return true;
  }

  private saveSnapshot(): void {
    const rawGrid = this.board.getGrid().map(row =>
      row.map(cell => ({
        state: cell.state === 'OCCUPIED' ? 1 : 0,
        color: cell.color,
      }))
    );

    this.novaEngine.saveUndoSnapshot({
      boardGrid: rawGrid,
      tray: [...this.tray],
      score: this.score,
      highScore: this.highScore,
      comboCount: this.comboTracker.getComboCount(),
      novaState: this.novaEngine.getState(),
      moveCount: this.stats.totalBlocksPlaced,
    });
  }

  private createFailedResult(): MoveResult {
    return {
      success: false,
      scoreGained: 0,
      linesCleared: 0,
      clearedCells: [],
      comboCount: this.comboTracker.getComboCount(),
      isGameOver: this.status === 'GAMEOVER',
      isNewHighScore: false,
      trayRefreshed: false,
    };
  }

  // --- GETTERS & SETTERS ---

  public getBoard(): Board {
    return this.board;
  }

  public getTray(): (Piece | null)[] {
    return [...this.tray];
  }

  public getScore(): number {
    return this.score;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public getComboCount(): number {
    return this.comboTracker.getComboCount();
  }

  public getLongestCombo(): number {
    return this.stats.longestCombo;
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public setStatus(status: GameStatus): void {
    this.status = status;
  }
}
