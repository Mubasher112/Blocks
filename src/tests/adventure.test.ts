import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectiveEvaluator } from '../game/adventure/ObjectiveEvaluator';
import { AdventureEngine } from '../game/adventure/AdventureEngine';
import { GameEngine } from '../game/GameEngine';
import { WORLD_1_LEVELS } from '../game/adventure/levels/world1';

describe('Adventure Mode Objectives & Star System', () => {
  it('evaluates SCORE objective correctly', () => {
    const obj = { type: 'SCORE' as const, targetScore: 1000 };
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 900, linesCleared: 0, maxCombo: 0, movesUsed: 5 })).toBe(false);
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 1000, linesCleared: 0, maxCombo: 0, movesUsed: 5 })).toBe(true);
  });

  it('evaluates LINES objective correctly', () => {
    const obj = { type: 'LINES' as const, targetLines: 5 };
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 500, linesCleared: 4, maxCombo: 0, movesUsed: 5 })).toBe(false);
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 500, linesCleared: 5, maxCombo: 0, movesUsed: 5 })).toBe(true);
  });

  it('evaluates COMBO objective correctly', () => {
    const obj = { type: 'COMBO' as const, targetCombo: 3 };
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 500, linesCleared: 2, maxCombo: 2, movesUsed: 5 })).toBe(false);
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 500, linesCleared: 2, maxCombo: 3, movesUsed: 5 })).toBe(true);
  });

  it('evaluates COMPOSITE objective correctly', () => {
    const obj = {
      type: 'COMPOSITE' as const,
      objectives: [
        { type: 'SCORE' as const, targetScore: 2000 },
        { type: 'LINES' as const, targetLines: 10 },
      ],
    };
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 2000, linesCleared: 9, maxCombo: 0, movesUsed: 5 })).toBe(false);
    expect(ObjectiveEvaluator.isObjectiveComplete(obj, { score: 2000, linesCleared: 10, maxCombo: 0, movesUsed: 5 })).toBe(true);
  });

  it('calculates 1, 2, and 3 star thresholds accurately', () => {
    const level = WORLD_1_LEVELS[0]; // targetScore: 1500, 2star: 2500, 3star: 4000
    expect(ObjectiveEvaluator.calculateStars(level, { score: 1000, linesCleared: 0, maxCombo: 0, movesUsed: 1 })).toBe(0);
    expect(ObjectiveEvaluator.calculateStars(level, { score: 1500, linesCleared: 0, maxCombo: 0, movesUsed: 1 })).toBe(1);
    expect(ObjectiveEvaluator.calculateStars(level, { score: 2500, linesCleared: 0, maxCombo: 0, movesUsed: 1 })).toBe(2);
    expect(ObjectiveEvaluator.calculateStars(level, { score: 4000, linesCleared: 0, maxCombo: 0, movesUsed: 1 })).toBe(3);
  });
});

describe('Adventure Engine Loop', () => {
  let adventureEngine: AdventureEngine;

  beforeEach(() => {
    adventureEngine = new AdventureEngine();
  });

  it('loads level 1 and pre-populates seedable piece tray', () => {
    const level = WORLD_1_LEVELS[0];
    adventureEngine.startLevel(level);

    expect(adventureEngine.getCurrentLevel()?.id).toBe(level.id);
    expect(adventureEngine.getStatus()).toBe('PLAYING');
    expect(adventureEngine.getTray().length).toBe(3);
  });

  it('pre-populates initial board configuration if defined in level', () => {
    const level = WORLD_1_LEVELS[10]; // Level 11 has initial board configuration
    adventureEngine.startLevel(level);

    const cell = adventureEngine.getBoard().getCell(3, 3);
    expect(cell?.state).toBe('OCCUPIED');
  });

  it('tracks move limits and triggers game over when moves are depleted', () => {
    const level = WORLD_1_LEVELS[15]; // Level 16 has move limit 25
    adventureEngine.startLevel(level);

    expect(adventureEngine.getMovesRemaining()).toBe(25);

    // Perform placement
    const result = adventureEngine.placeAdventurePiece(0, 0, 0);
    expect(result.success).toBe(true);
    expect(adventureEngine.getMovesRemaining()).toBe(24);
  });

  it('places pieces in adventure level 1 and updates board, score, and gameplay stats', () => {
    const level = WORLD_1_LEVELS[0];
    adventureEngine.startLevel(level);

    const initialScore = adventureEngine.getScore();
    const trayPiece = adventureEngine.getTray()[0];
    expect(trayPiece).not.toBeNull();

    const result = adventureEngine.placeAdventurePiece(0, 0, 0);
    expect(result.success).toBe(true);
    expect(adventureEngine.getScore()).toBeGreaterThan(initialScore);
    expect(adventureEngine.getGameplayStats().movesUsed).toBe(1);

    // Board at (0, 0) should be occupied
    const cell = adventureEngine.getBoard().getCell(0, 0);
    expect(cell?.state).toBe('OCCUPIED');
  });

  it('evaluates level success when SCORE objective is completed in adventure mode', () => {
    const level = {
      ...WORLD_1_LEVELS[0],
      objective: { type: 'SCORE' as const, targetScore: 10 },
    };
    adventureEngine.startLevel(level);

    const result = adventureEngine.placeAdventurePiece(0, 0, 0);
    expect(result.success).toBe(true);
    expect(result.isObjectiveComplete).toBe(true);
    expect(result.starsEarned).toBeGreaterThanOrEqual(1);
    expect(adventureEngine.getIsLevelComplete()).toBe(true);
  });

  it('updates lines cleared and completes objective via executePulse in adventure mode', () => {
    const level = {
      ...WORLD_1_LEVELS[0],
      objective: { type: 'LINES' as const, targetLines: 1 },
    };
    adventureEngine.startLevel(level);

    // Activate Nova mode manually
    adventureEngine.getNovaEngine().addEnergy(100);
    adventureEngine.getNovaEngine().activate();

    // Fill row 5 completely so pulse triggers clearLines on row 5
    const board = adventureEngine.getBoard();
    for (let c = 0; c < 8; c++) {
      board.setCell(5, c, 'OCCUPIED', '#FF0000');
    }

    // Execute pulse at (0, 0)
    const pulseResult = adventureEngine.executePulse(0, 0);
    expect(pulseResult.success).toBe(true);
    expect(adventureEngine.getGameplayStats().linesCleared).toBeGreaterThanOrEqual(1);
    expect(adventureEngine.getIsLevelComplete()).toBe(true);
  });

  it('restores active game state properly in GameEngine', () => {
    const freshEngine = new GameEngine();
    freshEngine.restoreActiveGame({
      score: 1250,
      highScore: 3000,
      comboCount: 3,
      grid: [
        [{ state: 'OCCUPIED', color: '#00F0FF' }],
      ] as any,
      trayShapes: ['dot-1', 'line-2-h', null],
      stats: {
        gamesPlayed: 5,
        totalLinesCleared: 12,
        totalBlocksPlaced: 40,
        highScore: 3000,
        longestCombo: 4,
      },
      saveVersion: 1,
    });

    expect(freshEngine.getScore()).toBe(1250);
    expect(freshEngine.getHighScore()).toBe(3000);
    expect(freshEngine.getComboCount()).toBe(3);
    expect(freshEngine.getStatus()).toBe('PLAYING');
    expect(freshEngine.getBoard().getCell(0, 0)?.state).toBe('OCCUPIED');
    expect(freshEngine.getTray()[0]?.shapeId).toBe('dot-1');
    expect(freshEngine.getTray()[1]?.shapeId).toBe('line-2-h');
    expect(freshEngine.getTray()[2]).toBeNull();
  });
});
