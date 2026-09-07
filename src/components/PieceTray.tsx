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

          const native = e.nativeEvent || e;
          let pageX: number | undefined;
          let pageY: number | undefined;

          // 1. Native touches array
          if (native.touches && native.touches.length > 0) {
            pageX = native.touches[0].pageX;
            pageY = native.touches[0].pageY;
          } else if (native.changedTouches && native.changedTouches.length > 0) {
            pageX = native.changedTouches[0].pageX;
            pageY = native.changedTouches[0].pageY;
          } else if (typeof native.pageX === 'number' && !isNaN(native.pageX) && native.pageX !== 0) {
            pageX = native.pageX;
            pageY = native.pageY;
          } else if (typeof native.clientX === 'number' && !isNaN(native.clientX)) {
            pageX = native.clientX;
            pageY = native.clientY;
          } else if (typeof e.pageX === 'number' && !isNaN(e.pageX) && e.pageX !== 0) {
            pageX = e.pageX;
            pageY = e.pageY;
          } else if (typeof e.clientX === 'number' && !isNaN(e.clientX)) {
            pageX = e.clientX;
            pageY = e.clientY;
          }

          // 2. Reliable slot center fallback if coordinates unavailable
          if (typeof pageX !== 'number' || isNaN(pageX) || typeof pageY !== 'number' || isNaN(pageY) || (pageX === 0 && pageY === 0)) {
            const target = native.target || e.target;
            if (target && typeof target.getBoundingClientRect === 'function') {
              const rect = target.getBoundingClientRect();
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
                  pointerEvents: 'none',
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
    backgroundColor: 'rgba(22, 27, 46, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    height: 125,
    padding: 8,
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
