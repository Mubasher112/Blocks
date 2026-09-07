import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Zap, Sparkles, RefreshCw, RotateCcw, Sun } from 'lucide-react-native';
import { NovaPowerId, NovaState } from '../../game/nova/NovaTypes';
import { NOVA_POWERS } from '../../game/nova/NovaPowers';

interface NovaPowerPanelProps {
  novaState: NovaState;
  onSelectPower: (powerId: NovaPowerId) => void;
  canUndo: boolean;
}

export const NovaPowerPanel: React.FC<NovaPowerPanelProps> = ({
  novaState,
  onSelectPower,
  canUndo,
}) => {
  const { status, consumedPowers, isPrismArmed } = novaState;
  const isActive = status === 'ACTIVE';

  if (!isActive) return null;

  const renderIcon = (powerId: NovaPowerId) => {
    switch (powerId) {
      case 'pulse':
        return <Zap size={16} color="#FFE600" />;
      case 'wild':
        return <Sparkles size={16} color="#FF007A" />;
      case 'shuffle':
        return <RefreshCw size={16} color="#00F0FF" />;
      case 'undo':
        return <RotateCcw size={16} color="#39FF14" />;
      case 'prism':
        return <Sun size={16} color={isPrismArmed ? '#FFE600' : '#A0A0B0'} />;
    }
  };

  const powerList: NovaPowerId[] = ['pulse', 'wild', 'shuffle', 'undo', 'prism'];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>NOVA POWERS</Text>
      <View style={styles.powerRow}>
        {powerList.map(powerId => {
          const power = NOVA_POWERS[powerId];
          const isConsumed = consumedPowers.includes(powerId);
          const isDisabled =
            isConsumed || (powerId === 'undo' && !canUndo);

          return (
            <TouchableOpacity
              key={powerId}
              style={[
                styles.powerCard,
                isDisabled && styles.powerCardDisabled,
                powerId === 'prism' && isPrismArmed && styles.prismArmedCard,
              ]}
              disabled={isDisabled}
              onPress={() => onSelectPower(powerId)}
              activeOpacity={0.7}
            >
              {renderIcon(powerId)}
              <Text style={[styles.powerName, isDisabled && styles.powerNameDisabled]}>
                {power.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#11131B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#00F0FF',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  powerCard: {
    flex: 1,
    backgroundColor: '#1E2230',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2E3D',
  },
  powerCardDisabled: {
    opacity: 0.35,
    backgroundColor: '#12141D',
  },
  prismArmedCard: {
    borderColor: '#FFE600',
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
  },
  powerName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  powerNameDisabled: {
    color: '#666',
  },
});
