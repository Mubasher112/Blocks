import { AdventureLevel, WorldData } from '../AdventureTypes';

const COLORS = {
  CYAN: '#00F0FF',
  MAGENTA: '#FF007F',
  AMBER: '#FFB800',
  EMERALD: '#00E676',
  PURPLE: '#A855F7',
};

export const WORLD_1_LEVELS: AdventureLevel[] = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  const id = `world-1-level-${num}`;

  if (num <= 5) {
    // Levels 1-5: Tutorial / Easy (Score & Lines)
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Nova Dawn ${num}`,
      description: 'Master the basics of block placement and line clearing.',
      difficulty: 'EASY',
      objective: num % 2 === 1
        ? { type: 'SCORE', targetScore: 1000 + num * 500 }
        : { type: 'LINES', targetLines: 4 + num * 2 },
      starRequirements: {
        twoStarScore: 2000 + num * 500,
        threeStarScore: 3500 + num * 500,
      },
      rewards: { coins: 50 + num * 10, xp: 25 + num * 5 },
      seed: 1000 + num,
    };
  } else if (num <= 10) {
    // Levels 6-10: Basic Increase (Combo & Composite)
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Crystal Surge ${num}`,
      description: 'Build consecutive line clears to trigger combos.',
      difficulty: 'NORMAL',
      objective: num % 2 === 0
        ? { type: 'COMBO', targetCombo: 3 }
        : {
            type: 'COMPOSITE',
            objectives: [
              { type: 'SCORE', targetScore: 3000 },
              { type: 'LINES', targetLines: 10 },
            ],
          },
      starRequirements: {
        twoStarScore: 4000 + num * 400,
        threeStarScore: 6500 + num * 500,
      },
      rewards: { coins: 100 + num * 10, xp: 50 + num * 5 },
      seed: 2000 + num,
    };
  } else if (num <= 15) {
    // Levels 11-15: Challenging Targets + Initial Board obstacles
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Starlight Grid ${num}`,
      description: 'Navigate pre-placed block configurations.',
      difficulty: 'NORMAL',
      objective: {
        type: 'COMPOSITE',
        objectives: [
          { type: 'SCORE', targetScore: 5000 + (num - 10) * 800 },
          { type: 'LINES', targetLines: 12 + (num - 10) * 2 },
        ],
      },
      initialBoard: [
        { r: 3, c: 3, color: COLORS.CYAN },
        { r: 3, c: 4, color: COLORS.CYAN },
        { r: 4, c: 3, color: COLORS.CYAN },
        { r: 4, c: 4, color: COLORS.CYAN },
      ],
      starRequirements: {
        twoStarScore: 7000 + num * 500,
        threeStarScore: 10000 + num * 600,
      },
      rewards: { coins: 150, xp: 80 },
      seed: 3000 + num,
    };
  } else if (num <= 20) {
    // Levels 16-20: Move Limits
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Quantum Pulse ${num}`,
      description: 'Reach targets within limited total moves.',
      difficulty: 'HARD',
      objective: { type: 'SCORE', targetScore: 4000 + (num - 15) * 1000 },
      moveLimit: 25 - (num - 16) * 2,
      starRequirements: {
        twoStarScore: 6000 + num * 500,
        threeStarScore: 9000 + num * 700,
      },
      rewards: { coins: 200, xp: 100 },
      seed: 4000 + num,
    };
  } else if (num <= 25) {
    // Levels 21-25: High Combos & Composite Objectives
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Cosmic Cascade ${num}`,
      description: 'Perform high-tier combos and line sweeps.',
      difficulty: 'HARD',
      objective: {
        type: 'COMPOSITE',
        objectives: [
          { type: 'SCORE', targetScore: 8000 },
          { type: 'COMBO', targetCombo: 4 },
        ],
      },
      moveLimit: 30,
      starRequirements: {
        twoStarScore: 10000,
        threeStarScore: 14000,
      },
      rewards: { coins: 250, xp: 125 },
      seed: 5000 + num,
    };
  } else {
    // Levels 26-30: Expert Finale
    return {
      id,
      worldId: 'world-1',
      levelNumber: num,
      name: `Nova Pinnacle ${num}`,
      description: 'The ultimate test of strategic block placement.',
      difficulty: 'EXPERT',
      objective: {
        type: 'COMPOSITE',
        objectives: [
          { type: 'SCORE', targetScore: 10000 + (num - 25) * 1500 },
          { type: 'LINES', targetLines: 20 },
          { type: 'COMBO', targetCombo: 4 },
        ],
      },
      moveLimit: 35,
      initialBoard: [
        { r: 2, c: 2, color: COLORS.MAGENTA },
        { r: 2, c: 5, color: COLORS.MAGENTA },
        { r: 5, c: 2, color: COLORS.AMBER },
        { r: 5, c: 5, color: COLORS.AMBER },
      ],
      starRequirements: {
        twoStarScore: 14000 + (num - 25) * 1000,
        threeStarScore: 18000 + (num - 25) * 1500,
      },
      rewards: { coins: 350 + (num - 25) * 30, xp: 200 + (num - 25) * 20 },
      seed: 6000 + num,
    };
  }
});

export const WORLD_1_DATA: WorldData = {
  id: 'world-1',
  name: 'Nova Valley',
  description: 'Begin your journey across the glowing crystalline sectors.',
  order: 1,
  themeColor: '#00F0FF',
  unlockRequirementStars: 0,
  levels: WORLD_1_LEVELS,
};
