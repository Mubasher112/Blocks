/**
 * Haptics service for Web Vibration API
 */
export class HapticsService {
  private hapticsEnabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.hapticsEnabled = enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.hapticsEnabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptics permissions error
      }
    }
  }

  public pickup(): void {
    this.vibrate(10);
  }

  public place(): void {
    this.vibrate(20);
  }

  public clear(): void {
    this.vibrate([30, 40, 30]);
  }

  public combo(): void {
    this.vibrate([40, 50, 60]);
  }

  public gameOver(): void {
    this.vibrate([80, 100, 120]);
  }
}

export const haptics = new HapticsService();
