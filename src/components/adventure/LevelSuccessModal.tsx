import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Star, RotateCcw, ArrowRight, Award } from 'lucide-react-native';
import { AdventureLevel } from '../../game/adventure/AdventureTypes';

interface LevelSuccessModalProps {
  level: AdventureLevel;
  score: number;
  stars: number;
  coinsEarned: number;
  xpEarned: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onMap: () => void;
}

export const LevelSuccessModal: React.FC<LevelSuccessModalProps> = ({
  level,
  score,
  stars,
  coinsEarned,
  xpEarned,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onMap,
}) => {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.titleBadge}>LEVEL {level.levelNumber} CLEAR!</Text>

          <View style={styles.starsContainer}>
            <Star size={36} color="#FFB800" fill={stars >= 1 ? '#FFB800' : 'transparent'} />
            <Star size={44} color="#FFB800" fill={stars >= 2 ? '#FFB800' : 'transparent'} />
            <Star size={36} color="#FFB800" fill={stars >= 3 ? '#FFB800' : 'transparent'} />
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardText}>+{coinsEarned} Coins</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardText}>+{xpEarned} XP</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={onMap} activeOpacity={0.7}>
              <Award size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={onReplay} activeOpacity={0.7}>
              <RotateCcw size={20} color="#ffffff" />
            </TouchableOpacity>

            {hasNextLevel && (
              <TouchableOpacity style={styles.nextBtn} onPress={onNextLevel} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>NEXT</Text>
                <ArrowRight size={20} color="#0d0f17" />
              </TouchableOpacity>
            )}
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
    gap: 14,
  },
  titleBadge: {
    color: '#00F0FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 24,
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
    color: '#ffffff',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rewardIcon: {
    fontSize: 14,
  },
  rewardText: {
    color: '#FFB800',
    fontWeight: '800',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: '#0d0f17',
    fontWeight: '900',
    fontSize: 16,
  },
});
