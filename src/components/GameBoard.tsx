import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Board } from '../game/Board';
import { Piece } from '../game/Piece';

export interface GameBoardProps {
  board: Board;
  draggedPiece: Piece | null;
  previewPos: { r: number; c: number } | null;
  isValidPreview: boolean;
  clearingCells: Set<string>;
  floatingScores: { id: number; score: number; r: number; c: number }[];
  onLayoutBoard: (x: number, y: number, width: number, height: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  draggedPiece,
  previewPos,
  isValidPreview,
  clearingCells,
  floatingScores,
  onLayoutBoard,
}) => {
  const grid = board.getGrid();
  const boardGridRef = React.useRef<any>(null);

  const measureBoard = () => {
    if (boardGridRef.current) {
      if (boardGridRef.current.measureInWindow) {
        boardGridRef.current.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            if (width > 0 && height > 0) {
              onLayoutBoard(x, y, width, height);
            }
          }
        );
      } else if (boardGridRef.current.measure) {
        boardGridRef.current.measure(
          (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
            if (width > 0 && height > 0) {
              onLayoutBoard(pageX, pageY, width, height);
            }
          }
        );
      }
    }
  };

  const isCellInPreview = (r: number, c: number): boolean => {
    if (!draggedPiece || !previewPos) return false;
    return draggedPiece.occupiedCells.some(
      cell => previewPos.r + cell.r === r && previewPos.c + cell.c === c
    );
  };

  return (
    <View style={styles.boardWrapper}>
      <View
        ref={boardGridRef}
        style={styles.boardGrid}
        onLayout={() => {
          measureBoard();
          // Re-measure after layout stabilizes
          setTimeout(measureBoard, 100);
        }}
      >
        {grid.map((row, r) => (
          <View key={r} style={styles.boardRow}>
            {row.map((cell, c) => {
              const inPreview = isCellInPreview(r, c);
              const isClearing = clearingCells.has(`${r},${c}`);
              const isOccupied = cell.state === 'OCCUPIED';

              let cellBg = '#131726';
              let borderColor = 'rgba(255, 255, 255, 0.05)';

              if (isClearing) {
                cellBg = '#ffffff';
                borderColor = '#ffffff';
              } else if (isOccupied) {
                cellBg = cell.color || '#00F0FF';
                borderColor = 'rgba(255, 255, 255, 0.3)';
              } else if (inPreview) {
                if (isValidPreview) {
                  cellBg = draggedPiece?.color || '#00F0FF';
                  borderColor = '#FFFFFF';
                } else {
                  cellBg = 'rgba(255, 0, 85, 0.35)';
                  borderColor = '#FF0055';
                }
              }

              return (
                <View
                  key={c}
                  style={[
                    styles.boardCell,
                    {
                      backgroundColor: cellBg,
                      borderColor: borderColor,
                      borderWidth: inPreview ? 2 : 1,
                      opacity: inPreview && isValidPreview ? 0.65 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}

        {floatingScores.map((item) => (
          <View
            key={item.id}
            style={[
              styles.floatingScore,
              {
                top: `${(item.r / 8) * 100}%`,
                left: `${(item.c / 8) * 100}%`,
              },
            ]}
          >
            <Text style={styles.floatingScoreText}>+{item.score}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  boardGrid: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 420,
    maxWidth: 420,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
    gap: 4,
  },
  boardRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  boardCell: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  floatingScore: {
    position: 'absolute',
    zIndex: 20,
  },
  floatingScoreText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 20,
  },
});
