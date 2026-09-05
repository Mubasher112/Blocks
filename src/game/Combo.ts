export class ComboTracker {
  private comboCount: number = 0;
  private maxCombo: number = 0;

  constructor(initialCombo: number = 0, initialMaxCombo: number = 0) {
    this.comboCount = initialCombo;
    this.maxCombo = initialMaxCombo;
  }

  /**
   * Called on piece placement.
   * If lines were cleared, increments combo.
   * If no lines cleared, resets combo to 0.
   */
  public registerTurn(linesCleared: number): {
    comboCount: number;
    isComboActive: boolean;
    maxCombo: number;
  } {
    if (linesCleared > 0) {
      this.comboCount++;
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
    } else {
      this.comboCount = 0;
    }

    return {
      comboCount: this.comboCount,
      isComboActive: this.comboCount > 1,
      maxCombo: this.maxCombo,
    };
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getMaxCombo(): number {
    return this.maxCombo;
  }

  public reset(): void {
    this.comboCount = 0;
    this.maxCombo = 0;
  }
}
