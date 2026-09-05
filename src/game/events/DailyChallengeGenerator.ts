import { DailyChallenge, DailyNovaConfig } from './DailyChallengeTypes';
import { LevelObjective, InitialBoardCell } from '../adventure/AdventureTypes';

export class DailyChallengeGenerator {
  /**
   * Helper to get current UTC date string in YYYY-MM-DD format
   */
  public static getUtcDateString(date: Date = new Date()): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generates a numeric seed hash from date string
   */
  public static seedFromDateString(dateStr: string): number {
    let hash = 0;
    const str = `block_nova_daily_${dateStr}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Generates a deterministic DailyChallenge object for given UTC date YYYY-MM-DD
   */
  public static generateForDate(dateStr: string): DailyChallenge {
    const id = `daily:${dateStr}`;
    const seed = this.seedFromDateString(dateStr);

    // Simple pseudo-RNG based on seed for generating properties
    let s = seed;
    const nextRandom = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Cycle difficulty: MON=EASY, TUE/WED=MEDIUM, THU/FRI=HARD, SAT/SUN=EXPERT
    const dateObj = new Date(`${dateStr}T00:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 6=Sat

    let difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' = 'MEDIUM';
    if (dayOfWeek === 1) difficulty = 'EASY';
    else if (dayOfWeek === 2 || dayOfWeek === 3) difficulty = 'MEDIUM';
    else if (dayOfWeek === 4 || dayOfWeek === 5) difficulty = 'HARD';
    else difficulty = 'EXPERT';

    // Objective variations
    const objectiveTypes = ['SCORE', 'LINES', 'COMBO', 'COMPOSITE'];
    const chosenType = objectiveTypes[Math.floor(nextRandom() * objectiveTypes.length)];

    let objective: LevelObjective;
    let targetScore = 3000 + Math.floor(nextRandom() * 4000);
    let targetLines = 8 + Math.floor(nextRandom() * 12);

    if (chosenType === 'SCORE') {
      objective = { type: 'SCORE', targetScore };
    } else if (chosenType === 'LINES') {
      objective = { type: 'LINES', targetLines };
    } else if (chosenType === 'COMBO') {
      objective = { type: 'COMBO', targetCombo: 3 + Math.floor(nextRandom() * 2) };
    } else {
      objective = {
        type: 'COMPOSITE',
        objectives: [
          { type: 'SCORE', targetScore: Math.floor(targetScore * 0.7) },
          { type: 'LINES', targetLines: Math.floor(targetLines * 0.7) },
        ],
      };
    }

    // Move limit
    const moveLimit = 15 + Math.floor(nextRandom() * 20);

    // Initial board pre-population
    const initialBoard: InitialBoardCell[] = [];
    const cellCount = Math.floor(nextRandom() * 8); // 0 to 7 pre-filled cells
    const colors = ['#00F0FF', '#FF007F', '#FFB800', '#00E676', '#3B82F6'];

    for (let i = 0; i < cellCount; i++) {
      const r = Math.floor(nextRandom() * 8);
      const c = Math.floor(nextRandom() * 8);
      const color = colors[Math.floor(nextRandom() * colors.length)];
      initialBoard.push({ r, c, color });
    }

    // Nova config
    const novaConfig: DailyNovaConfig = {
      novaEnabled: true,
      novaEnergyMultiplier: 1.0,
      availablePowers: ['pulse', 'wild', 'shuffle', 'undo', 'prism'],
      novaScoreMultiplier: 2.0,
    };

    const startsAt = `${dateStr}T00:00:00.000Z`;
    const nextDay = new Date(dateObj.getTime() + 86400000);
    const nextDayStr = this.getUtcDateString(nextDay);
    const endsAt = `${nextDayStr}T00:00:00.000Z`;

    return {
      id,
      challengeDate: dateStr,
      seed,
      title: `Daily Nova: ${dateStr}`,
      description: `Daily Puzzle for ${dateStr}. Complete the objective in ${moveLimit} moves or fewer!`,
      objective,
      targetScore,
      targetLines,
      moveLimit,
      initialBoard,
      scoreMultiplier: 1.0,
      novaConfig,
      difficulty,
      version: 1,
      rewards: {
        coins: 100 + Math.floor(nextRandom() * 100),
        xp: 200 + Math.floor(nextRandom() * 150),
      },
      startsAt,
      endsAt,
    };
  }
}
