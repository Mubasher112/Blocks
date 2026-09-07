import { EconomyService } from './EconomyService';
import { XPService, LevelUpEvent } from './XPService';
import { RewardBundle, RewardItem } from '../../game/economy/EconomyTypes';

export interface ProcessedRewardResult {
  coinsAdded: number;
  xpAdded: number;
  levelUpEvents: LevelUpEvent[];
  newBalance: number;
  totalXP: number;
  level: number;
}

export class RewardService {
  /**
   * Process a unified reward bundle (Coins + XP) atomically with idempotency
   */
  public static async grantRewardBundle(
    playerId: string,
    bundle: RewardBundle
  ): Promise<ProcessedRewardResult> {
    let coinsAdded = 0;
    let xpAdded = 0;

    for (const reward of bundle.rewards) {
      if (reward.type === 'COINS') {
        coinsAdded += reward.amount;
      } else if (reward.type === 'XP') {
        xpAdded += reward.amount;
      }
    }

    // Process Coins if any
    if (coinsAdded > 0) {
      await EconomyService.addCoins(
        playerId,
        coinsAdded,
        bundle.source,
        bundle.referenceId,
        'GAME_REWARD'
      );
    }

    // Process XP if any
    let levelUpEvents: LevelUpEvent[] = [];
    let econAfterXP = await EconomyService.getEconomy(playerId);

    if (xpAdded > 0) {
      const xpRes = await XPService.addXP(playerId, xpAdded);
      levelUpEvents = xpRes.levelUpEvents;
      econAfterXP = xpRes.economy;
    }

    return {
      coinsAdded,
      xpAdded,
      levelUpEvents,
      newBalance: econAfterXP.coins,
      totalXP: econAfterXP.totalXP,
      level: econAfterXP.level,
    };
  }

  /**
   * Convenience helper for single rewards
   */
  public static async grantSingleReward(
    playerId: string,
    source: string,
    referenceId: string,
    reward: RewardItem
  ): Promise<ProcessedRewardResult> {
    return this.grantRewardBundle(playerId, {
      source,
      referenceId,
      rewards: [reward],
    });
  }
}
