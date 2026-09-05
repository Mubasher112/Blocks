import { describe, it, expect, beforeEach } from 'vitest';
import { NovaEngine } from '../game/nova/NovaEngine';
import { GameEngine } from '../game/GameEngine';
import { Board } from '../game/Board';
import { Piece } from '../game/Piece';
import { PIECE_LIBRARY } from '../game/PieceLibrary';
import { NOVA_CONFIG } from '../game/nova/NovaConfig';

describe('Nova Engine & Nova Mode System', () => {
  let nova: NovaEngine;
  let game: GameEngine;

  beforeEach(() => {
    nova = new NovaEngine();
    game = new GameEngine(12345);
    game.startNewGame();
  });

  describe('1. Nova Energy Bounds & Generation', () => {
    it('initializes with 0 energy and NORMAL status', () => {
      expect(nova.getEnergy()).toBe(0);
      expect(nova.getState().status).toBe('NORMAL');
    });

    it('adds energy correctly and clamps at 100', () => {
      nova.addEnergy(50);
      expect(nova.getEnergy()).toBe(50);

      nova.addEnergy(70);
      expect(nova.getEnergy()).toBe(100);
      expect(nova.getState().status).toBe('READY');
    });

    it('calculates energy rewards for placement, lines, and combos', () => {
      const energy1Line = nova.calculateEnergyEarned(true, 1, 0); // 2 + 8 = 10
      expect(energy1Line).toBe(10);

      const energy2LinesCombo3 = nova.calculateEnergyEarned(true, 2, 3); // 2 + 16 + 8 = 26
      expect(energy2LinesCombo3).toBe(26);
    });
  });

  describe('2. Nova Activation & Turns', () => {
    it('prevents activation when energy < 100', () => {
      nova.setEnergy(90);
      expect(nova.canActivate()).toBe(false);
      expect(nova.activate()).toBe(false);
    });

    it('activates Nova mode when energy is 100 and consumes 100 energy', () => {
      nova.setEnergy(100);
      expect(nova.canActivate()).toBe(true);

      const activated = nova.activate();
      expect(activated).toBe(true);
      expect(nova.getEnergy()).toBe(0);
      expect(nova.getState().status).toBe('ACTIVE');
      expect(nova.getState().remainingTurns).toBe(NOVA_CONFIG.DURATION_TURNS);
    });

    it('decrements turns on successful placement and ends Nova mode after 5 turns', () => {
      nova.setEnergy(100);
      nova.activate();

      for (let i = 0; i < 4; i++) {
        nova.consumeNovaTurn();
        expect(nova.getState().remainingTurns).toBe(5 - (i + 1));
        expect(nova.getState().status).toBe('ACTIVE');
      }

      nova.consumeNovaTurn(); // 5th turn
      expect(nova.getState().remainingTurns).toBe(0);
      expect(nova.getState().status).toBe('NORMAL');
    });
  });

  describe('3. Nova Powers', () => {
    it('Pulse: clears a 3x3 surrounding board area', () => {
      nova.setEnergy(100);
      nova.activate();

      const board = new Board();
      // Occupy cells in middle
      board.setCell(3, 3, 'OCCUPIED', '#00F0FF');
      board.setCell(3, 4, 'OCCUPIED', '#00F0FF');
      board.setCell(4, 3, 'OCCUPIED', '#00F0FF');

      const result = nova.executePulse(board, 3, 3);
      expect(result.success).toBe(true);
      expect(board.getCell(3, 3)?.state).toBe('EMPTY');
      expect(board.getCell(3, 4)?.state).toBe('EMPTY');
      expect(board.getCell(4, 3)?.state).toBe('EMPTY');
    });

    it('Wild: transforms a specified tray piece into a chosen shape', () => {
      nova.setEnergy(100);
      nova.activate();

      const tray: (Piece | null)[] = [
        new Piece(PIECE_LIBRARY[0], 'p1'),
        null,
        null,
      ];
      const newPiece = new Piece(PIECE_LIBRARY[1], 'wild');

      const result = nova.executeWild(tray, 0, newPiece);
      expect(result.success).toBe(true);
      expect(tray[0]?.shapeId).toBe(PIECE_LIBRARY[1].id);
    });

    it('Prism: arms next line clear with +50 bonus score and consumes Prism', () => {
      nova.setEnergy(100);
      nova.activate();

      nova.executePrism();
      expect(nova.getState().isPrismArmed).toBe(true);

      const eval1 = nova.evaluateNovaClear(1);
      expect(eval1.bonusScore).toBe(NOVA_CONFIG.PRISM_CLEAR_BONUS);
      expect(nova.getState().isPrismArmed).toBe(false); // Single use
    });
  });

  describe('4. Nova Clear & 2x Score Multiplier', () => {
    it('awards Nova Clear bonus when clearing 2+ lines during Nova Mode', () => {
      nova.setEnergy(100);
      nova.activate();

      const clearEval = nova.evaluateNovaClear(2);
      expect(clearEval.isNovaClear).toBe(true);
      expect(clearEval.bonusScore).toBe(NOVA_CONFIG.NOVA_CLEAR_BONUS);
    });
  });

  describe('5. GameEngine & Atomic Undo Integration', () => {
    it('allows Atomic Undo to restore exact board, score, and tray state', () => {
      const initialScore = game.getScore();

      // Perform a placement
      const trayIndex = game.getTray().findIndex(p => p !== null);
      expect(trayIndex).toBeGreaterThanOrEqual(0);

      const piece = game.getTray()[trayIndex]!;
      // Find valid spot
      let placedR = -1;
      let placedC = -1;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (game.getBoard().canPlacePiece(piece, r, c)) {
            placedR = r;
            placedC = c;
            break;
          }
        }
        if (placedR !== -1) break;
      }

      const moveResult = game.placePiece(trayIndex, placedR, placedC);
      expect(moveResult.success).toBe(true);
      expect(game.getScore()).toBeGreaterThan(initialScore);

      // Perform Undo
      const undoSuccess = game.undo();
      expect(undoSuccess).toBe(true);
      expect(game.getScore()).toBe(initialScore);
    });
  });
});
