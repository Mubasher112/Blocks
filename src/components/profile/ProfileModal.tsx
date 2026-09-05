import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { X, Award, Star, LogOut } from 'lucide-react-native';
import { PlayerProfile, AuthService } from '../../services/backend/AuthService';

interface ProfileModalProps {
  player: PlayerProfile;
  onUpdatePlayer: (updated: PlayerProfile) => void;
  onClose: () => void;
}

const BUILTIN_AVATARS = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  onUpdatePlayer,
  onClose,
}) => {
  const [displayName, setDisplayName] = useState(player.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(player.avatarId);
  const [isLinking, setIsLinking] = useState(false);

  const handleSaveProfile = async () => {
    const updated = await AuthService.updateProfile(player, {
      displayName,
      avatarId: selectedAvatar,
    });
    onUpdatePlayer(updated);
  };

  const handleLinkProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLinking(true);
    try {
      const updated = await AuthService.linkGuestToProvider(player, provider);
      onUpdatePlayer(updated);
    } catch {
      // Ignore link cancel
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>PLAYER PROFILE</Text>

          {/* Avatar Selector */}
          <View style={styles.avatarRow}>
            {BUILTIN_AVATARS.map((avId) => (
              <TouchableOpacity
                key={avId}
                style={[
                  styles.avatarBox,
                  selectedAvatar === avId && styles.selectedAvatarBox,
                ]}
                onPress={() => setSelectedAvatar(avId)}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarIcon}>
                  {avId === 'avatar_1' ? '⚡' : avId === 'avatar_2' ? '🔥' : avId === 'avatar_3' ? '💎' : '🌟'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Display Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>DISPLAY NAME</Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              onEndEditing={handleSaveProfile}
              maxLength={20}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Player Progress Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Award size={18} color="#00F0FF" />
              <Text style={styles.statLabel}>LEVEL {player.level}</Text>
              <Text style={styles.statValue}>{player.xp} XP</Text>
            </View>

            <View style={styles.statBox}>
              <Star size={18} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statLabel}>STARS</Text>
              <Text style={styles.statValue}>{player.totalStars}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={styles.statLabel}>COINS</Text>
              <Text style={styles.statValue}>{player.coins}</Text>
            </View>
          </View>

          {/* Account Status / Linking */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionLabel}>ACCOUNT STATUS: {player.accountStatus}</Text>

            {player.accountStatus === 'GUEST' ? (
              <View style={styles.linkButtonsRow}>
                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: '#4285F4' }]}
                  onPress={() => handleLinkProvider('google')}
                  disabled={isLinking}
                  activeOpacity={0.8}
                >
                  <Text style={styles.linkBtnText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: '#1877F2' }]}
                  onPress={() => handleLinkProvider('facebook')}
                  disabled={isLinking}
                  activeOpacity={0.8}
                >
                  <Text style={styles.linkBtnText}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: '#000000', borderWidth: 1, borderColor: '#333' }]}
                  onPress={() => handleLinkProvider('apple')}
                  disabled={isLinking}
                  activeOpacity={0.8}
                >
                  <Text style={styles.linkBtnText}>Apple</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                  await AuthService.signOut();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <LogOut size={16} color="#FF007F" />
                <Text style={styles.logoutBtnText}>LOG OUT</Text>
              </TouchableOpacity>
            )}
          </View>
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
  modalTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarBox: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  avatarIcon: {
    fontSize: 22,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 4,
  },
  textInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  coinIcon: {
    fontSize: 16,
  },
  accountSection: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
  },
  linkButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  linkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    borderWidth: 1,
    borderColor: '#FF007F',
  },
  logoutBtnText: {
    color: '#FF007F',
    fontWeight: '900',
    fontSize: 12,
  },
});
