import React from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { Piece as PieceModel } from '../game/Piece';
import { PieceComponent } from './Piece';

export interface PieceTrayProps {
  tray: (PieceModel | null)[];
  activeDragIndex: number | null;
  onGrantTouch: (index: number, x: number, y: number) => void;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  tray,
  activeDragIndex,
  onGrantTouch,
}) => {
  return (
    <View style={styles.trayContainer}>
      {tray.map((piece, index) => (
        <View
          key={index}
          style={styles.traySlot}
          onTouchStart={(e: GestureResponderEvent) => {
            if (piece && activeDragIndex === null) {
              const { pageX, pageY } = e.nativeEvent;
              onGrantTouch(index, pageX, pageY);
            }
          }}
        >
          {piece && activeDragIndex !== index && (
            <PieceComponent piece={piece} scale={0.8} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  trayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 120,
    padding: 10,
  },
  traySlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
