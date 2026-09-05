import React from 'react';
import { Piece as PieceModel } from '../game/Piece';
import { PieceComponent } from './Piece';

interface PieceTrayProps {
  tray: (PieceModel | null)[];
  activeDragIndex: number | null;
  onStartDrag: (index: number, e: React.PointerEvent<HTMLDivElement>) => void;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  tray,
  activeDragIndex,
  onStartDrag,
}) => {
  return (
    <div className="tray-container">
      {tray.map((piece, index) => (
        <div key={index} className="tray-slot">
          {piece && activeDragIndex !== index && (
            <PieceComponent
              piece={piece}
              scale={0.8}
              onPointerDown={(e) => onStartDrag(index, e)}
            />
          )}
        </div>
      ))}

      <style>{`
        .tray-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 20px;
          margin: 12px 20px 20px 20px;
          height: 120px;
          padding: 10px;
          backdrop-filter: blur(10px);
        }

        .tray-slot {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
      `}</style>
    </div>
  );
};
