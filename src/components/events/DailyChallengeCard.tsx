import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Flame, ChevronRight } from 'lucide-react';
import { DailyChallenge, StreakInfo } from '../../game/events/DailyChallengeTypes';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  streak: StreakInfo | null;
  onPlay: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  streak,
  onPlay,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPlay}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Calendar size={14} color="#FFE600" />
          <Text style={styles.badgeText}>DAILY NOVA PUZZLE</Text>
        </View>

        {streak && streak.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Flame size={12} color="#FF007F" />
            <Text style={styles.streakText}>{streak.currentStreak} DAY STREAK</Text>
          </View>
        )}
      </View>

      <Text style={styles.titleText}>
        {challenge ? challenge.title : "Today's Challenge"}
      </Text>
      <Text style={styles.descriptionText} numberOfLines={2}>
        {challenge
          ? challenge.description
          : 'Play today\'s puzzle and compete on global leaderboards!'}
      </Text>

      <View style={styles.actionRow}>
        <Text style={styles.difficultyText}>
          DIFFICULTY: {challenge ? challenge.difficulty : 'MEDIUM'}
        </Text>
        <View style={styles.playBtn}>
          <Text style={styles.playBtnText}>PLAY TODAY</Text>
          <ChevronRight size={14} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFE600',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 0, 127, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  streakText: {
    color: '#FF007F',
    fontSize: 10,
    fontWeight: '800',
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  descriptionText: {
    color: '#A0A0B0',
    fontSize: 12,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  difficultyText: {
    color: '#A0A0B0',
    fontSize: 10,
    fontWeight: '700',
  },
  playBtn: {
    backgroundColor: '#FFE600',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
});
