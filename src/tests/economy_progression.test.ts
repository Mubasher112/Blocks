import { describe, it, expect, beforeEach } from 'vitest';
import { EconomyService } from '../services/backend/EconomyService';
import { XPService } from '../services/backend/XPService';
import { AchievementService } from '../services/backend/AchievementService';
import { DailyRewardService } from '../services/backend/DailyRewardService';
import { StorageService } from '../services/Storage';
import { ProgressionConfig } from '../game/economy/EconomyConfig';

describe('Economy, Progression & Achievements System', () => {
  const TEST_PLAYER_ID = 'test_player_123';

  beforeEach(async () => {
    await StorageService.removeItem('block_nova_player_economy');
    await StorageService.removeItem('block_nova_coin_ledger');
    await StorageService.removeItem('block_nova_player_achievements');
    await StorageService.removeItem('block_nova_daily_reward_state');
  });

  describe('EconomyService', () => {
    it('starts with zero coins and safe default economy', async () => {
      const econ = await EconomyService.getEconomy(TEST_PLAYER_ID);
      expect(econ.coins).toBe(0);
      expect(econ.level).toBe(1);
      expect(econ.currentXP).toBe(0);
    });

    it('adds coins with idempotent transaction ledger deduplication', async () => {
      const refId = 'reward_test_001';

      const res1 = await EconomyService.addCoins(
        TEST_PLAYER_ID,
        100,
        'Adventure Level 1',
        refId,
        'ADVENTURE_REWARD'
      );
      expect(res1.success).toBe(true);
      expect(res1.newBalance).toBe(100);
      expect(res1.duplicate).toBe(false);

      // Duplicate request with same reference ID
      const res2 = await EconomyService.addCoins(
        TEST_PLAYER_ID,
        100,
        'Adventure Level 1',
        refId,
        'ADVENTURE_REWARD'
      );
      expect(res2.success).toBe(true);
      expect(res2.newBalance).toBe(100);
      expect(res2.duplicate).toBe(true);
    });

    it('prevents negative coin balance on spending', async () => {
      await EconomyService.addCoins(TEST_PLAYER_ID, 150, 'Initial Grant', 'ref_init');

      const canAfford = await EconomyService.canAfford(TEST_PLAYER_ID, 200);
      expect(canAfford).toBe(false);

      const spendRes = await EconomyService.spendCoins(
        TEST_PLAYER_ID,
        200,
        'Cosmetic Item',
        'ref_spend_001'
      );
      expect(spendRes.success).toBe(false);
      expect(spendRes.newBalance).toBe(150);

      const successfulSpend = await EconomyService.spendCoins(
        TEST_PLAYER_ID,
        50,
        'Cosmetic Item',
        'ref_spend_002'
      );
      expect(successfulSpend.success).toBe(true);
      expect(successfulSpend.newBalance).toBe(100);
    });
  });

  describe('XPService & Level Curve', () => {
    it('calculates correct level curve requirements', () => {
      expect(ProgressionConfig.getXPRequiredForLevel(1)).toBe(0);
      expect(ProgressionConfig.getXPRequiredForLevel(2)).toBeGreaterThan(0);
      expect(ProgressionConfig.getXPRequiredForLevel(10)).toBeGreaterThan(
        ProgressionConfig.getXPRequiredForLevel(5)
      );
    });

    it('handles XP addition and level-ups with coin rewards', async () => {
      const level2Requirement = ProgressionConfig.getXPRequiredForLevel(2);

      const xpRes = await XPService.addXP(TEST_PLAYER_ID, level2Requirement + 50);

      expect(xpRes.economy.level).toBe(2);
      expect(xpRes.levelUpEvents.length).toBe(1);
      expect(xpRes.levelUpEvents[0].newLevel).toBe(2);
      expect(xpRes.economy.coins).toBeGreaterThan(0); // Granted level-up coin reward
    });

    it('handles multi-level jumps when gaining large XP', async () => {
      const level5Requirement = ProgressionConfig.getXPRequiredForLevel(5);

      const xpRes = await XPService.addXP(TEST_PLAYER_ID, level5Requirement + 100);

      expect(xpRes.economy.level).toBeGreaterThanOrEqual(5);
      expect(xpRes.levelUpEvents.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('DailyRewardService', () => {
    it('allows claiming Day 1 daily reward on new account', async () => {
      const canClaim = await DailyRewardService.canClaim(TEST_PLAYER_ID);
      expect(canClaim.canClaim).toBe(true);
      expect(canClaim.todayDay).toBe(1);

      const claimRes = await DailyRewardService.claimTodayReward(TEST_PLAYER_ID);
      expect(claimRes.success).toBe(true);
      expect(claimRes.currentRewardDay).toBe(1);

      // Same-day duplicate claim attempt
      const duplicateClaim = await DailyRewardService.canClaim(TEST_PLAYER_ID);
      expect(duplicateClaim.canClaim).toBe(false);
    });
  });

  describe('AchievementService', () => {
    it('evaluates binary and progressive achievements and grants rewards', async () => {
      const unlocked = await AchievementService.evaluateAll(TEST_PLAYER_ID, {
        gamesPlayed: 1,
        totalLinesCleared: 100,
        highScore: 12000,
        longestCombo: 5,
        adventureLevelsCompleted: 1,
        adventureStars: 10,
        dailyChallengesCompleted: 1,
        dailyStreak: 7,
        novaActivations: 1,
        novaPowersUsed: 10,
        playerLevel: 10,
      });

      expect(unlocked.length).toBeGreaterThan(0);

      const firstStepsUnlocked = unlocked.some(u => u.config.id === 'first_steps');
      expect(firstStepsUnlocked).toBe(true);

      const econ = await EconomyService.getEconomy(TEST_PLAYER_ID);
      expect(econ.coins).toBeGreaterThan(0);
    });
  });
});
