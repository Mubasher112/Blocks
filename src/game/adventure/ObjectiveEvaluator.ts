import { AdventureLevel, LevelObjective } from './AdventureTypes';

export interface GameplayStats {
  score: number;
  linesCleared: number;
  maxCombo: number;
  movesUsed: number;
}

export class ObjectiveEvaluator {
  /**
   * Evaluates if a given level objective is fulfilled by current gameplay stats
   */
  public static isObjectiveComplete(objective: LevelObjective, stats: GameplayStats): boolean {
    switch (objective.type) {
      case 'SCORE':
        return stats.score >= objective.targetScore;
      case 'LINES':
        return stats.linesCleared >= objective.targetLines;
      case 'COMBO':
        return stats.maxCombo >= objective.targetCombo;
      case 'COMPOSITE':
        return objective.objectives.every(obj => this.isObjectiveComplete(obj, stats));
      default:
        return false;
    }
  }

  /**
   * Evaluates number of stars earned based on completed level stats
   */
  public static calculateStars(level: AdventureLevel, stats: GameplayStats): number {
    const isCompleted = this.isObjectiveComplete(level.objective, stats);
    if (!isCompleted) return 0;

    let stars = 1; // 1 star for meeting main objective

    if (stats.score >= level.starRequirements.threeStarScore) {
      stars = 3;
    } else if (stats.score >= level.starRequirements.twoStarScore) {
      stars = 2;
    }

    return stars;
  }

  /**
   * Calculates progress percentage for UI progress bars (0 to 100)
   */
  public static getObjectiveProgress(objective: LevelObjective, stats: GameplayStats): number {
    switch (objective.type) {
      case 'SCORE':
        return Math.min(100, Math.floor((stats.score / objective.targetScore) * 100));
      case 'LINES':
        return Math.min(100, Math.floor((stats.linesCleared / objective.targetLines) * 100));
      case 'COMBO':
        return Math.min(100, Math.floor((stats.maxCombo / objective.targetCombo) * 100));
      case 'COMPOSITE': {
        const sum = objective.objectives.reduce(
          (acc, subObj) => acc + this.getObjectiveProgress(subObj, stats),
          0
        );
        return Math.floor(sum / objective.objectives.length);
      }
      default:
        return 0;
    }
  }
}
