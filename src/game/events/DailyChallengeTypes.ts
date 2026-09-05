import { LevelObjective, InitialBoardCell } from '../adventure/AdventureTypes';
import { NovaPowerId } from '../nova/NovaTypes';

export type GameEventType =
  | 'DAILY_CHALLENGE'
  | 'WEEKLY_CHALLENGE'
  | 'SPECIAL_EVENT'
  | 'SEASONAL_EVENT';

export type GameEventStatus =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'ENDING'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface DailyNovaConfig {
  novaEnabled: boolean;
  novaEnergyMultiplier?: number;
  availablePowers?: NovaPowerId[];
  novaScoreMultiplier?: number;
}

export interface DailyChallengeRewards {
  coins: number;
  xp: number;
}

export interface DailyChallenge {
  id: string; // Format: 'daily:YYYY-MM-DD'
  challengeDate: string; // YYYY-MM-DD in UTC
  seed: number;
  title: string;
  description: string;
  objective: LevelObjective;
  targetScore?: number;
  targetLines?: number;
  moveLimit?: number;
  initialBoard?: InitialBoardCell[];
  scoreMultiplier?: number;
  novaConfig: DailyNovaConfig;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  version: number;
  rewards: DailyChallengeRewards;
  startsAt: string; // ISO String
  endsAt: string;   // ISO String
}

export interface DailyChallengeResult {
  challengeId: string;
  playerId: string;
  score: number;
  linesCleared: number;
  movesUsed: number;
  completed: boolean;
  attemptCount: number;
  bestScore: number;
  submittedAt: string;
}

export interface StreakInfo {
  playerId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  title: string;
  description: string;
  status: GameEventStatus;
  startsAt: string;
  endsAt: string;
  version: number;
  config: Record<string, any>;
}
