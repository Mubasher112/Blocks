import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, UserPlus, Check, X, Search, Users } from 'lucide-react-native';
import { PlayerProfile } from '../../services/backend/AuthService';
import { SocialService, PublicPlayerCard, FriendRequest } from '../../services/backend/SocialService';

interface SocialScreenProps {
  player: PlayerProfile;
  onSelectPlayer?: (playerId: string) => void;
  onBack: () => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
  player,
  onSelectPlayer,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicPlayerCard[]>([]);
  const [friendsList, setFriendsList] = useState<PublicPlayerCard[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'REQUESTS' | 'SEARCH'>('FRIENDS');

  const fetchData = async () => {
    const friends = await SocialService.getFriendsList(player.id);
    const requests = await SocialService.getPendingRequests(player.id);
    setFriendsList(friends);
    setPendingRequests(requests);
  };

  useEffect(() => {
    fetchData();
  }, [player.id]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await SocialService.searchPlayers(searchQuery, player.id);
    setSearchResults(results);
  };

  const handleSendRequest = async (receiverId: string) => {
    await SocialService.sendFriendRequest(player, receiverId);
    setSearchResults((prev) =>
      prev.map((p) => (p.id === receiverId ? { ...p, friendshipStatus: 'PENDING_SENT' } : p))
    );
  };

  const handleAcceptRequest = async (req: FriendRequest) => {
    await SocialService.acceptFriendRequest(req.id, req.senderId, player.id);
    await fetchData();
  };

  const handleRejectRequest = async (req: FriendRequest) => {
    await SocialService.rejectFriendRequest(req.id);
    await fetchData();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FRIENDS & SOCIAL</Text>
        <View style={styles.placeholderBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FRIENDS' && styles.activeTab]}
          onPress={() => setActiveTab('FRIENDS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'FRIENDS' && styles.activeTabText]}>
            Friends ({friendsList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'REQUESTS' && styles.activeTab]}
          onPress={() => setActiveTab('REQUESTS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'REQUESTS' && styles.activeTabText]}>
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'SEARCH' && styles.activeTab]}
          onPress={() => setActiveTab('SEARCH')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'SEARCH' && styles.activeTabText]}>
            Find Players
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Friends List Tab */}
        {activeTab === 'FRIENDS' && (
          <View style={styles.tabContent}>
            {friendsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Users size={36} color="#9ca3af" />
                <Text style={styles.emptyTitle}>NO FRIENDS YET</Text>
                <Text style={styles.emptyDesc}>Search and add players to compete together!</Text>
              </View>
            ) : (
              friendsList.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.playerCard}
                  onPress={() => onSelectPlayer && onSelectPlayer(friend.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.playerLeft}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {friend.avatarId === 'avatar_1' ? '⚡' : friend.avatarId === 'avatar_2' ? '🔥' : friend.avatarId === 'avatar_3' ? '💎' : '🌟'}
                      </Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{friend.displayName}</Text>
                      <Text style={styles.playerStats}>
                        Lvl {friend.level} • {friend.totalStars} ⭐ • Best {friend.classicBestScore.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'REQUESTS' && (
          <View style={styles.tabContent}>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Users size={36} color="#9ca3af" />
                <Text style={styles.emptyTitle}>NO PENDING REQUESTS</Text>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View key={req.id} style={styles.playerCard}>
                  <View style={styles.playerLeft}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>⚡</Text>
                    </View>
                    <Text style={styles.playerName}>{req.senderName}</Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.actionIconBtn, styles.acceptBtn]}
                      onPress={() => handleAcceptRequest(req)}
                      activeOpacity={0.8}
                    >
                      <Check size={18} color="#0d0f17" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionIconBtn, styles.rejectBtn]}
                      onPress={() => handleRejectRequest(req)}
                      activeOpacity={0.8}
                    >
                      <X size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Search Tab */}
        {activeTab === 'SEARCH' && (
          <View style={styles.tabContent}>
            <View style={styles.searchBarRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search display name..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
                <Search size={18} color="#0d0f17" />
              </TouchableOpacity>
            </View>

            {searchResults.map((p) => (
              <View key={p.id} style={styles.playerCard}>
                <View style={styles.playerLeft}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>⚡</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.displayName}</Text>
                    <Text style={styles.playerStats}>Lvl {p.level} • {p.totalStars} ⭐</Text>
                  </View>
                </View>

                {p.friendshipStatus === 'NONE' ? (
                  <TouchableOpacity
                    style={styles.addFriendBtn}
                    onPress={() => handleSendRequest(p.id)}
                    activeOpacity={0.8}
                  >
                    <UserPlus size={16} color="#0d0f17" />
                    <Text style={styles.addFriendBtnText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.pendingText}>Sent</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBtn: { width: 38 },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: '800',
    fontSize: 12,
  },
  activeTabText: {
    color: '#0d0f17',
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabContent: {
    gap: 10,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  emptyDesc: {
    color: '#9ca3af',
    fontSize: 12,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 46, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20 },
  playerInfo: { gap: 2 },
  playerName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  playerStats: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: { backgroundColor: '#00F0FF' },
  rejectBtn: { backgroundColor: 'rgba(255, 0, 127, 0.2)', borderWidth: 1, borderColor: '#FF007F' },
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00F0FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addFriendBtnText: {
    color: '#0d0f17',
    fontWeight: '900',
    fontSize: 12,
  },
  pendingText: {
    color: '#FFB800',
    fontWeight: '800',
    fontSize: 12,
  },
});
