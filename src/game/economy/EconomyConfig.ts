import { AchievementConfig, DailyRewardDayConfig } from './EconomyTypes';

export class ProgressionConfig {
  // Max cap to prevent overflow
  public static readonly MAX_COINS = 999_999_999;
  public static readonly MAX_XP = 999_999_999;

  // Level XP Requirements Curve (Level 1 to 50+)
  public static getXPRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    // Quadratic progression curve: Level 2 = 300, Level 3 = 700, Level 10 = 5,400, Level 25 = 31,200
    return Math.floor(200 * Math.pow(level - 1, 1.25) + 100 * (level - 1));
  }

  // Level-Up Coin Reward
  public static getLevelUpCoinReward(level: number): number {
    return 50 + (level - 1) * 25;
  }
}

export const DAILY_REWARD_CALENDAR: DailyRewardDayConfig[] = [
  { day: 1, coins: 50, xp: 50 },
  { day: 2, coins: 75, xp: 75 },
  { day: 3, coins: 100, xp: 100 },
  { day: 4, coins: 150, xp: 150 },
  { day: 5, coins: 200, xp: 200 },
  { day: 6, coins: 250, xp: 250 },
  { day: 7, coins: 500, xp: 500 },
];

export const DAILY_STREAK_MILESTONE_REWARDS: { days: number; coins: number; xp: number }[] = [
  { days: 3, coins: 100, xp: 100 },
  { days: 7, coins: 300, xp: 300 },
  { days: 14, coins: 750, xp: 750 },
  { days: 30, coins: 2000, xp: 2000 },
];

export const INITIAL_ACHIEVEMENTS: AchievementConfig[] = [
  // GAMEPLAY
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Play your first game of Block Nova',
    category: 'GAMEPLAY',
    target: 1,
    rewards: [{ type: 'COINS', amount: 50 }, { type: 'XP', amount: 100 }],
    icon: 'Play',
  },

  // SCORE
  {
    id: 'score_1000',
    title: 'Getting Started',
    description: 'Score 1,000 points in a single Classic game',
    category: 'SCORE',
    target: 1000,
    rewards: [{ type: 'COINS', amount: 50 }, { type: 'XP', amount: 100 }],
    icon: 'Trophy',
  },
  {
    id: 'score_5000',
    title: 'High Five',
    description: 'Score 5,000 points in a single Classic game',
    category: 'SCORE',
    target: 5000,
    rewards: [{ type: 'COINS', amount: 150 }, { type: 'XP', amount: 250 }],
    icon: 'Trophy',
  },
  {
    id: 'score_10000',
    title: 'Big Score',
    description: 'Score 10,000 points in a single Classic game',
    category: 'SCORE',
    target: 10000,
    rewards: [{ type: 'COINS', amount: 300 }, { type: 'XP', amount: 500 }],
    icon: 'Trophy',
  },

  // LINES
  {
    id: 'lines_100',
    title: 'Line Master',
    description: 'Clear 100 cumulative lines across all games',
    category: 'LINES',
    target: 100,
    rewards: [{ type: 'COINS', amount: 100 }, { type: 'XP', amount: 200 }],
    icon: 'Grid',
  },
  {
    id: 'lines_500',
    title: 'Line Legend',
    description: 'Clear 500 cumulative lines across all games',
    category: 'LINES',
    target: 500,
    rewards: [{ type: 'COINS', amount: 250 }, { type: 'XP', amount: 500 }],
    icon: 'Grid',
  },

  // COMBO
  {
    id: 'combo_5',
    title: 'Combo Starter',
    description: 'Achieve a combo streak of 5',
    category: 'COMBO',
    target: 5,
    rewards: [{ type: 'COINS', amount: 100 }, { type: 'XP', amount: 150 }],
    icon: 'Flame',
  },
  {
    id: 'combo_10',
    title: 'Combo Master',
    description: 'Achieve a combo streak of 10',
    category: 'COMBO',
    target: 10,
    rewards: [{ type: 'COINS', amount: 300 }, { type: 'XP', amount: 500 }],
    icon: 'Flame',
  },

  // ADVENTURE
  {
    id: 'adventure_level_1',
    title: 'Explorer',
    description: 'Complete your first Adventure level',
    category: 'ADVENTURE',
    target: 1,
    rewards: [{ type: 'COINS', amount: 75 }, { type: 'XP', amount: 100 }],
    icon: 'Map',
  },
  {
    id: 'adventure_stars_10',
    title: 'Star Collector',
    description: 'Earn 10 total Adventure Stars',
    category: 'ADVENTURE',
    target: 10,
    rewards: [{ type: 'COINS', amount: 200 }, { type: 'XP', amount: 300 }],
    icon: 'Star',
  },

  // DAILY
  {
    id: 'daily_first',
    title: 'Daily Player',
    description: 'Complete your first Daily Challenge',
    category: 'DAILY',
    target: 1,
    rewards: [{ type: 'COINS', amount: 100 }, { type: 'XP', amount: 150 }],
    icon: 'Calendar',
  },
  {
    id: 'daily_streak_7',
    title: 'Consistent',
    description: 'Reach a 7-day Daily Challenge streak',
    category: 'DAILY',
    target: 7,
    rewards: [{ type: 'COINS', amount: 500 }, { type: 'XP', amount: 750 }],
    icon: 'Flame',
  },

  // NOVA
  {
    id: 'nova_first_use',
    title: 'Nova Initiate',
    description: 'Activate Nova Mode for the first time',
    category: 'NOVA',
    target: 1,
    rewards: [{ type: 'COINS', amount: 100 }, { type: 'XP', amount: 150 }],
    icon: 'Zap',
  },
  {
    id: 'nova_powers_10',
    title: 'Nova Master',
    description: 'Use Nova Powers 10 times',
    category: 'NOVA',
    target: 10,
    rewards: [{ type: 'COINS', amount: 250 }, { type: 'XP', amount: 400 }],
    icon: 'Zap',
  },

  // PROGRESSION
  {
    id: 'level_10',
    title: 'Dedicated',
    description: 'Reach Player Level 10',
    category: 'PROGRESSION',
    target: 10,
    rewards: [{ type: 'COINS', amount: 300 }, { type: 'XP', amount: 500 }],
    icon: 'Award',
  },
  {
    id: 'level_25',
    title: 'Veteran',
    description: 'Reach Player Level 25',
    category: 'PROGRESSION',
    target: 25,
    rewards: [{ type: 'COINS', amount: 1000 }, { type: 'XP', amount: 2000 }],
    icon: 'Award',
  },
];
