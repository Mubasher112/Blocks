export type TransactionType =
  | 'GAME_REWARD'
  | 'DAILY_REWARD'
  | 'DAILY_CHALLENGE'
  | 'ADVENTURE_REWARD'
  | 'ACHIEVEMENT'
  | 'LEVEL_UP'
  | 'STREAK_REWARD'
  | 'PURCHASE'
  | 'AD_REWARD'
  | 'SPEND'
  | 'ADMIN_ADJUSTMENT';

export interface CoinTransaction {
  id: string;
  playerId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  source: string;
  referenceId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type RewardType = 'COINS' | 'XP' | 'COSMETIC' | 'POWER';

export interface RewardItem {
  type: RewardType;
  amount: number;
  itemId?: string;
  metadata?: Record<string, any>;
}

export interface RewardBundle {
  source: string;
  referenceId: string;
  rewards: RewardItem[];
}

export interface PlayerEconomy {
  coins: number;
  level: number;
  currentXP: number;
  totalXP: number;
}

export type AchievementCategory =
  | 'GAMEPLAY'
  | 'SCORE'
  | 'LINES'
  | 'COMBO'
  | 'ADVENTURE'
  | 'DAILY'
  | 'NOVA'
  | 'SOCIAL'
  | 'PROGRESSION';

export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  target: number;
  rewards: RewardItem[];
  icon: string;
  hidden?: boolean;
}

export interface PlayerAchievementState {
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
}

export interface DailyRewardDayConfig {
  day: number;
  coins: number;
  xp: number;
}

export interface DailyRewardState {
  currentRewardDay: number; // 1 to 7
  lastClaimedDate: string | null; // YYYY-MM-DD
  lastClaimedAt: string | null;
}
