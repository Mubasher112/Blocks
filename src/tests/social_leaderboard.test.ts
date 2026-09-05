import { describe, it, expect } from 'vitest';
import { ScoreService } from '../services/backend/ScoreService';
import { SocialService } from '../services/backend/SocialService';
import { PlayerProfile } from '../services/backend/AuthService';

describe('ScoreService & Validation', () => {
  it('validates score bounds to prevent client cheating', () => {
    expect(ScoreService.validateScore(-10)).toBe(false);
    expect(ScoreService.validateScore(NaN)).toBe(false);
    expect(ScoreService.validateScore(20000000)).toBe(false); // exceeds upper limit
    expect(ScoreService.validateScore(15000)).toBe(true);
  });

  it('generates deterministic ISO weekly period key (e.g. 2026-W36)', () => {
    const testDate = new Date('2026-09-05T12:00:00Z');
    const weekKey = ScoreService.getWeeklyPeriodKey(testDate);
    expect(weekKey).toBe('2026-W36');
  });

  it('generates daily challenge period key (e.g. 2026-09-05)', () => {
    const testDate = new Date('2026-09-05T12:00:00Z');
    const dailyKey = ScoreService.getDailyPeriodKey(testDate);
    expect(dailyKey).toBe('2026-09-05');
  });

  it('preserves highest score upon submission', async () => {
    const dummyPlayer: PlayerProfile = {
      id: 'p_test_1',
      userId: null,
      displayName: 'TestPlayer',
      avatarId: 'avatar_1',
      accountStatus: 'GUEST',
      xp: 0,
      level: 1,
      coins: 0,
      totalStars: 0,
      gamesPlayed: 1,
      classicBestScore: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    await ScoreService.submitScore(dummyPlayer, 'CLASSIC_ALL_TIME', 'ALL_TIME', 5000);
    expect(ScoreService.getMockScore('p_test_1_CLASSIC_ALL_TIME_ALL_TIME')).toBe(5000);

    // Worse score submitted -> keeps 5000
    await ScoreService.submitScore(dummyPlayer, 'CLASSIC_ALL_TIME', 'ALL_TIME', 3000);
    expect(ScoreService.getMockScore('p_test_1_CLASSIC_ALL_TIME_ALL_TIME')).toBe(5000);

    // Higher score submitted -> updates to 8000
    await ScoreService.submitScore(dummyPlayer, 'CLASSIC_ALL_TIME', 'ALL_TIME', 8000);
    expect(ScoreService.getMockScore('p_test_1_CLASSIC_ALL_TIME_ALL_TIME')).toBe(8000);
  });
});

describe('SocialService & Friends System', () => {
  const senderPlayer: PlayerProfile = {
    id: 'p_sender',
    userId: null,
    displayName: 'SenderPlayer',
    avatarId: 'avatar_1',
    accountStatus: 'GUEST',
    xp: 0,
    level: 1,
    coins: 0,
    totalStars: 0,
    gamesPlayed: 1,
    classicBestScore: 0,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  it('prevents sending a friend request to oneself', async () => {
    const success = await SocialService.sendFriendRequest(senderPlayer, senderPlayer.id);
    expect(success).toBe(false);
  });

  it('sends, fetches, and accepts friend requests', async () => {
    const receiverId = 'p_receiver';
    const sent = await SocialService.sendFriendRequest(senderPlayer, receiverId);
    expect(sent).toBe(true);

    const pending = await SocialService.getPendingRequests(receiverId);
    expect(pending.length).toBeGreaterThan(0);

    const req = pending.find((r) => r.senderId === senderPlayer.id);
    expect(req).toBeDefined();

    if (req) {
      const accepted = await SocialService.acceptFriendRequest(req.id, senderPlayer.id, receiverId);
      expect(accepted).toBe(true);
    }
  });
});
