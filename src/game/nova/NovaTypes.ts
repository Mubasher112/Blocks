import { BoardPosition } from '../Board';
import { Piece } from '../Piece';

export type NovaPowerId = 'pulse' | 'wild' | 'shuffle' | 'undo' | 'prism';

export type NovaModeStatus = 'NORMAL' | 'READY' | 'ACTIVE';

export interface NovaPower {
  id: NovaPowerId;
  name: string;
  description: string;
  icon: string;
  cost: number; // Nova turns or energy if applicable (0 = free during Nova mode)
  isPassive?: boolean;
}

export interface NovaState {
  energy: number;
  status: NovaModeStatus;
  remainingTurns: number;
  activePowers: NovaPowerId[];
  consumedPowers: NovaPowerId[];
  isPrismArmed: boolean;
  activationCount: number;
}

export interface NovaActionResult {
  success: boolean;
  message?: string;
  clearedCells?: BoardPosition[];
  linesCleared?: number;
  scoreGained?: number;
  isNovaClear?: boolean;
  consumedTurn?: boolean;
}

export interface SnapshotState {
  boardGrid: { state: number; color: string | null }[][];
  tray: (Piece | null)[];
  score: number;
  highScore: number;
  comboCount: number;
  novaState: NovaState;
  moveCount: number;
}
