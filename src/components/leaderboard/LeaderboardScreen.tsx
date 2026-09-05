import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, Trophy, RefreshCw } from 'lucide-react-native';
import { LeaderboardCategory, ScoreService } from '../../services/backend/ScoreService';
import { LeaderboardService, LeaderboardRankEntry } from '../../services/backend/LeaderboardService';

interface LeaderboardScreenProps {
  currentPlayerId: string | null;
  onSelectPlayer?: (playerId: string) => void;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  currentPlayerId,
  onSelectPlayer,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('CLASSIC_ALL_TIME');
  const [activeFilter, setActiveFilter] = useState<'GLOBAL' | 'FRIENDS'>('GLOBAL');
  const [entries, setEntries] = useState<LeaderboardRankEntry[]>([]);
  const [ownRank, setOwnRank] = useState<LeaderboardRankEntry | null>(null);

  const fetchRankings = async () => {
    let periodKey = 'ALL_TIME';
    if (activeCategory === 'CLASSIC_WEEKLY') {
      periodKey = ScoreService.getWeeklyPeriodKey();
    } else if (activeCategory === 'DAILY_CHALLENGE') {
      periodKey = ScoreService.getDailyPeriodKey();
    }

    const data = await LeaderboardService.getLeaderboard(
      activeCategory,
      periodKey,
      activeFilter,
      currentPlayerId,
      50
    );

    setEntries(data);

    if (currentPlayerId) {
      const own = data.find((e) => e.playerId === currentPlayerId) || null;
      setOwnRank(own);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [activeCategory, activeFilter, currentPlayerId]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEADERBOARDS</Text>
        <TouchableOpacity style={styles.backBtn} onPress={fetchRankings} activeOpacity={0.7}>
          <RefreshCw size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeCategory === 'CLASSIC_ALL_TIME' && styles.activeTab]}
          onPress={() => setActiveCategory('CLASSIC_ALL_TIME')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'CLASSIC_ALL_TIME' && styles.activeTabText]}>
            Classic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeCategory === 'CLASSIC_WEEKLY' && styles.activeTab]}
          onPress={() => setActiveCategory('CLASSIC_WEEKLY')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'CLASSIC_WEEKLY' && styles.activeTabText]}>
            Weekly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeCategory === 'ADVENTURE_GLOBAL' && styles.activeTab]}
          onPress={() => setActiveCategory('ADVENTURE_GLOBAL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'ADVENTURE_GLOBAL' && styles.activeTabText]}>
            Adventure
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Selector (Global vs Friends) */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'GLOBAL' && styles.activeFilterChip]}
          onPress={() => setActiveFilter('GLOBAL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, activeFilter === 'GLOBAL' && styles.activeFilterText]}>
            Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'FRIENDS' && styles.activeFilterChip]}
          onPress={() => setActiveFilter('FRIENDS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, activeFilter === 'FRIENDS' && styles.activeFilterText]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Own Rank Highlight Banner */}
      {ownRank && (
        <View style={styles.ownRankCard}>
          <View style={styles.ownRankLeft}>
            <Text style={styles.ownRankBadge}>#{ownRank.rank}</Text>
            <Text style={styles.ownRankName}>You ({ownRank.displayName})</Text>
          </View>
          <Text style={styles.ownRankScore}>{ownRank.score.toLocaleString()} pts</Text>
        </View>
      )}

      {/* Rankings List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Trophy size={36} color="#9ca3af" />
            <Text style={styles.emptyTitle}>NO RANKINGS YET</Text>
            <Text style={styles.emptyDesc}>Play a game to submit your high score!</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.playerId}
              style={[styles.rankRow, entry.isCurrentPlayer && styles.highlightRankRow]}
              onPress={() => onSelectPlayer && onSelectPlayer(entry.playerId)}
              activeOpacity={0.7}
            >
              <View style={styles.rankLeft}>
                <Text
                  style={[
                    styles.rankNum,
                    entry.rank === 1 ? styles.goldRank : entry.rank === 2 ? styles.silverRank : entry.rank === 3 ? styles.bronzeRank : null,
                  ]}
                >
                  #{entry.rank}
                </Text>

                <View style={styles.avatarPill}>
                  <Text style={styles.avatarIcon}>
                    {entry.avatarId === 'avatar_1' ? '⚡' : entry.avatarId === 'avatar_2' ? '🔥' : entry.avatarId === 'avatar_3' ? '💎' : '🌟'}
                  </Text>
                </View>

                <Text style={styles.playerName}>{entry.displayName}</Text>
              </View>

              <Text style={styles.playerScore}>
                {activeCategory === 'ADVENTURE_GLOBAL' ? `${entry.score} ⭐` : `${entry.score.toLocaleString()} pts`}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: '800',
    fontSize: 12,
  },
  activeTabText: {
    color: '#0d0f17',
    fontWeight: '900',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(255, 0, 127, 0.2)',
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  filterText: {
    color: '#9ca3af',
    fontWeight: '800',
    fontSize: 12,
  },
  activeFilterText: {
    color: '#FF007F',
  },
  ownRankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00F0FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ownRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ownRankBadge: {
    color: '#00F0FF',
    fontWeight: '900',
    fontSize: 16,
  },
  ownRankName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  ownRankScore: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  emptyDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  highlightRankRow: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    fontWeight: '900',
    fontSize: 14,
    color: '#9ca3af',
    width: 28,
  },
  goldRank: { color: '#FFB800' },
  silverRank: { color: '#E0E0E0' },
  bronzeRank: { color: '#CD7F32' },
  avatarPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 16 },
  playerName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  playerScore: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 14,
  },
});
