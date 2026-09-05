import { Piece } from './Piece';

export type CellState = 'EMPTY' | 'OCCUPIED' | 'CLEARING' | 'PREVIEW';

export interface CellData {
  state: CellState;
  color: string | null;
}

export interface BoardPosition {
  r: number;
  c: number;
}

export class Board {
  public static readonly SIZE = 8;
  private grid: CellData[][];

  constructor(initialGrid?: CellData[][]) {
    if (initialGrid) {
      this.grid = initialGrid.map(row => row.map(cell => ({ ...cell })));
    } else {
      this.grid = this.createBoard();
    }
  }

  /**
   * Initializes a fresh 8x8 EMPTY grid
   */
  public createBoard(): CellData[][] {
    const grid: CellData[][] = [];
    for (let r = 0; r < Board.SIZE; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < Board.SIZE; c++) {
        row.push({ state: 'EMPTY', color: null });
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Returns deep clone of current grid data
   */
  public getGrid(): CellData[][] {
    return this.grid.map(row => row.map(cell => ({ ...cell })));
  }

  /**
   * Checks cell state at (r, c)
   */
  public getCell(r: number, c: number): CellData | null {
    if (r < 0 || r >= Board.SIZE || c < 0 || c >= Board.SIZE) {
      return null;
    }
    return this.grid[r][c];
  }

  /**
   * Checks if piece can be legally placed at top-left position (startR, startC)
   */
  public canPlacePiece(piece: Piece, startR: number, startC: number): boolean {
    for (const cell of piece.occupiedCells) {
      const targetR = startR + cell.r;
      const targetC = startC + cell.c;

      // Check bounds
      if (
        targetR < 0 ||
        targetR >= Board.SIZE ||
        targetC < 0 ||
        targetC >= Board.SIZE
      ) {
        return false;
      }

      // Check occupation
      if (this.grid[targetR][targetC].state === 'OCCUPIED') {
        return false;
      }
    }

    return true;
  }

  /**
   * Places piece onto the board if valid.
   * Returns boolean indicating success.
   */
  public placePiece(piece: Piece, startR: number, startC: number): boolean {
    if (!this.canPlacePiece(piece, startR, startC)) {
      return false;
    }

    for (const cell of piece.occupiedCells) {
      const targetR = startR + cell.r;
      const targetC = startC + cell.c;
      this.grid[targetR][targetC] = {
        state: 'OCCUPIED',
        color: piece.color,
      };
    }

    return true;
  }

  /**
   * Finds indices of all completed horizontal rows
   */
  public findCompletedRows(): number[] {
    const rows: number[] = [];
    for (let r = 0; r < Board.SIZE; r++) {
      let full = true;
      for (let c = 0; c < Board.SIZE; c++) {
        if (this.grid[r][c].state !== 'OCCUPIED') {
          full = false;
          break;
        }
      }
      if (full) {
        rows.push(r);
      }
    }
    return rows;
  }

  /**
   * Finds indices of all completed vertical columns
   */
  public findCompletedColumns(): number[] {
    const cols: number[] = [];
    for (let c = 0; c < Board.SIZE; c++) {
      let full = true;
      for (let r = 0; r < Board.SIZE; r++) {
        if (this.grid[r][c].state !== 'OCCUPIED') {
          full = false;
          break;
        }
      }
      if (full) {
        cols.push(c);
      }
    }
    return cols;
  }

  /**
   * Clears completed rows and columns simultaneously.
   * Returns list of cleared cell coordinates and number of lines cleared.
   */
  public clearLines(): {
    clearedCells: BoardPosition[];
    rowsCleared: number[];
    colsCleared: number[];
    lineCount: number;
  } {
    const rowsCleared = this.findCompletedRows();
    const colsCleared = this.findCompletedColumns();

    const cellSet = new Set<string>();
    const clearedCells: BoardPosition[] = [];

    // Collect cells from rows
    for (const r of rowsCleared) {
      for (let c = 0; c < Board.SIZE; c++) {
        const key = `${r},${c}`;
        if (!cellSet.has(key)) {
          cellSet.add(key);
          clearedCells.push({ r, c });
        }
      }
    }

    // Collect cells from columns
    for (const c of colsCleared) {
      for (let r = 0; r < Board.SIZE; r++) {
        const key = `${r},${c}`;
        if (!cellSet.has(key)) {
          cellSet.add(key);
          clearedCells.push({ r, c });
        }
      }
    }

    // Perform actual clearing
    for (const cell of clearedCells) {
      this.grid[cell.r][cell.c] = { state: 'EMPTY', color: null };
    }

    const lineCount = rowsCleared.length + colsCleared.length;

    return {
      clearedCells,
      rowsCleared,
      colsCleared,
      lineCount,
    };
  }

  /**
   * Evaluates if any of the given pieces can be placed anywhere on the board
   */
  public hasAnyValidMove(pieces: (Piece | null)[]): boolean {
    const availablePieces = pieces.filter((p): p is Piece => p !== null);
    if (availablePieces.length === 0) {
      return true; // No pieces remaining in tray means valid round
    }

    for (const piece of availablePieces) {
      for (let r = 0; r <= Board.SIZE - piece.height; r++) {
        for (let c = 0; c <= Board.SIZE - piece.width; c++) {
          if (this.canPlacePiece(piece, r, c)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Clones current Board object
   */
  public clone(): Board {
    return new Board(this.grid);
  }
}
