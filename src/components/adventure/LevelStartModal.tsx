import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Play, X, Target } from 'lucide-react-native';
import { AdventureLevel } from '../../game/adventure/AdventureTypes';

interface LevelStartModalProps {
  level: AdventureLevel;
  onStart: () => void;
  onClose: () => void;
}

export const LevelStartModal: React.FC<LevelStartModalProps> = ({
  level,
  onStart,
  onClose,
}) => {
  const getObjectiveText = () => {
    switch (level.objective.type) {
      case 'SCORE':
        return `Reach ${level.objective.targetScore.toLocaleString()} Points`;
      case 'LINES':
        return `Clear ${level.objective.targetLines} Lines`;
      case 'COMBO':
        return `Achieve a ${level.objective.targetCombo}x Combo`;
      case 'COMPOSITE':
        return level.objective.objectives
          .map((obj) => {
            if (obj.type === 'SCORE') return `${obj.targetScore.toLocaleString()} Pts`;
            if (obj.type === 'LINES') return `${obj.targetLines} Lines`;
            if (obj.type === 'COMBO') return `${obj.targetCombo}x Combo`;
            return '';
          })
          .join(' & ');
    }
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.levelBadge}>LEVEL {level.levelNumber}</Text>
          <Text style={styles.levelTitle}>{level.name}</Text>
          <Text style={styles.levelDesc}>{level.description}</Text>

          <View style={styles.objectiveCard}>
            <Target size={24} color="#00F0FF" />
            <View style={styles.objectiveDetails}>
              <Text style={styles.objectiveLabel}>GOAL</Text>
              <Text style={styles.objectiveValue}>{getObjectiveText()}</Text>
            </View>
          </View>

          {level.moveLimit !== undefined && (
            <View style={styles.moveLimitBadge}>
              <Text style={styles.moveLimitText}>⚡ {level.moveLimit} Moves Limit</Text>
            </View>
          )}

          <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.8}>
            <Play size={24} color="#0d0f17" fill="#0d0f17" />
            <Text style={styles.startBtnText}>START LEVEL</Text>
          </TouchableOpacity>
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
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  levelBadge: {
    color: '#FFB800',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  levelTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  levelDesc: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  objectiveCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00F0FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  objectiveDetails: {
    flex: 1,
  },
  objectiveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9ca3af',
  },
  objectiveValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  moveLimitBadge: {
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  moveLimitText: {
    color: '#FF007F',
    fontWeight: '800',
    fontSize: 12,
  },
  startBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#00F0FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  startBtnText: {
    color: '#0d0f17',
    fontWeight: '900',
    fontSize: 16,
  },
});
