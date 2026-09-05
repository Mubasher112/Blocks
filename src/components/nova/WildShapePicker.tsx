import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Sparkles, X } from 'lucide-react';
import { PIECE_LIBRARY } from '../../game/PieceLibrary';
import { Piece } from '../../game/Piece';

interface WildShapePickerProps {
  visible: boolean;
  onSelectShape: (piece: Piece) => void;
  onCancel: () => void;
}

export const WildShapePicker: React.FC<WildShapePickerProps> = ({
  visible,
  onSelectShape,
  onCancel,
}) => {
  if (!visible) return null;

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

          <Text style={styles.instruction}>
            Select a shape to convert a tray piece into a Wild piece!
          </Text>

          <ScrollView contentContainerStyle={styles.pickerGrid}>
            {selectableShapes.map(shapeDef => {
              const dummyPiece = new Piece(shapeDef, 'wild-selected');
              return (
                <TouchableOpacity
                  key={shapeDef.id}
                  style={styles.shapeOptionCard}
                  onPress={() => onSelectShape(dummyPiece)}
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
    maxHeight: '80%',
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
    width: 100,
    height: 100,
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
