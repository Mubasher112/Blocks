import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import { PIECE_LIBRARY } from '../../game/PieceLibrary';
import { Piece } from '../../game/Piece';

interface WildShapePickerProps {
  visible: boolean;
  onSelectShape: (piece: Piece, slotIndex: number) => void;
  onCancel: () => void;
  tray?: (Piece | null)[];
}

export const WildShapePicker: React.FC<WildShapePickerProps> = ({
  visible,
  onSelectShape,
  onCancel,
  tray = [],
}) => {
  if (!visible) return null;

  // Find first active slot or default to 0
  const firstActiveIndex = tray.findIndex(p => p !== null);
  const initialIndex = firstActiveIndex >= 0 ? firstActiveIndex : 0;
  const [selectedSlot, setSelectedSlot] = useState<number>(initialIndex);

  useEffect(() => {
    const active = tray.findIndex(p => p !== null);
    setSelectedSlot(active >= 0 ? active : 0);
  }, [visible, tray]);

  const selectableShapes = PIECE_LIBRARY.filter(
    t => t.id === 'dot-1' || t.id === 'line-2-h' || t.id === 'square-2x2' || t.id === 'l-2x2-1' || t.id === 'plus-3x3'
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={20} color="#FF007A" />
              <Text style={styles.title}>NOVA WILD</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Slot Selection Row */}
          <Text style={styles.sectionLabel}>Select Tray Slot to Replace:</Text>
          <View style={styles.slotRow}>
            {[0, 1, 2].map((slotIdx) => {
              const pieceInSlot = tray[slotIdx];
              const isSelected = selectedSlot === slotIdx;
              return (
                <TouchableOpacity
                  key={slotIdx}
                  style={[
                    styles.slotButton,
                    isSelected && styles.slotButtonActive,
                    !pieceInSlot && styles.slotButtonEmpty,
                  ]}
                  onPress={() => setSelectedSlot(slotIdx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                    Slot {slotIdx + 1}
                  </Text>
                  <Text style={styles.slotSubtext}>
                    {pieceInSlot ? pieceInSlot.name : '(Empty)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.instruction}>
            Select a Wild shape to place into Slot {selectedSlot + 1}:
          </Text>

          <ScrollView contentContainerStyle={styles.pickerGrid}>
            {selectableShapes.map(shapeDef => {
              const dummyPiece = new Piece(shapeDef, `wild-${Date.now()}`);
              return (
                <TouchableOpacity
                  key={shapeDef.id}
                  style={styles.shapeOptionCard}
                  onPress={() => onSelectShape(dummyPiece, selectedSlot)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.shapeName}>{shapeDef.name}</Text>
                  <View style={styles.previewBox}>
                    {shapeDef.matrix.map((row, r) => (
                      <View key={r} style={styles.previewRow}>
                        {row.map((val, c) => (
                          <View
                            key={c}
                            style={[
                              styles.miniCell,
                              val === 1 && styles.miniCellActive,
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
    borderColor: '#FF007A',
    maxHeight: '85%',
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
    color: '#FF007A',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionLabel: {
    color: '#E0E0F0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  slotButton: {
    flex: 1,
    backgroundColor: '#1E2230',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2D3245',
  },
  slotButtonActive: {
    borderColor: '#FF007A',
    backgroundColor: '#2E1A2E',
  },
  slotButtonEmpty: {
    opacity: 0.7,
  },
  slotText: {
    color: '#A0A0B0',
    fontSize: 11,
    fontWeight: '700',
  },
  slotTextActive: {
    color: '#FF007A',
    fontWeight: '900',
  },
  slotSubtext: {
    color: '#707080',
    fontSize: 9,
    marginTop: 2,
  },
  instruction: {
    color: '#A0A0B0',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  shapeOptionCard: {
    width: 96,
    height: 96,
    backgroundColor: '#1E2230',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF007A',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRow: {
    flexDirection: 'row',
  },
  miniCell: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  miniCellActive: {
    backgroundColor: '#FF007A',
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
