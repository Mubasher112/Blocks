export type PieceCategory = 'basic' | 'square' | 'shapes' | 'irregular';

export interface PieceCell {
  r: number;
  c: number;
}

export interface PieceShape {
  id: string;
  name: string;
  category: PieceCategory;
  matrix: number[][]; // 2D array where 1 represents cell, 0 empty
  color: string;      // Accent color hex/hsl for rendering
}

export class Piece {
  public readonly id: string;
  public readonly shapeId: string;
  public readonly name: string;
  public readonly category: PieceCategory;
  public readonly matrix: number[][];
  public readonly color: string;
  public readonly height: number;
  public readonly width: number;
  public readonly blockCount: number;
  public readonly occupiedCells: PieceCell[];

  constructor(shape: PieceShape, instanceId?: string) {
    this.shapeId = shape.id;
    this.id = instanceId || `${shape.id}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = shape.name;
    this.category = shape.category;
    this.matrix = shape.matrix;
    this.color = shape.color;

    this.height = shape.matrix.length;
    this.width = shape.matrix[0]?.length || 0;

    const cells: PieceCell[] = [];
    let count = 0;

    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.matrix[r][c] === 1) {
          cells.push({ r, c });
          count++;
        }
      }
    }

    this.occupiedCells = cells;
    this.blockCount = count;
  }
}
