import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from '../Storage';
import { AchievementConfig, PlayerAchievementState, RewardItem } from '../../game/economy/EconomyTypes';
import { INITIAL_ACHIEVEMENTS } from '../../game/economy/EconomyConfig';
import { EconomyService } from './EconomyService';
import { XPService } from './XPService';

const LOCAL_ACHIEVEMENTS_KEY = 'block_nova_player_achievements';

export interface UnlockedAchievementEvent {
  config: AchievementConfig;
  rewards: RewardItem[];
}

export class AchievementService {
  /**
   * Get all achievements merged with player progress
   */
  public static async getAchievements(playerId?: string): Promise<{
    config: AchievementConfig;
    state: PlayerAchievementState;
  }[]> {
    let states: Record<string, PlayerAchievementState> = {};

    if (playerId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('player_achievements')
          .select('*')
          .eq('player_id', playerId);

        if (data && !error) {
          data.forEach((item: any) => {
            states[item.achievement_id] = {
              achievementId: item.achievement_id,
              progress: item.progress,
              completed: item.completed,
              completedAt: item.completed_at,
              rewardClaimed: item.reward_claimed,
            };
          });
          await StorageService.setItem(LOCAL_ACHIEVEMENTS_KEY, states);
        }
      } catch (err) {
        console.warn('AchievementService.getAchievements cloud fetch failed', err);
      }
    }

    if (Object.keys(states).length === 0) {
      states = (await StorageService.getItem<Record<string, PlayerAchievementState>>(LOCAL_ACHIEVEMENTS_KEY)) || {};
    }

    return INITIAL_ACHIEVEMENTS.map(config => ({
      config,
      state: states[config.id] || {
        achievementId: config.id,
        progress: 0,
        completed: false,
        rewardClaimed: false,
      },
    }));
  }

  /**
   * Update achievement progress and automatically grant rewards upon completion
   */
  public static async updateProgress(
    playerId: string,
    achievementId: string,
    currentProgressValue: number
  ): Promise<UnlockedAchievementEvent | null> {
    const allAchievements = await this.getAchievements(playerId);
    const item = allAchievements.find(a => a.config.id === achievementId);
    if (!item) return null;

    const { config, state } = item;
    if (state.completed && state.rewardClaimed) return null;

    const newProgress = Math.min(Math.max(state.progress, currentProgressValue), config.target);
    const isCompleted = newProgress >= config.target;

    const updatedState: PlayerAchievementState = {
      achievementId,
      progress: newProgress,
      completed: isCompleted,
      completedAt: isCompleted ? (state.completedAt || new Date().toISOString()) : undefined,
      rewardClaimed: isCompleted ? true : state.rewardClaimed,
    };

    // Save locally
    const statesMap = (await StorageService.getItem<Record<string, PlayerAchievementState>>(LOCAL_ACHIEVEMENTS_KEY)) || {};
    statesMap[achievementId] = updatedState;
    await StorageService.setItem(LOCAL_ACHIEVEMENTS_KEY, statesMap);

    // Save to Supabase
    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('player_achievements').upsert({
          player_id: playerId,
          achievement_id: achievementId,
          progress: updatedState.progress,
          completed: updatedState.completed,
          completed_at: updatedState.completedAt,
          reward_claimed: updatedState.rewardClaimed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'player_id,achievement_id' });
      } catch (err) {
        console.warn('AchievementService.updateProgress cloud update failed', err);
      }
    }

    // Auto-grant rewards if newly completed
    if (isCompleted && !state.rewardClaimed) {
      for (const reward of config.rewards) {
        if (reward.type === 'COINS') {
          await EconomyService.addCoins(
            playerId,
            reward.amount,
            `Achievement: ${config.title}`,
            `ach_reward_${playerId}_${achievementId}_coins`,
            'ACHIEVEMENT'
          );
        } else if (reward.type === 'XP') {
          await XPService.addXP(playerId, reward.amount);
        }
      }

      return { config, rewards: config.rewards };
    }

    return null;
  }

  /**
   * Evaluate all achievements based on player statistics
   */
  public static async evaluateAll(
    playerId: string,
    stats: {
      gamesPlayed: number;
      totalLinesCleared: number;
      highScore: number;
      longestCombo: number;
      adventureLevelsCompleted: number;
      adventureStars: number;
      dailyChallengesCompleted: number;
      dailyStreak: number;
      novaActivations: number;
      novaPowersUsed: number;
      playerLevel: number;
    }
  ): Promise<UnlockedAchievementEvent[]> {
    const unlocked: UnlockedAchievementEvent[] = [];

    const checks: { id: string; value: number }[] = [
      { id: 'first_steps', value: stats.gamesPlayed },
      { id: 'score_1000', value: stats.highScore },
      { id: 'score_5000', value: stats.highScore },
      { id: 'score_10000', value: stats.highScore },
      { id: 'lines_100', value: stats.totalLinesCleared },
      { id: 'lines_500', value: stats.totalLinesCleared },
      { id: 'combo_5', value: stats.longestCombo },
      { id: 'combo_10', value: stats.longestCombo },
      { id: 'adventure_level_1', value: stats.adventureLevelsCompleted },
      { id: 'adventure_stars_10', value: stats.adventureStars },
      { id: 'daily_first', value: stats.dailyChallengesCompleted },
      { id: 'daily_streak_7', value: stats.dailyStreak },
      { id: 'nova_first_use', value: stats.novaActivations },
      { id: 'nova_powers_10', value: stats.novaPowersUsed },
      { id: 'level_10', value: stats.playerLevel },
      { id: 'level_25', value: stats.playerLevel },
    ];

    for (const check of checks) {
      const result = await this.updateProgress(playerId, check.id, check.value);
      if (result) {
        unlocked.push(result);
      }
    }

    return unlocked;
  }
}
