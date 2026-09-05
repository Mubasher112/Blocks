import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { X, Award, Star, UserMinus } from 'lucide-react-native';
import { PublicPlayerCard, SocialService } from '../../services/backend/SocialService';

interface PublicProfileModalProps {
  card: PublicPlayerCard;
  currentPlayerId: string;
  onClose: () => void;
  onFriendshipUpdated?: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  card,
  currentPlayerId,
  onClose,
  onFriendshipUpdated,
}) => {
  const handleRemoveFriend = async () => {
    await SocialService.removeFriend(currentPlayerId, card.id);
    if (onFriendshipUpdated) onFriendshipUpdated();
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.avatarBox}>
            <Text style={styles.avatarIcon}>
              {card.avatarId === 'avatar_1' ? '⚡' : card.avatarId === 'avatar_2' ? '🔥' : card.avatarId === 'avatar_3' ? '💎' : '🌟'}
            </Text>
          </View>

          <Text style={styles.displayName}>{card.displayName}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Award size={20} color="#00F0FF" />
              <Text style={styles.statLabel}>LEVEL</Text>
              <Text style={styles.statValue}>{card.level}</Text>
            </View>

            <View style={styles.statBox}>
              <Star size={20} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statLabel}>STARS</Text>
              <Text style={styles.statValue}>{card.totalStars}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CLASSIC BEST</Text>
              <Text style={styles.statValue}>{card.classicBestScore.toLocaleString()}</Text>
            </View>
          </View>

          {card.friendshipStatus === 'FRIENDS' && (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveFriend} activeOpacity={0.8}>
              <UserMinus size={16} color="#FF007F" />
              <Text style={styles.removeBtnText}>REMOVE FRIEND</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 15, 23, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 27, 46, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 32 },
  displayName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    borderWidth: 1,
    borderColor: '#FF007F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 6,
  },
  removeBtnText: {
    color: '#FF007F',
    fontWeight: '900',
    fontSize: 12,
  },
});
