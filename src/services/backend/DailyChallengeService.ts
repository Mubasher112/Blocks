import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PlayerProfile } from './AuthService';
import {
  DailyChallenge,
  DailyChallengeResult,
  StreakInfo,
} from '../../game/events/DailyChallengeTypes';
import { DailyChallengeGenerator } from '../../game/events/DailyChallengeGenerator';

const STORAGE_KEYS = {
  DAILY_CACHED: 'block_nova_daily_challenge_cached',
  DAILY_RESULTS_LOCAL: 'block_nova_daily_results_local',
  DAILY_PENDING_QUEUE: 'block_nova_daily_pending_queue',
  STREAK_LOCAL: 'block_nova_streak_local',
};

export class DailyChallengeService {
  /**
   * Fetches or generates today's canonical Daily Challenge
   */
  public static async getTodayChallenge(): Promise<DailyChallenge> {
    const dateStr = DailyChallengeGenerator.getUtcDateString();
    return this.getChallengeByDate(dateStr);
  }

  /**
   * Fetches or generates Daily Challenge for specific UTC date YYYY-MM-DD
   */
  public static async getChallengeByDate(dateStr: string): Promise<DailyChallenge> {
    const generated = DailyChallengeGenerator.generateForDate(dateStr);

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('id', generated.id)
          .single();

        if (data) {
          return {
            id: data.id,
            challengeDate: data.challenge_date,
            seed: Number(data.seed),
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            objective: data.config.objective,
            targetScore: data.config.targetScore,
            targetLines: data.config.targetLines,
            moveLimit: data.config.moveLimit,
            initialBoard: data.config.initialBoard,
            scoreMultiplier: data.config.scoreMultiplier || 1.0,
            novaConfig: data.config.novaConfig,
            version: data.version,
            rewards: data.config.rewards,
            startsAt: data.starts_at,
            endsAt: data.ends_at,
          };
        }
      } catch (e) {
        console.warn('Supabase fetch challenge failed, falling back to deterministic local generator:', e);
      }
    }

    // Cache generated locally
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CACHED, JSON.stringify(generated));
    return generated;
  }

  /**
   * Submits a Daily Challenge result (idempotently, supports offline queueing)
   */
  public static async submitResult(
    player: PlayerProfile,
    challengeId: string,
    score: number,
    linesCleared: number,
    movesUsed: number,
    completed: boolean
  ): Promise<{ success: boolean; bestScore: number; streakInfo: StreakInfo }> {
    // Local best result tracking
    const localResultsStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RESULTS_LOCAL);
    const localResults: Record<string, DailyChallengeResult> = localResultsStr
      ? JSON.parse(localResultsStr)
      : {};

    const existing = localResults[challengeId];
    const newBest = existing ? Math.max(existing.bestScore, score) : score;

    const updatedResult: DailyChallengeResult = {
      challengeId,
      playerId: player.id,
      score,
      linesCleared,
      movesUsed,
      completed: existing ? existing.completed || completed : completed,
      attemptCount: existing ? existing.attemptCount + 1 : 1,
      bestScore: newBest,
      submittedAt: new Date().toISOString(),
    };

    localResults[challengeId] = updatedResult;
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_RESULTS_LOCAL, JSON.stringify(localResults));

    // Update local streak if completed
    let streakInfo = await this.getStreak(player.id);
    if (completed) {
      const challengeDate = challengeId.replace('daily:', '');
      streakInfo = this.updateLocalStreak(streakInfo, challengeDate);
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_LOCAL, JSON.stringify(streakInfo));
    }

    // Attempt online RPC submission if Supabase available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('submit_daily_challenge_result', {
          p_challenge_id: challengeId,
          p_score: score,
          p_lines_cleared: linesCleared,
          p_moves_used: movesUsed,
          p_completed: completed,
        });

        if (!error && data && data.success) {
          streakInfo = {
            playerId: player.id,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastCompletedDate: challengeId.replace('daily:', ''),
            updatedAt: new Date().toISOString(),
          };
          return { success: true, bestScore: data.best_score, streakInfo };
        }
      } catch (e) {
        console.warn('Supabase submit_daily_challenge_result error, queueing offline:', e);
      }
    }

    // Queue for later sync if offline
    await this.queuePendingSubmission(updatedResult);
    return { success: true, bestScore: newBest, streakInfo };
  }

  /**
   * Syncs pending offline challenge submissions
   */
  public static async syncPendingSubmissions(_player: PlayerProfile): Promise<void> {
    if (!isSupabaseConfigured) return;

    const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PENDING_QUEUE);
    if (!queueStr) return;

    const queue: DailyChallengeResult[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    const remainingQueue: DailyChallengeResult[] = [];

    for (const item of queue) {
      try {
        const { error } = await supabase.rpc('submit_daily_challenge_result', {
          p_challenge_id: item.challengeId,
          p_score: item.score,
          p_lines_cleared: item.linesCleared,
          p_moves_used: item.movesUsed,
          p_completed: item.completed,
        });

        if (error) {
          remainingQueue.push(item);
        }
      } catch {
        remainingQueue.push(item);
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PENDING_QUEUE, JSON.stringify(remainingQueue));
  }

  /**
   * Retrieves player's current streak
   */
  public static async getStreak(playerId: string): Promise<StreakInfo> {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('player_streaks')
          .select('*')
          .eq('player_id', playerId)
          .single();

        if (data) {
          return {
            playerId: data.player_id,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastCompletedDate: data.last_completed_date,
            updatedAt: data.updated_at,
          };
        }
      } catch (e) {
        console.warn('Supabase fetch streak error, using local fallback:', e);
      }
    }

    const localStr = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_LOCAL);
    if (localStr) {
      return JSON.parse(localStr);
    }

    return {
      playerId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves player's best recorded score for a specific challenge
   */
  public static async getPlayerDailyBest(challengeId: string): Promise<number> {
    try {
      const localResultsStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RESULTS_LOCAL);
      if (!localResultsStr) return 0;
      const localResults: Record<string, DailyChallengeResult> = JSON.parse(localResultsStr);
      return localResults[challengeId]?.bestScore || 0;
    } catch (e) {
      console.warn('Error reading local daily best score:', e);
      return 0;
    }
  }

  /**
   * Helper to calculate local streak logic
   */
  private static updateLocalStreak(currentStreak: StreakInfo, challengeDate: string): StreakInfo {
    const prevDate = currentStreak.lastCompletedDate;
    let newCurrent = 1;

    if (!prevDate) {
      newCurrent = 1;
    } else if (prevDate === challengeDate) {
      newCurrent = currentStreak.currentStreak;
    } else {
      const prev = new Date(`${prevDate}T00:00:00Z`);
      const curr = new Date(`${challengeDate}T00:00:00Z`);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

      if (diffDays === 1) {
        newCurrent = currentStreak.currentStreak + 1;
      } else {
        newCurrent = 1;
      }
    }

    const newLongest = Math.max(currentStreak.longestStreak, newCurrent);

    return {
      playerId: currentStreak.playerId,
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastCompletedDate: challengeDate,
      updatedAt: new Date().toISOString(),
    };
  }

  private static async queuePendingSubmission(result: DailyChallengeResult): Promise<void> {
    const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PENDING_QUEUE);
    const queue: DailyChallengeResult[] = queueStr ? JSON.parse(queueStr) : [];
    queue.push(result);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PENDING_QUEUE, JSON.stringify(queue));
  }
}
