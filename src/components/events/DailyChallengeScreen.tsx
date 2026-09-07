import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, Calendar, Flame, Play, Trophy } from 'lucide-react-native';
import { DailyChallenge, StreakInfo } from '../../game/events/DailyChallengeTypes';

interface DailyChallengeScreenProps {
  challenge: DailyChallenge | null;
  streak: StreakInfo | null;
  bestScore: number;
  onStart: () => void;
  onBack: () => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  challenge,
  streak,
  bestScore,
  onStart,
  onBack,
}) => {
  if (!challenge) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DAILY CHALLENGE</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Challenge Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.dateBadge}>
              <Calendar size={12} color="#FFE600" />
              <Text style={styles.dateText}>{challenge.challengeDate}</Text>
            </View>

            {streak && streak.currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color="#FF007F" />
                <Text style={styles.streakText}>{streak.currentStreak} DAY STREAK</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>DIFFICULTY</Text>
              <Text style={styles.infoValue}>{challenge.difficulty}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>MOVE LIMIT</Text>
              <Text style={styles.infoValue}>
                {challenge.moveLimit ? `${challenge.moveLimit} Moves` : 'Unlimited'}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>PERSONAL BEST</Text>
              <Text style={[styles.infoValue, { color: '#FFE600' }]}>
                {bestScore.toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Play size={20} color="#000" fill="#000" />
            <Text style={styles.startText}>PLAY DAILY PUZZLE</Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Leaderboard Section */}
        <View style={styles.leaderboardSection}>
          <View style={styles.lbHeader}>
            <Trophy size={16} color="#FFE600" />
            <Text style={styles.lbTitle}>TODAY'S TOP RANKINGS</Text>
          </View>

          <View style={styles.emptyLb}>
            <Text style={styles.emptyLbText}>
              Play today's puzzle to rank on the Daily Leaderboards!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D2A',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161922',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  bannerCard: {
    backgroundColor: '#161922',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFE600',
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 0, 127, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  streakText: {
    color: '#FF007F',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  description: {
    color: '#A0A0B0',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#0C0E14',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  startButton: {
    backgroundColor: '#FFE600',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  leaderboardSection: {
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2E3D',
  },
  lbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  lbTitle: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyLb: {
    padding: 20,
    alignItems: 'center',
  },
  emptyLbText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
