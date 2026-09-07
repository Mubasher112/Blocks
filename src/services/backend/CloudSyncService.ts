import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from '../Storage';
import { GameStats } from '../../game/GameEngine';
import { AdventureProgress } from '../../game/adventure/AdventureTypes';
import { EconomyService } from './EconomyService';
import { PlayerEconomy } from '../../game/economy/EconomyTypes';

export interface SyncResult {
  synced: boolean;
  conflictResolved: boolean;
  mergedStats: GameStats;
  mergedAdventure: AdventureProgress;
  mergedEconomy: PlayerEconomy;
}

export class CloudSyncService {
  /**
   * Resolves conflicts between local and cloud states using a non-destructive merge policy
   */
  public static resolveConflict(
    localStats: GameStats,
    cloudStats: GameStats,
    localAdventure: AdventureProgress,
    cloudAdventure: AdventureProgress
  ): { mergedStats: GameStats; mergedAdventure: AdventureProgress } {
    // Merge Classic Stats (take maximum values for high scores, combos, totals)
    const mergedStats: GameStats = {
      gamesPlayed: Math.max(localStats.gamesPlayed, cloudStats.gamesPlayed),
      totalLinesCleared: Math.max(localStats.totalLinesCleared, cloudStats.totalLinesCleared),
      totalBlocksPlaced: Math.max(localStats.totalBlocksPlaced, cloudStats.totalBlocksPlaced),
      highScore: Math.max(localStats.highScore, cloudStats.highScore),
      longestCombo: Math.max(localStats.longestCombo, cloudStats.longestCombo),
    };

    // Merge Completed Adventure Levels
    const mergedCompletedLevels = { ...cloudAdventure.completedLevels };

    for (const [levelId, localData] of Object.entries(localAdventure.completedLevels)) {
      const cloudData = mergedCompletedLevels[levelId];
      if (!cloudData) {
        mergedCompletedLevels[levelId] = localData;
      } else {
        mergedCompletedLevels[levelId] = {
          stars: Math.max(localData.stars, cloudData.stars),
          bestScore: Math.max(localData.bestScore, cloudData.bestScore),
        };
      }
    }

    const totalStars = Object.values(mergedCompletedLevels).reduce(
      (sum, item) => sum + item.stars,
      0
    );

    const mergedAdventure: AdventureProgress = {
      unlockedWorldId:
        localAdventure.unlockedLevelNumber > cloudAdventure.unlockedLevelNumber
          ? localAdventure.unlockedWorldId
          : cloudAdventure.unlockedWorldId,
      unlockedLevelNumber: Math.max(
        localAdventure.unlockedLevelNumber,
        cloudAdventure.unlockedLevelNumber
      ),
      completedLevels: mergedCompletedLevels,
      totalStars,
      coins: Math.max(localAdventure.coins, cloudAdventure.coins),
      xp: Math.max(localAdventure.xp, cloudAdventure.xp),
      playerLevel: Math.max(localAdventure.playerLevel, cloudAdventure.playerLevel),
    };

    return { mergedStats, mergedAdventure };
  }

  /**
   * Performs local-first cloud synchronization
   */
  public static async sync(playerId: string): Promise<SyncResult> {
    const localStats = await StorageService.loadStats();
    const localAdventure = await StorageService.loadAdventureProgress();

    if (!isSupabaseConfigured) {
      const localEcon = await EconomyService.getEconomy(playerId);
      return {
        synced: true,
        conflictResolved: false,
        mergedStats: localStats,
        mergedAdventure: localAdventure,
        mergedEconomy: localEcon,
      };
    }

    try {
      // 1. Fetch Cloud Records
      const { data: cloudStatsData } = await supabase
        .from('classic_statistics')
        .select('*')
        .eq('player_id', playerId)
        .single();

      const { data: cloudAdvData } = await supabase
        .from('adventure_progress')
        .select('*')
        .eq('player_id', playerId)
        .single();

      let cloudStats: GameStats = localStats;
      if (cloudStatsData) {
        cloudStats = {
          gamesPlayed: localStats.gamesPlayed,
          totalLinesCleared: cloudStatsData.total_lines_cleared || 0,
          totalBlocksPlaced: cloudStatsData.total_blocks_placed || 0,
          highScore: cloudStatsData.high_score || 0,
          longestCombo: cloudStatsData.longest_combo || 0,
        };
      }

      let cloudAdventure: AdventureProgress = localAdventure;
      if (cloudAdvData) {
        cloudAdventure = {
          unlockedWorldId: cloudAdvData.unlocked_world_id || 'world-1',
          unlockedLevelNumber: cloudAdvData.unlocked_level_number || 1,
          completedLevels: cloudAdvData.completed_levels || {},
          totalStars: cloudAdvData.total_stars || 0,
          coins: cloudAdvData.coins || 0,
          xp: cloudAdvData.xp || 0,
          playerLevel: cloudAdvData.player_level || 1,
        };
      }

      // 2. Resolve Conflict & Merge Progress
      const { mergedStats, mergedAdventure } = this.resolveConflict(
        localStats,
        cloudStats,
        localAdventure,
        cloudAdventure
      );

      // 3. Persist Merged Progress Locally
      await StorageService.saveStats(mergedStats);
      await StorageService.saveAdventureProgress(mergedAdventure);

      // 4. Upload Merged Progress to Supabase Cloud
      await supabase.from('classic_statistics').upsert({
        player_id: playerId,
        high_score: mergedStats.highScore,
        total_lines_cleared: mergedStats.totalLinesCleared,
        total_blocks_placed: mergedStats.totalBlocksPlaced,
        longest_combo: mergedStats.longestCombo,
      });

      await supabase.from('adventure_progress').upsert({
        player_id: playerId,
        unlocked_world_id: mergedAdventure.unlockedWorldId,
        unlocked_level_number: mergedAdventure.unlockedLevelNumber,
        completed_levels: mergedAdventure.completedLevels,
        total_stars: mergedAdventure.totalStars,
        coins: mergedAdventure.coins,
        xp: mergedAdventure.xp,
        player_level: mergedAdventure.playerLevel,
      });

      const cloudEcon = await EconomyService.getEconomy(playerId);

      return {
        synced: true,
        conflictResolved: true,
        mergedStats,
        mergedAdventure,
        mergedEconomy: cloudEcon,
      };
    } catch (e) {
      console.warn('CloudSync error (operating offline):', e);
      const localEcon = await EconomyService.getEconomy(playerId);
      return {
        synced: false,
        conflictResolved: false,
        mergedStats: localStats,
        mergedAdventure: localAdventure,
        mergedEconomy: localEcon,
      };
    }
  }
}
