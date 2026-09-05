import React from 'react';
import { Board } from '../game/Board';
import { Piece } from '../game/Piece';

interface GameBoardProps {
  board: Board;
  draggedPiece: Piece | null;
  previewPos: { r: number; c: number } | null;
  isValidPreview: boolean;
  clearingCells: Set<string>;
  floatingScores: { id: number; score: number; r: number; c: number }[];
  boardRef: React.RefObject<HTMLDivElement>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  draggedPiece,
  previewPos,
  isValidPreview,
  clearingCells,
  floatingScores,
  boardRef,
}) => {
  const grid = board.getGrid();

  // Helper to test if cell (r, c) is covered by active preview
  const isCellInPreview = (r: number, c: number): boolean => {
    if (!draggedPiece || !previewPos) return false;
    return draggedPiece.occupiedCells.some(
      cell => previewPos.r + cell.r === r && previewPos.c + cell.c === c
    );
  };

  return (
    <div className="board-wrapper">
      <div className="board-grid" ref={boardRef}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const inPreview = isCellInPreview(r, c);
            const isClearing = clearingCells.has(`${r},${c}`);
            const isOccupied = cell.state === 'OCCUPIED';

            let cellBg = 'var(--cell-empty)';
            let cellShadow = 'none';
            let borderStyle = '1px solid var(--cell-border)';

            if (isClearing) {
              cellBg = '#ffffff';
              cellShadow = '0 0 15px #ffffff';
            } else if (isOccupied) {
              cellBg = cell.color || 'var(--accent-cyan)';
              cellShadow = `inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 10px ${cell.color}66`;
            } else if (inPreview) {
              if (isValidPreview) {
                cellBg = `${draggedPiece?.color}aa`;
                cellShadow = `0 0 12px ${draggedPiece?.color}`;
              } else {
                cellBg = 'rgba(255, 0, 85, 0.4)';
                borderStyle = '1px solid #ff0055';
              }
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`board-cell ${isClearing ? 'clearing' : ''} ${
                  inPreview ? 'preview' : ''
                }`}
                style={{
                  backgroundColor: cellBg,
                  boxShadow: cellShadow,
                  border: borderStyle,
                }}
              />
            );
          })
        )}

        {/* Floating score animations */}
        {floatingScores.map(item => (
          <div
            key={item.id}
            className="floating-score"
            style={{
              top: `${(item.r / 8) * 100}%`,
              left: `${(item.c / 8) * 100}%`,
            }}
          >
            +{item.score}
          </div>
        ))}
      </div>

      <style>{`
        .board-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          width: 100%;
        }

        .board-grid {
          aspect-ratio: 1 / 1;
          width: 100%;
          max-width: 420px;
          display: grid;
          grid-template-rows: repeat(8, 1fr);
          grid-template-columns: repeat(8, 1fr);
          gap: 6px;
          background: var(--panel-bg);
          border: 2px solid var(--panel-border);
          border-radius: 20px;
          padding: 10px;
          backdrop-filter: blur(10px);
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .board-cell {
          border-radius: 8px;
          transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }

        .board-cell.clearing {
          animation: popIn 0.2s ease-in-out infinite alternate;
        }

        .floating-score {
          position: absolute;
          color: var(--accent-amber);
          font-weight: 900;
          font-size: 1.4rem;
          pointer-events: none;
          animation: floatUp 0.8s ease-out forwards;
          text-shadow: 0 0 10px rgba(255, 184, 0, 0.8);
          z-index: 20;
        }
      `}</style>
    </div>
  );
};
