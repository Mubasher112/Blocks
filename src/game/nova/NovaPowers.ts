import { NovaPower, NovaPowerId } from './NovaTypes';

export const NOVA_POWERS: Record<NovaPowerId, NovaPower> = {
  pulse: {
    id: 'pulse',
    name: 'Pulse',
    description: 'Clears a selected 3x3 area on the board.',
    icon: 'zap',
    cost: 0,
  },
  wild: {
    id: 'wild',
    name: 'Wild',
    description: 'Transforms a piece in your tray into a shape of your choice.',
    icon: 'sparkles',
    cost: 0,
  },
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle',
    description: 'Rerolls all remaining pieces in your tray.',
    icon: 'refresh-cw',
    cost: 0,
  },
  undo: {
    id: 'undo',
    name: 'Undo',
    description: 'Restores board, score, and tray to the previous valid turn.',
    icon: 'rotate-ccw',
    cost: 0,
  },
  prism: {
    id: 'prism',
    name: 'Prism',
    description: 'Arms your next line clear with +50 bonus score.',
    icon: 'sun',
    cost: 0,
    isPassive: true,
  },
};
