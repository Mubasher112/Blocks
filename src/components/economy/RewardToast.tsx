import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export interface RewardToastData {
  id: number;
  title: string;
  subtitle?: string;
  coins?: number;
  xp?: number;
}

interface RewardToastProps {
  toast: RewardToastData | null;
  onFinished: () => void;
}

export const RewardToast: React.FC<RewardToastProps> = ({ toast, onFinished }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2200),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinished();
      });
    }
  }, [toast, fadeAnim, onFinished]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.subtitle && <Text style={styles.subtitle}>{toast.subtitle}</Text>}
        <View style={styles.badges}>
          {toast.coins ? <Text style={styles.badgeText}>🪙 +{toast.coins}</Text> : null}
          {toast.xp ? <Text style={styles.badgeText}>⚡ +{toast.xp} XP</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#161B2E',
    borderWidth: 2,
    borderColor: '#00F0FF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  title: {
    color: '#00F0FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  badgeText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 13,
  },
});
