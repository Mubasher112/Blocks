import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { RotateCcw, Map } from 'lucide-react-native';
import { AdventureLevel } from '../../game/adventure/AdventureTypes';

interface LevelFailedModalProps {
  level: AdventureLevel;
  score: number;
  onRetry: () => void;
  onMap: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  score,
  onRetry,
  onMap,
}) => {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.subtitle}>OBJECTIVE NOT MET</Text>
          <Text style={styles.title}>LEVEL FAILED</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={onMap} activeOpacity={0.7}>
              <Map size={18} color="#ffffff" />
              <Text style={styles.secondaryBtnText}>MAP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={onRetry} activeOpacity={0.8}>
              <RotateCcw size={18} color="#0d0f17" />
              <Text style={styles.primaryBtnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 15, 23, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 27, 46, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    color: '#FF007F',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF007F',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#00F0FF',
  },
  primaryBtnText: {
    color: '#0d0f17',
    fontWeight: '900',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
});
