import { NOVA_CONFIG } from './NovaConfig';
import {
  NovaActionResult,
  NovaModeStatus,
  NovaPowerId,
  NovaState,
  SnapshotState,
} from './NovaTypes';
import { Board, BoardPosition } from '../Board';
import { Piece } from '../Piece';
import { PieceGenerator } from '../PieceGenerator';

export class NovaEngine {
  private energy: number = 0;
  private status: NovaModeStatus = 'NORMAL';
  private remainingTurns: number = 0;
  private activePowers: NovaPowerId[] = ['pulse', 'wild', 'shuffle', 'undo', 'prism'];
  private consumedPowers: NovaPowerId[] = [];
  private isPrismArmed: boolean = false;
  private activationCount: number = 0;

  private undoSnapshot: SnapshotState | null = null;

  constructor(initialState?: Partial<NovaState>) {
    if (initialState) {
      this.energy = Math.min(
        NOVA_CONFIG.MAX_ENERGY,
        Math.max(0, initialState.energy ?? 0)
      );
      this.status = initialState.status ?? 'NORMAL';
      this.remainingTurns = initialState.remainingTurns ?? 0;
      this.activePowers = initialState.activePowers ?? ['pulse', 'wild', 'shuffle', 'undo', 'prism'];
      this.consumedPowers = initialState.consumedPowers ?? [];
      this.isPrismArmed = initialState.isPrismArmed ?? false;
      this.activationCount = initialState.activationCount ?? 0;
    }
  }

  // --- ENERGY MANAGEMENT ---

  public getEnergy(): number {
    return this.energy;
  }

  public addEnergy(amount: number): number {
    if (amount <= 0) return this.energy;
    const oldEnergy = this.energy;
    this.energy = Math.min(NOVA_CONFIG.MAX_ENERGY, this.energy + amount);

    if (this.energy >= NOVA_CONFIG.MAX_ENERGY && this.status === 'NORMAL') {
      this.status = 'READY';
    }

    return this.energy - oldEnergy;
  }

  public setEnergy(amount: number): void {
    this.energy = Math.min(
      NOVA_CONFIG.MAX_ENERGY,
      Math.max(0, amount)
    );
    if (this.energy >= NOVA_CONFIG.MAX_ENERGY && this.status === 'NORMAL') {
      this.status = 'READY';
    } else if (this.energy < NOVA_CONFIG.MAX_ENERGY && this.status === 'READY') {
      this.status = 'NORMAL';
    }
  }

  public calculateEnergyEarned(
    placedPiece: boolean,
    linesCleared: number,
    comboCount: number
  ): number {
    let earned = 0;

    if (placedPiece) {
      earned += NOVA_CONFIG.ENERGY_REWARDS.PIECE_PLACEMENT;
    }

    if (linesCleared > 0) {
      earned += linesCleared * NOVA_CONFIG.ENERGY_REWARDS.LINE_CLEAR_PER_LINE;
    }

    if (comboCount === 2) {
      earned += NOVA_CONFIG.ENERGY_REWARDS.COMBO_2;
    } else if (comboCount === 3) {
      earned += NOVA_CONFIG.ENERGY_REWARDS.COMBO_3;
    } else if (comboCount >= 4) {
      earned += NOVA_CONFIG.ENERGY_REWARDS.COMBO_4_PLUS;
    }

    return earned;
  }

  // --- ACTIVATION & TURN MANAGEMENT ---

  public canActivate(): boolean {
    return this.energy >= NOVA_CONFIG.ACTIVATION_COST && this.status !== 'ACTIVE';
  }

  public activate(): boolean {
    if (!this.canActivate()) return false;

    this.energy -= NOVA_CONFIG.ACTIVATION_COST;
    this.status = 'ACTIVE';
    this.remainingTurns = NOVA_CONFIG.DURATION_TURNS;
    this.consumedPowers = [];
    this.activationCount++;
    return true;
  }

  public consumeNovaTurn(): boolean {
    if (this.status !== 'ACTIVE') return false;

    this.remainingTurns--;
    if (this.remainingTurns <= 0) {
      this.remainingTurns = 0;
      this.status = this.energy >= NOVA_CONFIG.MAX_ENERGY ? 'READY' : 'NORMAL';
      this.isPrismArmed = false;
    }
    return true;
  }

  // --- NOVA CLEAR & PRISM EVALUATION ---

  public evaluateNovaClear(linesCleared: number): { isNovaClear: boolean; bonusScore: number } {
    let bonusScore = 0;
    let isNovaClear = false;

    if (this.status === 'ACTIVE' && linesCleared >= NOVA_CONFIG.NOVA_CLEAR_MIN_LINES) {
      isNovaClear = true;
      bonusScore += NOVA_CONFIG.NOVA_CLEAR_BONUS;
    }

    if (linesCleared > 0 && this.isPrismArmed) {
      bonusScore += NOVA_CONFIG.PRISM_CLEAR_BONUS;
      this.isPrismArmed = false; // Prism is single-use
    }

    return { isNovaClear, bonusScore };
  }

  // --- POWERS IMPLEMENTATION ---

  public executePulse(
    board: Board,
    centerR: number,
    centerC: number
  ): NovaActionResult {
    if (this.status !== 'ACTIVE') {
      return { success: false, message: 'Nova Mode must be active to use Pulse.' };
    }

    if (this.isPowerConsumed('pulse')) {
      return { success: false, message: 'Pulse already used in this Nova activation.' };
    }

    const clearedCells: BoardPosition[] = [];

    // Clear 3x3 surrounding centerR, centerC
    for (let r = centerR - 1; r <= centerR + 1; r++) {
      for (let c = centerC - 1; c <= centerC + 1; c++) {
        const cell = board.getCell(r, c);
        if (cell && cell.state === 'OCCUPIED') {
          board.setCell(r, c, 'EMPTY', null);
          clearedCells.push({ r, c });
        }
      }
    }

    // Check for line clears resulting from Pulse
    const lineClearResult = board.clearLines();
    const totalLinesCleared = lineClearResult.lineCount;

    // Pulse consumes 1 Nova turn if in Nova mode
    if (this.status === 'ACTIVE') {
      this.consumeNovaTurn();
    }

    this.markPowerConsumed('pulse');

    return {
      success: true,
      clearedCells: [...clearedCells, ...lineClearResult.clearedCells],
      linesCleared: totalLinesCleared,
      consumedTurn: true,
    };
  }

  public executeWild(
    tray: (Piece | null)[],
    trayIndex: number,
    newPiece: Piece
  ): NovaActionResult {
    if (this.status !== 'ACTIVE') {
      return { success: false, message: 'Nova Mode must be active to use Wild.' };
    }

    if (this.isPowerConsumed('wild')) {
      return { success: false, message: 'Wild power already used in this Nova activation.' };
    }

    if (trayIndex < 0 || trayIndex >= tray.length) {
      return { success: false, message: 'Invalid tray index.' };
    }

    tray[trayIndex] = newPiece;
    this.markPowerConsumed('wild');

    return { success: true, consumedTurn: false };
  }

  public executeShuffle(
    tray: (Piece | null)[],
    generator: PieceGenerator
  ): NovaActionResult {
    if (this.status !== 'ACTIVE') {
      return { success: false, message: 'Nova Mode must be active to use Shuffle.' };
    }

    if (this.isPowerConsumed('shuffle')) {
      return { success: false, message: 'Shuffle already used in this Nova activation.' };
    }

    const newTray = generator.generateTray();
    for (let i = 0; i < tray.length; i++) {
      tray[i] = newTray[i];
    }

    if (this.status === 'ACTIVE') {
      this.consumeNovaTurn();
    }

    this.markPowerConsumed('shuffle');

    return { success: true, consumedTurn: true };
  }

  public executePrism(): NovaActionResult {
    if (this.status !== 'ACTIVE') {
      return { success: false, message: 'Nova Mode must be active to use Prism.' };
    }

    if (this.isPowerConsumed('prism')) {
      return { success: false, message: 'Prism already used in this Nova activation.' };
    }

    this.isPrismArmed = true;
    this.markPowerConsumed('prism');

    return { success: true, consumedTurn: false };
  }

  // --- UNDO / SNAPSHOT SYSTEM ---

  public saveUndoSnapshot(snapshot: SnapshotState): void {
    this.undoSnapshot = JSON.parse(JSON.stringify(snapshot));
  }

  public canUndo(): boolean {
    return this.undoSnapshot !== null && !this.isPowerConsumed('undo');
  }

  public getUndoSnapshot(): SnapshotState | null {
    if (!this.canUndo()) return null;
    return this.undoSnapshot;
  }

  public markUndoUsed(): void {
    this.markPowerConsumed('undo');
    this.undoSnapshot = null; // Single use
  }

  // --- HELPER METHODS ---

  public isPowerConsumed(powerId: NovaPowerId): boolean {
    return this.consumedPowers.includes(powerId);
  }

  private markPowerConsumed(powerId: NovaPowerId): void {
    if (!this.consumedPowers.includes(powerId)) {
      this.consumedPowers.push(powerId);
    }
  }

  public getState(): NovaState {
    return {
      energy: this.energy,
      status: this.status,
      remainingTurns: this.remainingTurns,
      activePowers: [...this.activePowers],
      consumedPowers: [...this.consumedPowers],
      isPrismArmed: this.isPrismArmed,
      activationCount: this.activationCount,
    };
  }

  public reset(): void {
    this.energy = 0;
    this.status = 'NORMAL';
    this.remainingTurns = 0;
    this.consumedPowers = [];
    this.isPrismArmed = false;
    this.undoSnapshot = null;
  }
}
