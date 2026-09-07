import { GameEngine, MoveResult } from '../GameEngine';
import { Board } from '../Board';
import { AdventureLevel } from './AdventureTypes';
import { ObjectiveEvaluator, GameplayStats } from './ObjectiveEvaluator';
import { NovaActionResult } from '../nova/NovaTypes';

export interface AdventureMoveResult extends MoveResult {
  isObjectiveComplete: boolean;
  starsEarned: number;
  movesRemaining: number | null;
}

export class AdventureEngine extends GameEngine {
  private currentLevel: AdventureLevel | null = null;
  private levelLinesCleared: number = 0;
  private levelMovesUsed: number = 0;
  private isLevelComplete: boolean = false;

  /**
   * Initializes and starts a specific Adventure level
   */
  public startLevel(level: AdventureLevel): void {
    this.currentLevel = level;
    this.levelLinesCleared = 0;
    this.levelMovesUsed = 0;
    this.isLevelComplete = false;

    // Start engine with seeded random
    this.startNewGame(level.seed);

    // Pre-populate initial board configuration if defined
    if (level.initialBoard && level.initialBoard.length > 0) {
      const board = this.getBoard();
      const grid = board.getGrid();

      for (const cellData of level.initialBoard) {
        if (
          cellData.r >= 0 &&
          cellData.r < Board.SIZE &&
          cellData.c >= 0 &&
          cellData.c < Board.SIZE
        ) {
          grid[cellData.r][cellData.c] = {
            state: 'OCCUPIED',
            color: cellData.color || '#00F0FF',
          };
        }
      }

      this.board = new Board(grid);
    }
  }

  /**
   * Overrides placePiece to manage move limits and objective evaluation
   */
  public placeAdventurePiece(trayIndex: number, startR: number, startC: number): AdventureMoveResult {
    const baseResult = this.placePiece(trayIndex, startR, startC);

    if (!baseResult.success || !this.currentLevel) {
      return {
        ...baseResult,
        isObjectiveComplete: this.isLevelComplete,
        starsEarned: 0,
        movesRemaining: this.getMovesRemaining(),
      };
    }

    // Update Adventure stats
    this.levelMovesUsed++;
    this.levelLinesCleared += baseResult.linesCleared;

    const currentStats = this.getGameplayStats();

    // Check Objective completion
    const objectiveDone = ObjectiveEvaluator.isObjectiveComplete(
      this.currentLevel.objective,
      currentStats
    );

    if (objectiveDone) {
      this.isLevelComplete = true;
    }

    // Check move limit depletion
    const movesLeft = this.getMovesRemaining();
    let isGameOverOverride = baseResult.isGameOver;

    if (movesLeft !== null && movesLeft <= 0 && !this.isLevelComplete) {
      isGameOverOverride = true;
      this.setStatus('GAMEOVER');
    }

    const stars = this.isLevelComplete
      ? ObjectiveEvaluator.calculateStars(this.currentLevel, currentStats)
      : 0;

    return {
      ...baseResult,
      isGameOver: isGameOverOverride,
      isObjectiveComplete: this.isLevelComplete,
      starsEarned: stars,
      movesRemaining: movesLeft,
    };
  }

  public override executePulse(r: number, c: number): NovaActionResult {
    const result = super.executePulse(r, c);
    if (result.success && result.linesCleared && result.linesCleared > 0) {
      this.levelLinesCleared += result.linesCleared;
    }
    if (this.currentLevel) {
      const currentStats = this.getGameplayStats();
      if (ObjectiveEvaluator.isObjectiveComplete(this.currentLevel.objective, currentStats)) {
        this.isLevelComplete = true;
      }
    }
    return result;
  }

  public getGameplayStats(): GameplayStats {
    return {
      score: this.getScore(),
      linesCleared: this.levelLinesCleared,
      maxCombo: this.getComboCount(),
      movesUsed: this.levelMovesUsed,
    };
  }

  public getMovesRemaining(): number | null {
    if (!this.currentLevel || this.currentLevel.moveLimit === undefined) {
      return null;
    }
    return Math.max(0, this.currentLevel.moveLimit - this.levelMovesUsed);
  }

  public getCurrentLevel(): AdventureLevel | null {
    return this.currentLevel;
  }

  public getIsLevelComplete(): boolean {
    return this.isLevelComplete;
  }
}
