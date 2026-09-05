import { Piece } from './Piece';
import { PIECE_LIBRARY } from './PieceLibrary';
import { SeededRandom } from '../utils/random';

export class PieceGenerator {
  private rng: SeededRandom;

  constructor(seed?: number) {
    this.rng = new SeededRandom(seed);
  }

  /**
   * Generates a single random Piece instance
   */
  public generatePiece(): Piece {
    const shape = this.rng.pick(PIECE_LIBRARY);
    return new Piece(shape);
  }

  /**
   * Generates 3 pieces for the piece tray
   */
  public generateTray(): [Piece, Piece, Piece] {
    return [
      this.generatePiece(),
      this.generatePiece(),
      this.generatePiece(),
    ];
  }
}
