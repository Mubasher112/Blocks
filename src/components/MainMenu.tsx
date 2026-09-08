import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Trophy, Flame, Grid, Map, User, Users, Lock, Award, Gift, ShoppingBag } from 'lucide-react-native';
import { GameStats } from '../game/GameEngine';
import { PlayerProfile } from '../services/backend/AuthService';
import { DailyChallenge, StreakInfo } from '../game/events/DailyChallengeTypes';
import { DailyChallengeCard } from './events/DailyChallengeCard';
import { PlayerEconomy } from '../game/economy/EconomyTypes';
import { XPService } from '../services/backend/XPService';

interface MainMenuProps {
  stats: GameStats;
  player: PlayerProfile | null;
  economy: PlayerEconomy;
  dailyChallenge: DailyChallenge | null;
  dailyStreak: StreakInfo | null;
  canClaimDailyReward: boolean;
  onPlayClassic: () => void;
  onPlayAdventure: () => void;
  onPlayDaily: () => void;
  onOpenDailyReward: () => void;
  onOpenAchievements: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboards: () => void;
  onOpenSocial: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  economy,
  dailyChallenge,
  dailyStreak,
  canClaimDailyReward,
  onPlayClassic,
  onPlayAdventure,
  onPlayDaily,
  onOpenDailyReward,
  onOpenAchievements,
  onOpenProfile,
  onOpenLeaderboards,
  onOpenSocial,
}) => {
  const xpDetails = XPService.getProgressDetails(economy);

  return (
    <View style={styles.menuContainer}>
      {/* Top Bar with Profile, Coins, Level, Leaderboards & Social */}
      <View style={styles.topBar}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>🪙 {economy.coins.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.iconChip} onPress={onOpenShop} activeOpacity={0.8}>
          <ShoppingBag size={18} color="#FFB800" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconChip} onPress={onOpenDailyReward} activeOpacity={0.8}>
          <Gift size={18} color="#00FF88" />
          {canClaimDailyReward && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconChip} onPress={onOpenAchievements} activeOpacity={0.8}>
          <Award size={18} color="#00F0FF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconChip} onPress={onOpenSocial} activeOpacity={0.8}>
          <Users size={18} color="#FF007F" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconChip} onPress={onOpenLeaderboards} activeOpacity={0.8}>
          <Trophy size={18} color="#FFB800" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileChip} onPress={onOpenProfile} activeOpacity={0.8}>
          <User size={16} color="#00F0FF" />
          <Text style={styles.profileNameText}>Lvl {economy.level}</Text>
        </TouchableOpacity>
      </View>

      {/* Level XP Progress Banner */}
      <View style={styles.levelBanner}>
        <View style={styles.levelBannerHeader}>
          <Text style={styles.levelText}>LEVEL {economy.level}</Text>
          <Text style={styles.xpText}>{xpDetails.currentXP} / {xpDetails.requiredXP} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpDetails.progressPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>
          BLOCK <Text style={styles.novaAccent}>NOVA</Text>
        </Text>
        <Text style={styles.menuSubtitle}>Strategic Block Puzzle Experience</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Trophy size={22} color="#FFB800" />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>HIGH SCORE</Text>
            <Text style={styles.statValue}>{stats.highScore.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Flame size={22} color="#FF007F" />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>LONGEST COMBO</Text>
            <Text style={styles.statValue}>{stats.longestCombo}x</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Grid size={22} color="#00F0FF" />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>LINES CLEARED</Text>
            <Text style={styles.statValue}>{stats.totalLinesCleared.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playButtonsRow}>
        <TouchableOpacity style={styles.playBtnClassic} onPress={onPlayClassic} activeOpacity={0.8}>
          <Play size={22} color="#0d0f17" fill="#0d0f17" />
          <Text style={styles.playBtnClassicText}>CLASSIC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtnAdventure} onPress={onPlayAdventure} activeOpacity={0.8}>
          <Map size={22} color="#ffffff" />
          <Text style={styles.playBtnAdventureText}>ADVENTURE</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Challenge Interactive Card */}
      <DailyChallengeCard
        challenge={dailyChallenge}
        streak={dailyStreak}
        onPlay={onPlayDaily}
      />

      <View style={styles.modesSection}>
        <Text style={styles.sectionTitle}>UPCOMING MODES</Text>
        <View style={styles.modesGrid}>
          <View style={styles.modeCardDisabled}>
            <View style={styles.modeHeader}>
              <Text style={styles.modeName}>Rush Mode</Text>
              <Lock size={14} color="#9ca3af" />
            </View>
            <Text style={styles.modeDesc}>Timed high-intensity survival</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  coinBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFB800',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  coinBadgeText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 12,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF007F',
  },
  levelBanner: {
    width: '100%',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 10,
    marginTop: -8,
  },
  levelBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelText: {
    color: '#00F0FF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  xpText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '800',
    fontSize: 10,
  },
  xpTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  profileNameText: {
    color: '#f3f4f6',
    fontWeight: '800',
    fontSize: 12,
  },
  menuHeader: {
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#ffffff',
  },
  novaAccent: {
    color: '#00F0FF',
  },
  menuSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statInfo: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  playBtnClassic: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#00F0FF',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playBtnClassicText: {
    color: '#0d0f17',
    fontSize: 16,
    fontWeight: '900',
  },
  playBtnAdventure: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 0, 127, 0.85)',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  playBtnAdventureText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  modesSection: {
    width: '100%',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1,
    textAlign: 'left',
  },
  modesGrid: {
    gap: 8,
  },
  modeCardDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    opacity: 0.6,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  modeName: {
    color: '#f3f4f6',
    fontWeight: '700',
    fontSize: 13,
  },
  modeDesc: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
