import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../game/Board';
import { Piece } from '../game/Piece';
import { PIECE_LIBRARY } from '../game/PieceLibrary';
import { GameEngine } from '../game/GameEngine';
import { Scoring } from '../game/Scoring';
import { ComboTracker } from '../game/Combo';
import { SeededRandom } from '../utils/random';

describe('Board Engine', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('creates an 8x8 empty grid', () => {
    const grid = board.getGrid();
    expect(grid.length).toBe(8);
    expect(grid[0].length).toBe(8);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(grid[r][c].state).toBe('EMPTY');
        expect(grid[r][c].color).toBeNull();
      }
    }
  });

  it('places pieces correctly within bounds', () => {
    const dotShape = PIECE_LIBRARY.find(s => s.id === 'dot-1')!;
    const piece = new Piece(dotShape);

    expect(board.canPlacePiece(piece, 0, 0)).toBe(true);
    expect(board.placePiece(piece, 0, 0)).toBe(true);
    expect(board.getCell(0, 0)?.state).toBe('OCCUPIED');

    // Trying to place on occupied cell fails
    expect(board.canPlacePiece(piece, 0, 0)).toBe(false);
    expect(board.placePiece(piece, 0, 0)).toBe(false);
  });

  it('rejects out of bounds placement', () => {
    const line3Shape = PIECE_LIBRARY.find(s => s.id === 'line-3-h')!;
    const piece = new Piece(line3Shape); // width 3, height 1

    expect(board.canPlacePiece(piece, 0, 6)).toBe(false); // extends to col 8 (out of bounds)
    expect(board.canPlacePiece(piece, 8, 0)).toBe(false); // row out of bounds
  });

  it('clears completed horizontal rows and vertical columns simultaneously', () => {
    // Fill row 0 completely
    const dotShape = PIECE_LIBRARY.find(s => s.id === 'dot-1')!;
    const dotPiece = new Piece(dotShape);

    for (let c = 0; c < 8; c++) {
      board.placePiece(dotPiece, 0, c);
    }

    // Fill col 2 completely
    for (let r = 0; r < 8; r++) {
      board.placePiece(dotPiece, r, 2);
    }

    const rows = board.findCompletedRows();
    const cols = board.findCompletedColumns();

    expect(rows).toEqual([0]);
    expect(cols).toEqual([2]);

    const result = board.clearLines();
    expect(result.lineCount).toBe(2); // 1 row + 1 col
    expect(result.clearedCells.length).toBe(15); // 8 + 8 - 1 intersection = 15 cells

    // Verify row 0 and col 2 are now empty
    expect(board.getCell(0, 0)?.state).toBe('EMPTY');
    expect(board.getCell(0, 2)?.state).toBe('EMPTY');
    expect(board.getCell(7, 2)?.state).toBe('EMPTY');
  });
});

describe('Seeded PRNG', () => {
  it('produces deterministic output given the same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    const values1 = Array.from({ length: 10 }, () => rng1.nextFloat());
    const values2 = Array.from({ length: 10 }, () => rng2.nextFloat());

    expect(values1).toEqual(values2);
  });
});

describe('Scoring & Combo', () => {
  it('calculates placement and line clear points accurately', () => {
    const scoring = new Scoring();

    // 4 blocks = 40 pts
    expect(scoring.calculatePlacementPoints(4)).toBe(40);

    // 1 line, combo 1
    const singleClear = scoring.calculateClearPoints(1, 1);
    expect(singleClear.linePoints).toBe(100);
    expect(singleClear.totalPoints).toBe(100);

    // 2 lines simultaneously (1.5 multiplier)
    const doubleClear = scoring.calculateClearPoints(2, 1);
    expect(doubleClear.totalPoints).toBe(300); // 200 base + 100 bonus

    // 1 line with combo 3
    const comboClear = scoring.calculateClearPoints(1, 3);
    expect(comboClear.comboBonus).toBe(100); // (3-1) * 50 * 1
    expect(comboClear.totalPoints).toBe(200);
  });

  it('tracks combo streaks properly', () => {
    const combo = new ComboTracker();

    expect(combo.registerTurn(0).comboCount).toBe(0);
    expect(combo.registerTurn(1).comboCount).toBe(1);
    expect(combo.registerTurn(1).comboCount).toBe(2);
    expect(combo.registerTurn(1).comboCount).toBe(3);
    expect(combo.registerTurn(0).comboCount).toBe(0);
    expect(combo.getMaxCombo()).toBe(3);
  });
});

describe('GameEngine Loop & Game Over', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(12345);
    engine.startNewGame();
  });

  it('initializes game state properly', () => {
    expect(engine.getStatus()).toBe('PLAYING');
    expect(engine.getScore()).toBe(0);
    const tray = engine.getTray();
    expect(tray.length).toBe(3);
    expect(tray.every(p => p !== null)).toBe(true);
  });

  it('places a piece from tray and updates tray state', () => {
    const result = engine.placePiece(0, 0, 0);
    expect(result.success).toBe(true);
    expect(result.scoreGained).toBeGreaterThan(0);

    const trayAfter = engine.getTray();
    expect(trayAfter[0]).toBeNull();
  });

  it('detects game over when board is filled and no tray piece fits', () => {
    const board = engine.getBoard();
    const sq3Shape = PIECE_LIBRARY.find(s => s.id === 'square-3x3')!;
    const dotShape = PIECE_LIBRARY.find(s => s.id === 'dot-1')!;

    const sq3Piece = new Piece(sq3Shape);
    const dotPiece = new Piece(dotShape);

    // Grid where EVERY row and EVERY col has an empty cell at diagonal (i, i)
    // so no row or col is complete, preventing line clear!
    const grid = board.getGrid();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === c) {
          grid[r][c] = { state: 'EMPTY', color: null };
        } else {
          grid[r][c] = { state: 'OCCUPIED', color: '#FFF' };
        }
      }
    }

    // Set engine board
    (engine as any).board = new Board(grid);

    // Tray: 1 dotPiece, 2 large 3x3 square pieces
    (engine as any).tray = [dotPiece, sq3Piece, sq3Piece];

    // Place dotPiece at (0,0)
    const result = engine.placePiece(0, 0, 0);
    expect(result.success).toBe(true);

    // Diagonal spots (1,1), (2,2), ..., (7,7) are isolated 1x1 empty cells.
    // 3x3 squares in tray CANNOT fit anywhere on board -> GAME OVER!
    expect(result.isGameOver).toBe(true);
    expect(engine.getStatus()).toBe('GAMEOVER');
  });
});
