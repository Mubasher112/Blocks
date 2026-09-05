import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Piece as PieceModel } from '../game/Piece';

interface PieceProps {
  piece: PieceModel;
  isDragging?: boolean;
  scale?: number;
}

export const PieceComponent: React.FC<PieceProps> = ({
  piece,
  isDragging = false,
  scale = 1,
}) => {
  return (
    <View
      style={[
        styles.pieceContainer,
        {
          transform: [{ scale }],
          opacity: isDragging ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.pieceGrid}>
        {piece.matrix.map((row, r) => (
          <View key={r} style={styles.pieceRow}>
            {row.map((cell, c) => (
              <View
                key={c}
                style={[
                  styles.pieceCell,
                  {
                    backgroundColor: cell === 1 ? piece.color : 'transparent',
                    borderColor: cell === 1 ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pieceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceGrid: {
    gap: 3,
  },
  pieceRow: {
    flexDirection: 'row',
    gap: 3,
  },
  pieceCell: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
  },
});
