import { PieceShape } from './Piece';

// Colors for Nova Theme
const COLORS = {
  CYAN: '#00F0FF',
  MAGENTA: '#FF007F',
  AMBER: '#FFB800',
  EMERALD: '#00E676',
  PURPLE: '#A855F7',
  BLUE: '#3B82F6',
  ORANGE: '#FF6B00',
  PINK: '#EC4899',
  TEAL: '#14B8A6',
};

export const PIECE_LIBRARY: PieceShape[] = [
  // --- BASIC ---
  {
    id: 'dot-1',
    name: '1x1 Dot',
    category: 'basic',
    matrix: [[1]],
    color: COLORS.CYAN,
  },
  {
    id: 'line-2-h',
    name: '2 Horizontal',
    category: 'basic',
    matrix: [[1, 1]],
    color: COLORS.BLUE,
  },
  {
    id: 'line-2-v',
    name: '2 Vertical',
    category: 'basic',
    matrix: [[1], [1]],
    color: COLORS.BLUE,
  },
  {
    id: 'line-3-h',
    name: '3 Horizontal',
    category: 'basic',
    matrix: [[1, 1, 1]],
    color: COLORS.EMERALD,
  },
  {
    id: 'line-3-v',
    name: '3 Vertical',
    category: 'basic',
    matrix: [[1], [1], [1]],
    color: COLORS.EMERALD,
  },
  {
    id: 'line-4-h',
    name: '4 Horizontal',
    category: 'basic',
    matrix: [[1, 1, 1, 1]],
    color: COLORS.AMBER,
  },
  {
    id: 'line-4-v',
    name: '4 Vertical',
    category: 'basic',
    matrix: [[1], [1], [1], [1]],
    color: COLORS.AMBER,
  },
  {
    id: 'line-5-h',
    name: '5 Horizontal',
    category: 'basic',
    matrix: [[1, 1, 1, 1, 1]],
    color: COLORS.MAGENTA,
  },
  {
    id: 'line-5-v',
    name: '5 Vertical',
    category: 'basic',
    matrix: [[1], [1], [1], [1], [1]],
    color: COLORS.MAGENTA,
  },

  // --- SQUARES ---
  {
    id: 'square-2x2',
    name: '2x2 Square',
    category: 'square',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: COLORS.PURPLE,
  },
  {
    id: 'square-3x3',
    name: '3x3 Square',
    category: 'square',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: COLORS.PINK,
  },

  // --- SHAPES ---
  // L shapes
  {
    id: 'l-2x2-1',
    name: 'Corner L 2x2',
    category: 'shapes',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: COLORS.ORANGE,
  },
  {
    id: 'l-2x2-2',
    name: 'Corner L 2x2 Rotated',
    category: 'shapes',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: COLORS.ORANGE,
  },
  {
    id: 'l-3x3-normal',
    name: 'L 3x3',
    category: 'shapes',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: COLORS.ORANGE,
  },
  {
    id: 'l-3x3-reverse',
    name: 'Reverse L 3x3',
    category: 'shapes',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: COLORS.ORANGE,
  },

  // T shapes
  {
    id: 't-3x2',
    name: 'T Shape',
    category: 'shapes',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: COLORS.TEAL,
  },
  {
    id: 't-3x2-inv',
    name: 'T Shape Inverted',
    category: 'shapes',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: COLORS.TEAL,
  },

  // S & Z shapes
  {
    id: 's-shape',
    name: 'S Shape',
    category: 'shapes',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: COLORS.CYAN,
  },
  {
    id: 'z-shape',
    name: 'Z Shape',
    category: 'shapes',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: COLORS.MAGENTA,
  },

  // --- IRREGULAR SHAPES ---
  {
    id: 'plus-3x3',
    name: 'Plus Shape',
    category: 'irregular',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: COLORS.AMBER,
  },
  {
    id: 'stair-3x3',
    name: 'Stair Step',
    category: 'irregular',
    matrix: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: COLORS.PURPLE,
  },
  {
    id: 'u-shape',
    name: 'U Shape',
    category: 'irregular',
    matrix: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: COLORS.BLUE,
  },
];
