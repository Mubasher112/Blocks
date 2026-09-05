import { GameStats } from '../game/GameEngine';

const STORAGE_KEYS = {
  STATS: 'block_nova_stats_v1',
  SETTINGS: 'block_nova_settings_v1',
};

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
};

export class StorageService {
  /**
   * Saves game statistics
   */
  public static saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }

  /**
   * Loads saved game statistics
   */
  public static loadStats(): GameStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }

    return {
      gamesPlayed: 0,
      totalLinesCleared: 0,
      totalBlocksPlaced: 0,
      highScore: 0,
      longestCombo: 0,
    };
  }

  /**
   * Saves game settings
   */
  public static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }

  /**
   * Loads saved game settings
   */
  public static loadSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }

    return { ...DEFAULT_SETTINGS };
  }
}
