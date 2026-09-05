export interface ScoreConfig {
  pointsPerBlock: number;
  pointsPerLine: number;
  multiLineBonusMultiplier: number;
  comboBonusBase: number;
}

export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  pointsPerBlock: 10,
  pointsPerLine: 100,
  multiLineBonusMultiplier: 1.5,
  comboBonusBase: 50,
};

export class Scoring {
  private config: ScoreConfig;

  constructor(config: ScoreConfig = DEFAULT_SCORE_CONFIG) {
    this.config = config;
  }

  /**
   * Points earned from placing a piece on the board
   */
  public calculatePlacementPoints(blockCount: number): number {
    return blockCount * this.config.pointsPerBlock;
  }

  /**
   * Points earned from clearing lines in a single placement
   * @param lineCount Number of simultaneous lines cleared (rows + columns)
   * @param currentCombo Current active combo count (0 = no streak, 1 = 1st clear, 2+ = combo streak)
   */
  public calculateClearPoints(lineCount: number, currentCombo: number): {
    linePoints: number;
    multiLineBonus: number;
    comboBonus: number;
    totalPoints: number;
  } {
    if (lineCount <= 0) {
      return { linePoints: 0, multiLineBonus: 0, comboBonus: 0, totalPoints: 0 };
    }

    // Base points for lines
    const linePoints = lineCount * this.config.pointsPerLine;

    // Multi-line bonus if clearing > 1 line at once (exponential scaling)
    let multiLineBonus = 0;
    if (lineCount > 1) {
      multiLineBonus = Math.floor(
        linePoints * Math.pow(this.config.multiLineBonusMultiplier, lineCount - 1) - linePoints
      );
    }

    // Combo streak bonus
    let comboBonus = 0;
    if (currentCombo > 1) {
      comboBonus = (currentCombo - 1) * this.config.comboBonusBase * lineCount;
    }

    const totalPoints = linePoints + multiLineBonus + comboBonus;

    return {
      linePoints,
      multiLineBonus,
      comboBonus,
      totalPoints,
    };
  }
}
