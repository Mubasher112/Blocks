import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PlayerProfile } from './AuthService';

export type LeaderboardCategory =
  | 'CLASSIC_ALL_TIME'
  | 'CLASSIC_WEEKLY'
  | 'ADVENTURE_GLOBAL'
  | 'DAILY_CHALLENGE';

export interface ScoreSubmission {
  playerId: string;
  category: LeaderboardCategory;
  periodKey: string; // e.g. 'ALL_TIME' or '2026-W36' or '2026-09-05'
  score: number;
}

export class ScoreService {
  private static mockScores = new Map<string, number>();

  /**
   * Generates a deterministic weekly period key based on ISO week (e.g., '2026-W36')
   */
  public static getWeeklyPeriodKey(date: Date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  /**
   * Generates a daily challenge period key (e.g., '2026-09-05')
   */
  public static getDailyPeriodKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Validates score bounds to prevent client anti-cheat exploitation
   */
  public static validateScore(score: number): boolean {
    if (typeof score !== 'number' || isNaN(score)) return false;
    if (score < 0 || score > 10000000) return false; // Sanity upper bound
    return true;
  }

  /**
   * Submits score to server RPC function with server-side validation and best-score preservation
   */
  public static async submitScore(
    player: PlayerProfile,
    category: LeaderboardCategory,
    periodKey: string,
    score: number
  ): Promise<boolean> {
    if (!this.validateScore(score)) {
      console.warn('Invalid score submission rejected:', score);
      return false;
    }

    if (!isSupabaseConfigured) {
      const key = `${player.id}_${category}_${periodKey}`;
      const existing = this.mockScores.get(key) || 0;
      if (score > existing) {
        this.mockScores.set(key, score);
      }
      return true;
    }

    try {
      const { error } = await supabase.rpc('submit_score', {
        p_player_id: player.id,
        p_category: category,
        p_period_key: periodKey,
        p_score: score,
      });

      if (error) {
        console.warn('Score submission RPC error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Score submission offline/error:', e);
      return false;
    }
  }

  public static getMockScore(key: string): number {
    return this.mockScores.get(key) || 0;
  }
}
