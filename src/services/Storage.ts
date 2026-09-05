import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats } from '../game/GameEngine';
import { AdventureProgress } from '../game/adventure/AdventureTypes';

const SAVE_VERSION = 1;

const STORAGE_KEYS = {
  SAVE_VERSION: 'block_nova_save_version',
  STATS: 'block_nova_stats_v1',
  SETTINGS: 'block_nova_settings_v1',
  ACTIVE_GAME: 'block_nova_active_game_v1',
  ADVENTURE_PROGRESS: 'block_nova_adventure_progress_v1',
};

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface ActiveGameState {
  score: number;
  highScore: number;
  comboCount: number;
  grid: { state: string; color: string | null }[][];
  trayShapes: (string | null)[];
  stats: GameStats;
  saveVersion: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
};

export const DEFAULT_ADVENTURE_PROGRESS: AdventureProgress = {
  unlockedWorldId: 'world-1',
  unlockedLevelNumber: 1,
  completedLevels: {},
  totalStars: 0,
  coins: 0,
  xp: 0,
  playerLevel: 1,
};

export class StorageService {
  /**
   * Saves game statistics asynchronously
   */
  public static async saveStats(stats: GameStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      await AsyncStorage.setItem(STORAGE_KEYS.SAVE_VERSION, SAVE_VERSION.toString());
    } catch (e) {
      console.warn('AsyncStorage saveStats error:', e);
    }
  }

  /**
   * Loads saved game statistics
   */
  public static async loadStats(): Promise<GameStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('AsyncStorage loadStats error:', e);
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
   * Saves game settings asynchronously
   */
  public static async saveSettings(settings: GameSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('AsyncStorage saveSettings error:', e);
    }
  }

  /**
   * Loads saved game settings
   */
  public static async loadSettings(): Promise<GameSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('AsyncStorage loadSettings error:', e);
    }

    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Saves active game state
   */
  public static async saveActiveGame(state: ActiveGameState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(state));
    } catch (e) {
      console.warn('AsyncStorage saveActiveGame error:', e);
    }
  }

  /**
   * Loads active game state
   */
  public static async loadActiveGame(): Promise<ActiveGameState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_GAME);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.saveVersion === SAVE_VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('AsyncStorage loadActiveGame error:', e);
    }
    return null;
  }

  /**
   * Clears active game state
   */
  public static async clearActiveGame(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME);
    } catch (e) {
      console.warn('AsyncStorage clearActiveGame error:', e);
    }
  }

  /**
   * Saves Adventure Mode progress asynchronously
   */
  public static async saveAdventureProgress(progress: AdventureProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('AsyncStorage saveAdventureProgress error:', e);
    }
  }

  /**
   * Loads saved Adventure Mode progress
   */
  public static async loadAdventureProgress(): Promise<AdventureProgress> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE_PROGRESS);
      if (data) {
        return { ...DEFAULT_ADVENTURE_PROGRESS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('AsyncStorage loadAdventureProgress error:', e);
    }

    return { ...DEFAULT_ADVENTURE_PROGRESS };
  }
}
