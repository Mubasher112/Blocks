import React from 'react';
import { View, StyleSheet } from 'react-native';
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
      {tray.map((piece, index) => {
        const handleStart = (e: any) => {
          if (!piece || activeDragIndex !== null) return;
          if (e.cancelable) e.preventDefault();

          let pageX: number | undefined;
          let pageY: number | undefined;

          const nativeEvt = e.nativeEvent || e;
          const touch = nativeEvt.touches?.[0] || nativeEvt.changedTouches?.[0];
          if (touch) {
            pageX = touch.pageX;
            pageY = touch.pageY;
          } else if (typeof e.pageX === 'number') {
            pageX = e.pageX;
            pageY = e.pageY;
          } else if (typeof e.clientX === 'number') {
            pageX = e.clientX;
            pageY = e.clientY;
          }

          if (typeof pageX !== 'number' || isNaN(pageX) || typeof pageY !== 'number' || isNaN(pageY)) {
            if (e.currentTarget && typeof e.currentTarget.getBoundingClientRect === 'function') {
              const rect = e.currentTarget.getBoundingClientRect();
              pageX = rect.left + rect.width / 2;
              pageY = rect.top + rect.height / 2;
            } else {
              pageX = 0;
              pageY = 0;
            }
          }

          if (typeof pageX === 'number' && typeof pageY === 'number') {
            onGrantTouch(index, pageX, pageY);
          }
        };

        return (
          <View
            key={index}
            style={styles.traySlot}
            onPointerDown={handleStart}
            onTouchStart={handleStart}
            onMouseDown={handleStart}
          >
          {piece && (
            <View
              style={{
                opacity: activeDragIndex === index ? 0 : 1,
                pointerEvents: activeDragIndex === index ? 'none' : 'auto',
              } as any}
            >
              <PieceComponent piece={piece} scale={0.8} />
            </View>
          )}
        </View>
      );
    })}
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
    userSelect: 'none',
  } as any,
  traySlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
  } as any,
});
