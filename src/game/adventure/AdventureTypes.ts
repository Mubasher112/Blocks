export type ObjectiveType = 'SCORE' | 'LINES' | 'COMBO' | 'COMPOSITE';

export interface ScoreObjective {
  type: 'SCORE';
  targetScore: number;
}

export interface LinesObjective {
  type: 'LINES';
  targetLines: number;
}

export interface ComboObjective {
  type: 'COMBO';
  targetCombo: number;
}

export interface CompositeObjective {
  type: 'COMPOSITE';
  objectives: (ScoreObjective | LinesObjective | ComboObjective)[];
}

export type LevelObjective =
  | ScoreObjective
  | LinesObjective
  | ComboObjective
  | CompositeObjective;

export interface StarRequirements {
  oneStarScore?: number;
  twoStarScore: number;
  threeStarScore: number;
}

export interface LevelRewards {
  coins: number;
  xp: number;
}

export interface InitialBoardCell {
  r: number;
  c: number;
  color?: string;
}

export interface AdventureLevel {
  id: string;
  worldId: string;
  levelNumber: number;
  name: string;
  description: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';
  objective: LevelObjective;
  moveLimit?: number; // undefined = unlimited
  starRequirements: StarRequirements;
  rewards: LevelRewards;
  seed?: number; // Optional seed for piece generation
  initialBoard?: InitialBoardCell[]; // Optional pre-filled cells
  allowedShapeCategories?: ('basic' | 'square' | 'shapes' | 'irregular')[];
}

export interface WorldData {
  id: string;
  name: string;
  description: string;
  order: number;
  themeColor: string;
  unlockRequirementStars: number;
  levels: AdventureLevel[];
}

export interface AdventureProgress {
  unlockedWorldId: string;
  unlockedLevelNumber: number;
  completedLevels: Record<string, { stars: number; bestScore: number }>; // levelId -> info
  totalStars: number;
  coins: number;
  xp: number;
  playerLevel: number;
}
