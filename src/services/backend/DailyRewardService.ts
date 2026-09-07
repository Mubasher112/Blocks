import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from '../Storage';
import { DailyRewardState, RewardItem } from '../../game/economy/EconomyTypes';
import { DAILY_REWARD_CALENDAR } from '../../game/economy/EconomyConfig';
import { EconomyService } from './EconomyService';
import { XPService } from './XPService';

const LOCAL_DAILY_REWARD_KEY = 'block_nova_daily_reward_state';

export class DailyRewardService {
  /**
   * Get current UTC date string YYYY-MM-DD
   */
  public static getTodayUTCDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get Daily Reward State
   */
  public static async getState(playerId?: string): Promise<DailyRewardState> {
    if (playerId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('daily_rewards_state')
          .select('current_reward_day, last_claimed_date, last_claimed_at')
          .eq('player_id', playerId)
          .single();

        if (data && !error) {
          const state: DailyRewardState = {
            currentRewardDay: data.current_reward_day,
            lastClaimedDate: data.last_claimed_date,
            lastClaimedAt: data.last_claimed_at,
          };
          await StorageService.setItem(LOCAL_DAILY_REWARD_KEY, state);
          return state;
        }
      } catch (err) {
        console.warn('DailyRewardService.getState cloud fetch failed', err);
      }
    }

    const localState = await StorageService.getItem<DailyRewardState>(LOCAL_DAILY_REWARD_KEY);
    return (
      localState || {
        currentRewardDay: 1,
        lastClaimedDate: null,
        lastClaimedAt: null,
      }
    );
  }

  /**
   * Check if player can claim today's daily reward
   */
  public static async canClaim(playerId: string): Promise<{ canClaim: boolean; todayDay: number }> {
    const state = await this.getState(playerId);
    const today = this.getTodayUTCDateString();

    if (!state.lastClaimedDate) {
      return { canClaim: true, todayDay: 1 };
    }

    if (state.lastClaimedDate === today) {
      return { canClaim: false, todayDay: state.currentRewardDay };
    }

    // Check date difference
    const lastDate = new Date(state.lastClaimedDate);
    const currentDate = new Date(today);
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Consecutive day claim
      const nextDay = state.currentRewardDay >= 7 ? 1 : state.currentRewardDay + 1;
      return { canClaim: true, todayDay: nextDay };
    } else if (diffDays > 1) {
      // Missed a day -> reset to Day 1
      return { canClaim: true, todayDay: 1 };
    } else {
      // Device clock set backward
      return { canClaim: false, todayDay: state.currentRewardDay };
    }
  }

  /**
   * Claim today's daily reward idempotently
   */
  public static async claimTodayReward(
    playerId: string
  ): Promise<{ success: boolean; rewards: RewardItem[]; currentRewardDay: number; message?: string }> {
    const { canClaim, todayDay } = await this.canClaim(playerId);
    if (!canClaim) {
      return { success: false, rewards: [], currentRewardDay: todayDay, message: 'Already claimed today' };
    }

    const today = this.getTodayUTCDateString();
    const dayConfig = DAILY_REWARD_CALENDAR.find(d => d.day === todayDay) || DAILY_REWARD_CALENDAR[0];

    const rewards: RewardItem[] = [
      { type: 'COINS', amount: dayConfig.coins },
      { type: 'XP', amount: dayConfig.xp },
    ];

    const refId = `daily_reward_${playerId}_${today}_day_${todayDay}`;

    // Add Coins with idempotency check
    const coinRes = await EconomyService.addCoins(
      playerId,
      dayConfig.coins,
      `Daily Reward Day ${todayDay}`,
      refId,
      'DAILY_REWARD'
    );

    if (coinRes.duplicate) {
      return { success: false, rewards: [], currentRewardDay: todayDay, message: 'Reward already granted' };
    }

    // Add XP
    await XPService.addXP(playerId, dayConfig.xp);

    const newState: DailyRewardState = {
      currentRewardDay: todayDay,
      lastClaimedDate: today,
      lastClaimedAt: new Date().toISOString(),
    };

    await StorageService.setItem(LOCAL_DAILY_REWARD_KEY, newState);

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('daily_rewards_state').upsert(
          {
            player_id: playerId,
            current_reward_day: todayDay,
            last_claimed_date: today,
            last_claimed_at: newState.lastClaimedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'player_id' }
        );
      } catch (err) {
        console.warn('DailyRewardService.claimTodayReward cloud save failed', err);
      }
    }

    return { success: true, rewards, currentRewardDay: todayDay };
  }
}
