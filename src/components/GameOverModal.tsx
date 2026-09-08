import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { RotateCcw, Home, Trophy, Award } from 'lucide-react-native';
import { GameStats } from '../game/GameEngine';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  stats: GameStats;
  canContinue?: boolean;
  onRewardedContinue?: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  stats,
  canContinue,
  onRewardedContinue,
  onPlayAgain,
  onHome,
}) => {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {isNewHighScore ? (
            <View style={styles.newBestBadge}>
              <Award size={18} color="#0d0f17" />
              <Text style={styles.newBestText}>NEW BEST SCORE!</Text>
            </View>
          ) : (
            <Text style={styles.modalSubtitle}>NO MORE MOVES</Text>
          )}

          <Text style={styles.modalTitle}>GAME OVER</Text>

          <View style={styles.finalScoreBox}>
            <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
            <Text style={styles.finalScoreValue}>{score.toLocaleString()}</Text>
          </View>

          <View style={styles.statsSummaryGrid}>
            <View style={styles.summaryItem}>
              <Trophy size={16} color="#FFB800" />
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryLabel}>BEST</Text>
                <Text style={styles.summaryValue}>{highScore.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryLabel}>BLOCKS PLACED</Text>
                <Text style={styles.summaryValue}>{stats.totalBlocksPlaced}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryLabel}>LINES CLEARED</Text>
                <Text style={styles.summaryValue}>{stats.totalLinesCleared}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryLabel}>LONGEST COMBO</Text>
                <Text style={styles.summaryValue}>{stats.longestCombo}x</Text>
              </View>
            </View>
          </View>

          {canContinue && onRewardedContinue && (
            <TouchableOpacity style={styles.continueBtn} onPress={onRewardedContinue} activeOpacity={0.8}>
              <Text style={styles.continueBtnText}>📺 WATCH AD TO CONTINUE (CLEAR 1 LINE)</Text>
            </TouchableOpacity>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.secondaryBtn]} onPress={onHome} activeOpacity={0.7}>
              <Home size={18} color="#ffffff" />
              <Text style={styles.secondaryBtnText}>HOME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, styles.primaryBtn]} onPress={onPlayAgain} activeOpacity={0.8}>
              <RotateCcw size={18} color="#0d0f17" />
              <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
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
    gap: 14,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFB800',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  newBestText: {
    color: '#0d0f17',
    fontWeight: '900',
    fontSize: 12,
  },
  modalSubtitle: {
    color: '#FF007F',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#ffffff',
  },
  finalScoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
  },
  finalScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  finalScoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00F0FF',
  },
  statsSummaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDetails: {
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalBtn: {
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
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#0A0C14',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
