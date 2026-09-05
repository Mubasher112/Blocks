import { WorldData, AdventureLevel } from '../AdventureTypes';
import { WORLD_1_DATA } from './world1';

export const ALL_WORLDS: WorldData[] = [WORLD_1_DATA];

export function getWorld(worldId: string): WorldData | undefined {
  return ALL_WORLDS.find(w => w.id === worldId);
}

export function getLevel(levelId: string): AdventureLevel | undefined {
  for (const world of ALL_WORLDS) {
    const level = world.levels.find(l => l.id === levelId);
    if (level) return level;
  }
  return undefined;
}
