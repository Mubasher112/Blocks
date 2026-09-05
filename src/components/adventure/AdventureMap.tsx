import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Star, Lock, ArrowLeft } from 'lucide-react-native';
import { WorldData, AdventureLevel, AdventureProgress } from '../../game/adventure/AdventureTypes';

interface AdventureMapProps {
  world: WorldData;
  progress: AdventureProgress;
  onSelectLevel: (level: AdventureLevel) => void;
  onBack: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  world,
  progress,
  onSelectLevel,
  onBack,
}) => {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.worldTitle}>{world.name}</Text>
          <Text style={styles.worldSubtitle}>{world.description}</Text>
        </View>

        <View style={styles.starBadge}>
          <Star size={18} color="#FFB800" fill="#FFB800" />
          <Text style={styles.starBadgeText}>{progress.totalStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mapScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nodesGrid}>
          {world.levels.map((level) => {
            const isUnlocked =
              level.levelNumber <= progress.unlockedLevelNumber ||
              Boolean(progress.completedLevels[level.id]);
            const levelStats = progress.completedLevels[level.id];
            const stars = levelStats ? levelStats.stars : 0;

            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelNode,
                  isUnlocked ? styles.unlockedNode : styles.lockedNode,
                ]}
                onPress={() => isUnlocked && onSelectLevel(level)}
                activeOpacity={isUnlocked ? 0.7 : 1}
                disabled={!isUnlocked}
              >
                {isUnlocked ? (
                  <Text style={styles.levelNumberText}>{level.levelNumber}</Text>
                ) : (
                  <Lock size={20} color="#9ca3af" />
                )}

                {isUnlocked && (
                  <View style={styles.starsRow}>
                    <Star
                      size={12}
                      color="#FFB800"
                      fill={stars >= 1 ? '#FFB800' : 'transparent'}
                    />
                    <Star
                      size={12}
                      color="#FFB800"
                      fill={stars >= 2 ? '#FFB800' : 'transparent'}
                    />
                    <Star
                      size={12}
                      color="#FFB800"
                      fill={stars >= 3 ? '#FFB800' : 'transparent'}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#0d0f17',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  worldTitle: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  worldSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  starBadgeText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 14,
  },
  mapScroll: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  nodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  levelNode: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginVertical: 4,
  },
  unlockedNode: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  lockedNode: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelNumberText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
});
