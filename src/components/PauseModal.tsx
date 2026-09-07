import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Play, RotateCcw, Home, Volume2, VolumeX, Zap } from 'lucide-react-native';

interface PauseModalProps {
  visible: boolean;
  modeTitle: string;
  currentScore: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  modeTitle,
  currentScore,
  soundEnabled,
  hapticsEnabled,
  onResume,
  onRestart,
  onQuit,
  onToggleSound,
  onToggleHaptics,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>GAME PAUSED</Text>
          <Text style={styles.modeSubtitle}>{modeTitle.toUpperCase()}</Text>

          {/* Current Score Pill */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
            <Text style={styles.scoreValue}>{currentScore.toLocaleString()}</Text>
          </View>

          {/* Audio & Haptic Toggles */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, soundEnabled && styles.toggleBtnActive]}
              onPress={onToggleSound}
              activeOpacity={0.7}
            >
              {soundEnabled ? (
                <Volume2 size={18} color="#00F0FF" />
              ) : (
                <VolumeX size={18} color="#707080" />
              )}
              <Text style={[styles.toggleText, soundEnabled && styles.toggleTextActive]}>
                Sound {soundEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, hapticsEnabled && styles.toggleBtnActive]}
              onPress={onToggleHaptics}
              activeOpacity={0.7}
            >
              <Zap size={18} color={hapticsEnabled ? '#00F0FF' : '#707080'} />
              <Text style={[styles.toggleText, hapticsEnabled && styles.toggleTextActive]}>
                Haptics {hapticsEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Menu Buttons */}
          <View style={styles.btnStack}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.resumeBtn]}
              onPress={onResume}
              activeOpacity={0.8}
            >
              <Play size={18} color="#0D0F17" />
              <Text style={styles.resumeBtnText}>RESUME GAME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.restartBtn]}
              onPress={onRestart}
              activeOpacity={0.8}
            >
              <RotateCcw size={18} color="#FFF" />
              <Text style={styles.restartBtnText}>RESTART</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.quitBtn]}
              onPress={onQuit}
              activeOpacity={0.8}
            >
              <Home size={18} color="#FF4D4D" />
              <Text style={styles.quitBtnText}>QUIT TO MENU</Text>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#161922',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  title: {
    color: '#00F0FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modeSubtitle: {
    color: '#8A92A6',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  scoreContainer: {
    width: '100%',
    backgroundColor: '#0D0F17',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#232938',
  },
  scoreLabel: {
    color: '#8A92A6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E2332',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2D3448',
  },
  toggleBtnActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#132838',
  },
  toggleText: {
    color: '#707080',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#00F0FF',
  },
  btnStack: {
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  resumeBtn: {
    backgroundColor: '#00F0FF',
  },
  resumeBtnText: {
    color: '#0D0F17',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  restartBtn: {
    backgroundColor: '#252B3B',
    borderWidth: 1,
    borderColor: '#3D465E',
  },
  restartBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  quitBtn: {
    backgroundColor: '#241920',
    borderWidth: 1,
    borderColor: '#52202E',
  },
  quitBtnText: {
    color: '#FF4D4D',
    fontSize: 13,
    fontWeight: '800',
  },
});
