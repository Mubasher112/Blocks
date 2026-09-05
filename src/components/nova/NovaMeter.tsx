import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Zap, Sparkles } from 'lucide-react';
import { NovaState } from '../../game/nova/NovaTypes';
import { NOVA_CONFIG } from '../../game/nova/NovaConfig';

interface NovaMeterProps {
  novaState: NovaState;
  onActivate: () => void;
}

export const NovaMeter: React.FC<NovaMeterProps> = ({ novaState, onActivate }) => {
  const { energy, status, remainingTurns } = novaState;
  const fillPercentage = Math.min(100, (energy / NOVA_CONFIG.MAX_ENERGY) * 100);
  const isReady = status === 'READY';
  const isActive = status === 'ACTIVE';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Zap size={16} color={isActive ? '#00F0FF' : isReady ? '#FFE600' : '#A0A0B0'} />
          <Text style={[styles.titleText, isActive && styles.activeTitleText]}>
            {isActive ? 'NOVA MODE ACTIVE' : isReady ? 'NOVA MODE READY!' : 'NOVA ENERGY'}
          </Text>
        </View>

        {isActive ? (
          <View style={styles.turnsBadge}>
            <Text style={styles.turnsBadgeText}>{remainingTurns} MOVES LEFT (2x SCORE)</Text>
          </View>
        ) : (
          <Text style={styles.percentageText}>{Math.floor(fillPercentage)}%</Text>
        )}
      </View>

      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            { width: `${fillPercentage}%` },
            isReady && styles.meterFillReady,
            isActive && styles.meterFillActive,
          ]}
        />
      </View>

      {isReady && !isActive && (
        <TouchableOpacity
          style={styles.activateButton}
          onPress={onActivate}
          activeOpacity={0.8}
        >
          <Sparkles size={18} color="#000" />
          <Text style={styles.activateButtonText}>ACTIVATE NOVA MODE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A2E3D',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    color: '#A0A0B0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeTitleText: {
    color: '#00F0FF',
  },
  percentageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  turnsBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  turnsBadgeText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
  },
  meterTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#0C0E14',
    borderRadius: 5,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#7B2CBF',
    borderRadius: 5,
  },
  meterFillReady: {
    backgroundColor: '#FFE600',
  },
  meterFillActive: {
    backgroundColor: '#00F0FF',
  },
  activateButton: {
    marginTop: 8,
    backgroundColor: '#FFE600',
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  activateButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
