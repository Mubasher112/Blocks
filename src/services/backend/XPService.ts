import { EconomyService } from './EconomyService';
import { PlayerEconomy } from '../../game/economy/EconomyTypes';
import { ProgressionConfig } from '../../game/economy/EconomyConfig';

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
  coinRewardsGranted: number;
}

export class XPService {
  /**
   * Process XP addition and handle potential multi-level-ups and level-up rewards
   */
  public static async addXP(
    playerId: string,
    amount: number
  ): Promise<{ economy: PlayerEconomy; levelUpEvents: LevelUpEvent[] }> {
    if (amount <= 0) {
      const economy = await EconomyService.getEconomy(playerId);
      return { economy, levelUpEvents: [] };
    }

    const economy = await EconomyService.getEconomy(playerId);
    let currentLevel = economy.level;
    let totalXP = Math.min(economy.totalXP + amount, ProgressionConfig.MAX_XP);

    const levelUpEvents: LevelUpEvent[] = [];
    let coinBonusTotal = 0;

    // Check for level ups (supports multi-level jump)
    let nextLevelRequiredXP = ProgressionConfig.getXPRequiredForLevel(currentLevel + 1);

    while (totalXP >= nextLevelRequiredXP) {
      const prevLvl = currentLevel;
      currentLevel += 1;

      const levelCoinBonus = ProgressionConfig.getLevelUpCoinReward(currentLevel);
      coinBonusTotal += levelCoinBonus;

      levelUpEvents.push({
        previousLevel: prevLvl,
        newLevel: currentLevel,
        coinRewardsGranted: levelCoinBonus,
      });

      nextLevelRequiredXP = ProgressionConfig.getXPRequiredForLevel(currentLevel + 1);
    }

    const currentLevelBaseXP = ProgressionConfig.getXPRequiredForLevel(currentLevel);
    const currentXP = totalXP - currentLevelBaseXP;

    const updatedEconomy: PlayerEconomy = {
      coins: economy.coins,
      level: currentLevel,
      currentXP,
      totalXP,
    };

    await EconomyService.saveEconomy(playerId, updatedEconomy);

    // Grant coin rewards for each level up via idempotent transactions
    for (const lvlEvent of levelUpEvents) {
      await EconomyService.addCoins(
        playerId,
        lvlEvent.coinRewardsGranted,
        `Level ${lvlEvent.newLevel} Reward`,
        `lvl_reward_${playerId}_${lvlEvent.newLevel}`,
        'LEVEL_UP'
      );
    }

    // Refresh final economy after level coin rewards
    const finalEconomy = await EconomyService.getEconomy(playerId);
    return { economy: finalEconomy, levelUpEvents };
  }

  /**
   * Get XP details for UI progress bar
   */
  public static getProgressDetails(economy: PlayerEconomy): {
    level: number;
    currentXP: number;
    requiredXP: number;
    progressPercentage: number;
  } {
    const level = economy.level;
    const currentLevelBaseXP = ProgressionConfig.getXPRequiredForLevel(level);
    const nextLevelXP = ProgressionConfig.getXPRequiredForLevel(level + 1);
    const requiredXP = nextLevelXP - currentLevelBaseXP;
    const currentXP = Math.max(0, economy.totalXP - currentLevelBaseXP);

    const progressPercentage = Math.min(100, Math.floor((currentXP / requiredXP) * 100));

    return {
      level,
      currentXP,
      requiredXP,
      progressPercentage,
    };
  }
}
