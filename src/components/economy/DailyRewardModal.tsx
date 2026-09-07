import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { DAILY_REWARD_CALENDAR } from '../../game/economy/EconomyConfig';

interface DailyRewardModalProps {
  visible: boolean;
  todayDay: number;
  canClaim: boolean;
  onClaim: () => Promise<void>;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  visible,
  todayDay,
  canClaim,
  onClaim,
  onClose,
}) => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const handlePressClaim = async () => {
    if (!canClaim || isClaiming) return;
    setIsClaiming(true);
    await onClaim();
    setIsClaiming(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.headerTitle}>DAILY REWARD</Text>
          <Text style={styles.subtitle}>Log in every day to claim bonus Coins & XP!</Text>

          <ScrollView contentContainerStyle={styles.calendarGrid}>
            {DAILY_REWARD_CALENDAR.map((dayConfig) => {
              const isToday = dayConfig.day === todayDay;
              const isPast = dayConfig.day < todayDay || (isToday && !canClaim);

              return (
                <View
                  key={dayConfig.day}
                  style={[
                    styles.dayCard,
                    isToday && canClaim && styles.todayCard,
                    isPast && styles.pastCard,
                  ]}
                >
                  <Text style={[styles.dayLabel, isToday && canClaim && styles.todayText]}>
                    DAY {dayConfig.day}
                  </Text>
                  <Text style={styles.coinText}>🪙 +{dayConfig.coins}</Text>
                  <Text style={styles.xpText}>⚡ +{dayConfig.xp} XP</Text>
                  {isPast && <Text style={styles.claimedBadge}>✓ CLAIMED</Text>}
                </View>
              );
            })}
          </ScrollView>

          {canClaim ? (
            <TouchableOpacity
              style={[styles.claimButton, isClaiming && styles.disabledButton]}
              disabled={isClaiming}
              onPress={handlePressClaim}
            >
              <Text style={styles.claimButtonText}>
                {isClaiming ? 'CLAIMING...' : `CLAIM DAY ${todayDay} REWARD`}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>COME BACK TOMORROW</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#161B2E',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00F0FF',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#00F0FF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  dayCard: {
    width: '30%',
    backgroundColor: '#0F1322',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  todayCard: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
    borderWidth: 2,
  },
  pastCard: {
    opacity: 0.5,
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  todayText: {
    color: '#00F0FF',
  },
  coinText: {
    color: '#FFB800',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 6,
  },
  xpText: {
    color: '#FF007F',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 2,
  },
  claimedBadge: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#0A0C14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
