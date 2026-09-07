import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Zap, X } from 'lucide-react-native';
import { Board } from '../../game/Board';

interface PulseTargetSelectorProps {
  visible: boolean;
  onSelectCell: (r: number, c: number) => void;
  onCancel: () => void;
  board?: Board;
}

export const PulseTargetSelector: React.FC<PulseTargetSelectorProps> = ({
  visible,
  onSelectCell,
  onCancel,
  board,
}) => {
  const [targetedCell, setTargetedCell] = useState<{ r: number; c: number } | null>(null);

  if (!visible) return null;

  const grid = board ? board.getGrid() : null;

  // Calculate how many blocks will be cleared in the targeted 3x3 area
  let blocksToClear = 0;
  if (targetedCell && grid) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = targetedCell.r + dr;
        const nc = targetedCell.c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (grid[nr][nc].state === 'OCCUPIED') {
            blocksToClear++;
          }
        }
      }
    }
  }

  const handleCellPress = (r: number, c: number) => {
    if (targetedCell && targetedCell.r === r && targetedCell.c === c) {
      // Double tap on same cell fires immediately
      onSelectCell(r, c);
    } else {
      setTargetedCell({ r, c });
    }
  };

  const handleConfirmFire = () => {
    if (targetedCell) {
      onSelectCell(targetedCell.r, targetedCell.c);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Zap size={22} color="#FFE600" />
              <Text style={styles.title}>NOVA PULSE TARGET</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            {targetedCell
              ? `Target: (${targetedCell.r + 1}, ${targetedCell.c + 1}) · Will destroy ${blocksToClear} block${blocksToClear === 1 ? '' : 's'}`
              : 'Tap a tile on the board to target the 3x3 blast area!'}
          </Text>

          <View style={styles.gridContainer}>
            {Array.from({ length: 8 }).map((_, r) => (
              <View key={r} style={styles.row}>
                {Array.from({ length: 8 }).map((_, c) => {
                  const cell = grid ? grid[r][c] : null;
                  const isFilled = cell && cell.state === 'OCCUPIED';
                  const cellColor = cell?.color || '#00F0FF';

                  // Is this cell within the 3x3 blast zone?
                  const inBlastZone =
                    targetedCell !== null &&
                    Math.abs(targetedCell.r - r) <= 1 &&
                    Math.abs(targetedCell.c - c) <= 1;

                  const isCenter =
                    targetedCell !== null &&
                    targetedCell.r === r &&
                    targetedCell.c === c;

                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cellButton,
                        isFilled && { backgroundColor: cellColor },
                        inBlastZone && styles.cellBlastZone,
                        isCenter && styles.cellCenter,
                      ]}
                      onPress={() => handleCellPress(r, c)}
                      activeOpacity={0.7}
                    >
                      {isCenter ? (
                        <Zap size={14} color="#FFF" />
                      ) : inBlastZone && isFilled ? (
                        <View style={styles.blastIndicator} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            {targetedCell && (
              <TouchableOpacity
                style={styles.fireBtn}
                onPress={handleConfirmFire}
                activeOpacity={0.8}
              >
                <Zap size={16} color="#000" />
                <Text style={styles.fireBtnText}>FIRE PULSE</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, targetedCell && { flex: 1 }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFE600',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFE600',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  instruction: {
    color: '#E0E0F0',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
    minHeight: 16,
  },
  gridContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0C0E14',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#2D3245',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cellButton: {
    flex: 1,
    margin: 2,
    backgroundColor: '#1A1E2B',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellBlastZone: {
    borderWidth: 1.5,
    borderColor: '#FFE600',
    backgroundColor: '#3E3414',
  },
  cellCenter: {
    backgroundColor: '#FFE600',
    borderColor: '#FFF',
    borderWidth: 2,
  },
  blastIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE600',
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  fireBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFE600',
    borderRadius: 8,
    paddingVertical: 12,
  },
  fireBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#2A2E3D',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
