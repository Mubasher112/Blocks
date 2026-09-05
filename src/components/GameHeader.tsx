import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2, VolumeX, Pause, RefreshCw } from 'lucide-react-native';

interface GameHeaderProps {
  score: number;
  highScore: number;
  comboCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  highScore,
  comboCount,
  soundEnabled,
  onToggleSound,
  onPause,
  onRestart,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.logoTitle}>
          BLOCK <Text style={styles.novaAccent}>NOVA</Text>
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onToggleSound} activeOpacity={0.7}>
            {soundEnabled ? <Volume2 size={20} color="#f3f4f6" /> : <VolumeX size={20} color="#f3f4f6" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onRestart} activeOpacity={0.7}>
            <RefreshCw size={20} color="#f3f4f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onPause} activeOpacity={0.7}>
            <Pause size={20} color="#f3f4f6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scorePanel}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>

        {comboCount > 1 && (
          <View style={styles.comboBadge}>
            <Text style={styles.comboFire}>🔥</Text>
            <Text style={styles.comboText}>{comboCount}x COMBO!</Text>
          </View>
        )}

        <View style={[styles.scoreBox, styles.alignRight]}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={[styles.scoreValue, styles.highlight]}>{highScore.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#ffffff',
  },
  novaAccent: {
    color: '#00F0FF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  scoreBox: {
    flexDirection: 'column',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  highlight: {
    color: '#FFB800',
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF007F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  comboFire: {
    fontSize: 12,
  },
  comboText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
