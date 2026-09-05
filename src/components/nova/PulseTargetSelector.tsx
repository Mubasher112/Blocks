import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Zap, X } from 'lucide-react';

interface PulseTargetSelectorProps {
  visible: boolean;
  onSelectCell: (r: number, c: number) => void;
  onCancel: () => void;
}

export const PulseTargetSelector: React.FC<PulseTargetSelectorProps> = ({
  visible,
  onSelectCell,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Zap size={20} color="#FFE600" />
              <Text style={styles.title}>NOVA PULSE</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            Tap any cell on the 8x8 grid to blast a 3x3 surrounding area!
          </Text>

          <View style={styles.gridContainer}>
            {Array.from({ length: 8 }).map((_, r) => (
              <View key={r} style={styles.row}>
                {Array.from({ length: 8 }).map((_, c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.cellButton}
                    onPress={() => onSelectCell(r, c)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.cellText}>{`${r},${c}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
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
  },
  header: {
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
  },
  instruction: {
    color: '#A0A0B0',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  gridContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#0C0E14',
    borderRadius: 8,
    padding: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cellButton: {
    flex: 1,
    margin: 2,
    backgroundColor: '#1E2230',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: '#FFE600',
    fontSize: 9,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#2A2E3D',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
