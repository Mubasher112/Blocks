import { GameEngine } from '../game/GameEngine';

/**
 * Dev-only Debug Service for state inspection and forcing game over
 */
export class DebugService {
  private static isDev = import.meta.env.DEV;

  public static forceGameOver(engine: GameEngine): void {
    if (!this.isDev) return;
    engine.setStatus('GAMEOVER');
  }

  public static addScore(engine: GameEngine, amount: number): void {
    if (!this.isDev) return;
    (engine as any).score += amount;
    if (engine.getScore() > engine.getHighScore()) {
      (engine as any).highScore = engine.getScore();
      (engine as any).stats.highScore = engine.getScore();
    }
  }
}
