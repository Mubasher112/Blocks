import React from 'react';
import { Piece as PieceModel } from '../game/Piece';

interface PieceProps {
  piece: PieceModel;
  isDragging?: boolean;
  scale?: number;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const PieceComponent: React.FC<PieceProps> = ({
  piece,
  isDragging = false,
  scale = 1,
  onPointerDown,
}) => {
  const cellSize = 32; // Base preview cell size in px

  return (
    <div
      className={`piece-container ${isDragging ? 'dragging' : ''}`}
      onPointerDown={onPointerDown}
      style={{
        transform: `scale(${scale})`,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.9 : 1,
      }}
    >
      <div
        className="piece-grid"
        style={{
          gridTemplateRows: `repeat(${piece.height}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${piece.width}, ${cellSize}px)`,
        }}
      >
        {piece.matrix.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`piece-cell ${cell === 1 ? 'active' : 'empty'}`}
              style={{
                backgroundColor: cell === 1 ? piece.color : 'transparent',
                boxShadow:
                  cell === 1
                    ? `inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 10px ${piece.color}66`
                    : 'none',
              }}
            />
          ))
        )}
      </div>

      <style>{`
        .piece-container {
          display: inline-flex;
          user-select: none;
          transition: transform 0.1s ease;
        }

        .piece-container.dragging {
          transition: none;
        }

        .piece-grid {
          display: grid;
          gap: 3px;
        }

        .piece-cell {
          width: ${cellSize}px;
          height: ${cellSize}px;
          border-radius: 6px;
        }

        .piece-cell.active {
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};
