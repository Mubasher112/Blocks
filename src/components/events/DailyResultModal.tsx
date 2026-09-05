import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Trophy, Flame, RefreshCw, Home } from 'lucide-react';
import { DailyChallenge, StreakInfo } from '../../game/events/DailyChallengeTypes';

interface DailyResultModalProps {
  visible: boolean;
  challenge: DailyChallenge;
  score: number;
  bestScore: number;
  completed: boolean;
  streak: StreakInfo | null;
  onRetry: () => void;
  onHome: () => void;
}

export const DailyResultModal: React.FC<DailyResultModalProps> = ({
  visible,
  challenge,
  score,
  bestScore,
  completed,
  streak,
  onRetry,
  onHome,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>
            {completed ? '🎉 DAILY CHALLENGE COMPLETED!' : 'CHALLENGE FINISHED'}
          </Text>

          <Text style={styles.challengeTitle}>{challenge.title}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreVal}>{score.toLocaleString()}</Text>

            <View style={styles.bestRow}>
              <Trophy size={14} color="#FFE600" />
              <Text style={styles.bestText}>PERSONAL BEST: {bestScore.toLocaleString()}</Text>
            </View>
          </View>

          {completed && streak && (
            <View style={styles.streakBox}>
              <Flame size={20} color="#FF007F" />
              <View>
                <Text style={styles.streakTitle}>{streak.currentStreak} DAY STREAK!</Text>
                <Text style={styles.streakSub}>Longest Streak: {streak.longestStreak} days</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <RefreshCw size={16} color="#FFF" />
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.8}>
              <Home size={16} color="#000" />
              <Text style={styles.homeText}>MAIN MENU</Text>
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFE600',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFE600',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  challengeTitle: {
    color: '#A0A0B0',
    fontSize: 12,
    marginBottom: 16,
  },
  scoreBox: {
    width: '100%',
    backgroundColor: '#0C0E14',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    color: '#A0A0B0',
    fontSize: 10,
    fontWeight: '800',
  },
  scoreVal: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 4,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  bestText: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '800',
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    borderWidth: 1,
    borderColor: '#FF007F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 16,
  },
  streakTitle: {
    color: '#FF007F',
    fontSize: 14,
    fontWeight: '900',
  },
  streakSub: {
    color: '#A0A0B0',
    fontSize: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  retryBtn: {
    flex: 1,
    backgroundColor: '#2A2E3D',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  homeBtn: {
    flex: 1,
    backgroundColor: '#FFE600',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  homeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
});
