import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Award } from 'lucide-react-native';
import { AchievementCategory, AchievementConfig, PlayerAchievementState } from '../../game/economy/EconomyTypes';

interface AchievementsScreenProps {
  achievements: { config: AchievementConfig; state: PlayerAchievementState }[];
  onBack: () => void;
}

const CATEGORIES: { key: AchievementCategory | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'GAMEPLAY', label: 'Gameplay' },
  { key: 'SCORE', label: 'Score' },
  { key: 'LINES', label: 'Lines' },
  { key: 'COMBO', label: 'Combo' },
  { key: 'ADVENTURE', label: 'Adventure' },
  { key: 'DAILY', label: 'Daily' },
  { key: 'NOVA', label: 'Nova' },
  { key: 'PROGRESSION', label: 'Level' },
];

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

  const filtered = achievements.filter(
    item => selectedCategory === 'ALL' || item.config.category === selectedCategory
  );

  const completedCount = achievements.filter(item => item.state.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
        <Text style={styles.counterText}>
          {completedCount} / {achievements.length}
        </Text>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.filterPill, selectedCategory === cat.key && styles.filterPillActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.filterText, selectedCategory === cat.key && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Achievements List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filtered.map(({ config, state }) => {
          const isHidden = config.hidden && !state.completed;
          const progressPct = Math.min(100, Math.floor((state.progress / config.target) * 100));

          return (
            <View key={config.id} style={[styles.card, state.completed && styles.cardCompleted]}>
              <View style={[styles.iconContainer, state.completed && styles.iconCompleted]}>
                <Award color={state.completed ? '#00FF88' : '#00F0FF'} size={24} />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.titleText}>{isHidden ? '???' : config.title}</Text>
                <Text style={styles.descText}>
                  {isHidden ? 'Hidden achievement. Keep playing to discover!' : config.description}
                </Text>

                {!state.completed && (
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.progressText}>
                    {state.completed ? '✓ UNLOCKED' : `${state.progress} / ${config.target}`}
                  </Text>
                  <View style={styles.rewardBadges}>
                    {config.rewards.map((r, idx) => (
                      <Text key={idx} style={styles.rewardBadgeText}>
                        {r.type === 'COINS' ? `🪙 +${r.amount}` : `⚡ +${r.amount} XP`}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  counterText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: '#00F0FF',
  },
  filterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#00F0FF',
  },
  listContainer: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#161B2E',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardCompleted: {
    borderColor: 'rgba(0, 255, 136, 0.4)',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCompleted: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  cardInfo: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  descText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00F0FF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardBadgeText: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '800',
  },
});
