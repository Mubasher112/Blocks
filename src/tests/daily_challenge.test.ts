import { describe, it, expect } from 'vitest';
import { DailyChallengeGenerator } from '../game/events/DailyChallengeGenerator';
import { DailyChallengeService } from '../services/backend/DailyChallengeService';
import { PlayerProfile } from '../services/backend/AuthService';
import { AdventureEngine } from '../game/adventure/AdventureEngine';

describe('Daily Challenge & Event System', () => {
  const dummyPlayer: PlayerProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: null,
    displayName: 'DailyTester',
    avatarId: 'avatar_1',
    accountStatus: 'GUEST',
    xp: 0,
    level: 1,
    coins: 0,
    totalStars: 0,
    gamesPlayed: 0,
    classicBestScore: 0,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  describe('1. Deterministic ID & Seed Generation', () => {
    it('generates identical challenge ID and seed for the same date', () => {
      const challenge1 = DailyChallengeGenerator.generateForDate('2026-09-05');
      const challenge2 = DailyChallengeGenerator.generateForDate('2026-09-05');

      expect(challenge1.id).toBe('daily:2026-09-05');
      expect(challenge1.seed).toBe(challenge2.seed);
      expect(challenge1.difficulty).toBe(challenge2.difficulty);
      expect(challenge1.title).toBe(challenge2.title);
    });

    it('generates different seeds and challenge parameters for different dates', () => {
      const challenge1 = DailyChallengeGenerator.generateForDate('2026-09-05');
      const challenge2 = DailyChallengeGenerator.generateForDate('2026-09-06');

      expect(challenge1.id).toBe('daily:2026-09-05');
      expect(challenge2.id).toBe('daily:2026-09-06');
      expect(challenge1.seed).not.toBe(challenge2.seed);
    });
  });

  describe('2. Result Submission & Local Persistence', () => {
    it('saves first challenge attempt result locally', async () => {
      const challenge = DailyChallengeGenerator.generateForDate('2026-09-05');

      const res = await DailyChallengeService.submitResult(
        dummyPlayer,
        challenge.id,
        4500,
        10,
        15,
        true
      );

      expect(res.success).toBe(true);
      expect(res.bestScore).toBe(4500);
      expect(res.streakInfo.currentStreak).toBe(1);
    });

    it('updates best score when a higher score is submitted', async () => {
      const challenge = DailyChallengeGenerator.generateForDate('2026-09-05');

      await DailyChallengeService.submitResult(
        dummyPlayer,
        challenge.id,
        4500,
        10,
        15,
        true
      );

      const res2 = await DailyChallengeService.submitResult(
        dummyPlayer,
        challenge.id,
        6200,
        14,
        18,
        true
      );

      expect(res2.bestScore).toBe(6200);
    });

    it('retains previous best score when a lower score is submitted', async () => {
      const challenge = DailyChallengeGenerator.generateForDate('2026-09-05');

      await DailyChallengeService.submitResult(
        dummyPlayer,
        challenge.id,
        6200,
        14,
        18,
        true
      );

      const res3 = await DailyChallengeService.submitResult(
        dummyPlayer,
        challenge.id,
        5100,
        11,
        16,
        true
      );

      expect(res3.bestScore).toBe(6200);
    });

    it('retrieves player best score via getPlayerDailyBest', async () => {
      const challenge = DailyChallengeGenerator.generateForDate('2026-09-05');
      const best = await DailyChallengeService.getPlayerDailyBest(challenge.id);
      expect(best).toBe(6200);
    });
  });

  describe('3. Streak Tracking', () => {
    it('increments streak on consecutive day completion', async () => {
      const challengeDay1 = DailyChallengeGenerator.generateForDate('2026-09-01');
      const challengeDay2 = DailyChallengeGenerator.generateForDate('2026-09-02');

      const res1 = await DailyChallengeService.submitResult(
        dummyPlayer,
        challengeDay1.id,
        3000,
        8,
        12,
        true
      );
      expect(res1.streakInfo.currentStreak).toBe(1);

      const res2 = await DailyChallengeService.submitResult(
        dummyPlayer,
        challengeDay2.id,
        3500,
        9,
        14,
        true
      );
      expect(res2.streakInfo.currentStreak).toBe(2);
      expect(res2.streakInfo.longestStreak).toBe(2);
    });

    it('resets streak to 1 if a day is missed', async () => {
      const challengeDay1 = DailyChallengeGenerator.generateForDate('2026-09-01');
      const challengeDay3 = DailyChallengeGenerator.generateForDate('2026-09-03'); // Missed Sep 2

      await DailyChallengeService.submitResult(
        dummyPlayer,
        challengeDay1.id,
        3000,
        8,
        12,
        true
      );

      const res3 = await DailyChallengeService.submitResult(
        dummyPlayer,
        challengeDay3.id,
        4000,
        10,
        15,
        true
      );

      expect(res3.streakInfo.currentStreak).toBe(1); // Reset to 1
    });
  });

  describe('4. Daily Challenge Gameplay Loop', () => {
    it('initializes AdventureEngine with daily challenge parameters and places pieces', () => {
      const challenge = DailyChallengeGenerator.generateForDate('2026-09-05');
      const adventureEngine = new AdventureEngine();

      adventureEngine.startLevel({
        id: challenge.id,
        worldId: 'daily',
        levelNumber: 1,
        name: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        objective: challenge.objective,
        moveLimit: challenge.moveLimit,
        starRequirements: { twoStarScore: 1000, threeStarScore: 2000 },
        rewards: challenge.rewards,
        seed: challenge.seed,
        initialBoard: challenge.initialBoard,
      });

      expect(adventureEngine.getStatus()).toBe('PLAYING');
      expect(adventureEngine.getCurrentLevel()?.id).toBe(challenge.id);
      expect(adventureEngine.getTray().some(p => p !== null)).toBe(true);

      // Perform a piece placement
      const result = adventureEngine.placeAdventurePiece(0, 0, 0);
      expect(result.success).toBe(true);
      expect(adventureEngine.getScore()).toBeGreaterThan(0);
      expect(adventureEngine.getGameplayStats().movesUsed).toBe(1);
    });
  });
});
