import { Board, BoardPosition } from './Board';
import { Piece } from './Piece';
import { PieceGenerator } from './PieceGenerator';
import { Scoring } from './Scoring';
import { ComboTracker } from './Combo';

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
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export class GameEngine {
  private board: Board;
  private generator: PieceGenerator;
  private scoring: Scoring;
  private comboTracker: ComboTracker;

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

    // 5. Calculate line clear points
    const clearPointsInfo = this.scoring.calculateClearPoints(
      clearResult.lineCount,
      comboInfo.comboCount
    );

    const scoreGained = placementPoints + clearPointsInfo.totalPoints;
    this.score += scoreGained;

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
    };
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
