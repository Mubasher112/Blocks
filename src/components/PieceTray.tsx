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
      {tray.map((piece, index) => (
        <View
          key={index}
          style={styles.traySlot}
          onPointerDown={(e: any) => {
            if (piece && activeDragIndex === null) {
              if (e.target && typeof e.target.setPointerCapture === 'function' && e.pointerId !== undefined) {
                try {
                  e.target.setPointerCapture(e.pointerId);
                } catch (_) {}
              }
              const pageX = e.pageX ?? e.clientX ?? 0;
              const pageY = e.pageY ?? e.clientY ?? 0;
              onGrantTouch(index, pageX, pageY);
            }
          }}
          onTouchStart={(e: any) => {
            if (piece && activeDragIndex === null) {
              if (e.cancelable) e.preventDefault();
              const nativeEvt = e.nativeEvent || e;
              const touch = nativeEvt.touches?.[0] || nativeEvt.changedTouches?.[0] || nativeEvt;
              let pageX = touch?.pageX;
              let pageY = touch?.pageY;

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

              onGrantTouch(index, pageX, pageY);
            }
          }}
          onMouseDown={(e: any) => {
            if (piece && activeDragIndex === null) {
              const pageX = e.pageX ?? e.clientX ?? 0;
              const pageY = e.pageY ?? e.clientY ?? 0;
              onGrantTouch(index, pageX, pageY);
            }
          }}
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
