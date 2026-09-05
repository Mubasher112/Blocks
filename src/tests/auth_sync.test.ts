import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/backend/AuthService';
import { CloudSyncService } from '../services/backend/CloudSyncService';
import { GameStats } from '../game/GameEngine';
import { AdventureProgress } from '../game/adventure/AdventureTypes';

describe('AuthService & Player Accounts', () => {
  it('creates a new Guest account with default profile', async () => {
    const guest = await AuthService.loginAsGuest();
    expect(guest.id).toBeDefined();
    expect(guest.accountStatus).toBe('GUEST');
    expect(guest.displayName).toContain('Nova Player');
    expect(guest.avatarId).toBe('avatar_1');
  });

  it('updates display name and avatar ID cleanly', async () => {
    const guest = await AuthService.loginAsGuest();
    const updated = await AuthService.updateProfile(guest, {
      displayName: 'SuperNova',
      avatarId: 'avatar_2',
    });

    expect(updated.displayName).toBe('SuperNova');
    expect(updated.avatarId).toBe('avatar_2');
  });

  it('links Guest account to OAuth provider without changing player ID or progress', async () => {
    const guest = await AuthService.loginAsGuest();
    const linked = await AuthService.linkGuestToProvider(guest, 'google');

    expect(linked.id).toBe(guest.id);
    expect(linked.accountStatus).toBe('LINKED');
  });
});

describe('CloudSyncService & Conflict Resolution', () => {
  it('resolves conflicts by taking maximum high scores, combos, and stars', () => {
    const localStats: GameStats = {
      gamesPlayed: 10,
      totalLinesCleared: 50,
      totalBlocksPlaced: 200,
      highScore: 5000,
      longestCombo: 3,
    };

    const cloudStats: GameStats = {
      gamesPlayed: 12,
      totalLinesCleared: 80,
      totalBlocksPlaced: 300,
      highScore: 7500,
      longestCombo: 5,
    };

    const localAdventure: AdventureProgress = {
      unlockedWorldId: 'world-1',
      unlockedLevelNumber: 3,
      completedLevels: {
        'world-1-level-1': { stars: 3, bestScore: 2000 },
        'world-1-level-2': { stars: 2, bestScore: 1500 },
      },
      totalStars: 5,
      coins: 200,
      xp: 100,
      playerLevel: 2,
    };

    const cloudAdventure: AdventureProgress = {
      unlockedWorldId: 'world-1',
      unlockedLevelNumber: 4,
      completedLevels: {
        'world-1-level-1': { stars: 2, bestScore: 1800 },
        'world-1-level-2': { stars: 3, bestScore: 2200 },
        'world-1-level-3': { stars: 3, bestScore: 3000 },
      },
      totalStars: 8,
      coins: 400,
      xp: 250,
      playerLevel: 3,
    };

    const resolved = CloudSyncService.resolveConflict(
      localStats,
      cloudStats,
      localAdventure,
      cloudAdventure
    );

    // Verify Classic Stats Merging (Highest values preserved)
    expect(resolved.mergedStats.highScore).toBe(7500);
    expect(resolved.mergedStats.longestCombo).toBe(5);

    // Verify Adventure Progress Merging (Best level stars and unlocks merged non-destructively)
    expect(resolved.mergedAdventure.unlockedLevelNumber).toBe(4);
    expect(resolved.mergedAdventure.completedLevels['world-1-level-1'].stars).toBe(3);
    expect(resolved.mergedAdventure.completedLevels['world-1-level-2'].stars).toBe(3);
    expect(resolved.mergedAdventure.completedLevels['world-1-level-3'].stars).toBe(3);
    expect(resolved.mergedAdventure.totalStars).toBe(9); // 3 + 3 + 3
    expect(resolved.mergedAdventure.coins).toBe(400);
  });
});
