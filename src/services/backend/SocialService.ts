import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PlayerProfile } from './AuthService';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface PublicPlayerCard {
  id: string;
  displayName: string;
  avatarId: string;
  level: number;
  totalStars: number;
  classicBestScore: number;
  friendshipStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
}

export class SocialService {
  private static mockRequests: FriendRequest[] = [];
  private static mockFriendships = new Set<string>();

  /**
   * Searches players by display name
   */
  public static async searchPlayers(
    queryName: string,
    currentPlayerId: string
  ): Promise<PublicPlayerCard[]> {
    if (!queryName.trim()) return [];

    if (!isSupabaseConfigured) {
      const mockResult: PublicPlayerCard[] = [
        {
          id: 'p_search_1',
          displayName: `${queryName.trim()}Pro`,
          avatarId: 'avatar_2',
          level: 12,
          totalStars: 86,
          classicBestScore: 18420,
          friendshipStatus: 'NONE',
        },
      ];
      return mockResult;
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('display_name', `%${queryName.trim()}%`)
        .neq('id', currentPlayerId)
        .limit(20);

      if (error || !data) return [];

      return data.map((p) => ({
        id: p.id,
        displayName: p.display_name,
        avatarId: p.avatar_id,
        level: p.level || 1,
        totalStars: p.total_stars || 0,
        classicBestScore: p.classic_best_score || 0,
        friendshipStatus: 'NONE',
      }));
    } catch {
      return [];
    }
  }

  /**
   * Sends a friend request to another player
   */
  public static async sendFriendRequest(
    sender: PlayerProfile,
    receiverId: string
  ): Promise<boolean> {
    if (sender.id === receiverId) {
      console.warn('Cannot send friend request to self');
      return false;
    }

    if (!isSupabaseConfigured) {
      const existing = this.mockRequests.find(
        (r) => r.senderId === sender.id && r.receiverId === receiverId
      );
      if (!existing) {
        this.mockRequests.push({
          id: `req_${Date.now()}`,
          senderId: sender.id,
          senderName: sender.displayName,
          senderAvatar: sender.avatarId,
          receiverId,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    }

    try {
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: sender.id,
        receiver_id: receiverId,
        status: 'PENDING',
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetches pending incoming friend requests
   */
  public static async getPendingRequests(receiverId: string): Promise<FriendRequest[]> {
    if (!isSupabaseConfigured) {
      return this.mockRequests.filter(
        (r) => r.receiverId === receiverId && r.status === 'PENDING'
      );
    }

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*, sender:players!sender_id(*)')
        .eq('receiver_id', receiverId)
        .eq('status', 'PENDING');

      if (error || !data) return [];

      return data.map((req) => ({
        id: req.id,
        senderId: req.sender_id,
        senderName: req.sender?.display_name || 'Nova Player',
        senderAvatar: req.sender?.avatar_id || 'avatar_1',
        receiverId: req.receiver_id,
        status: req.status,
        createdAt: req.created_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Accepts an incoming friend request and creates reciprocal friendship
   */
  public static async acceptFriendRequest(
    requestId: string,
    player1Id: string,
    player2Id: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const req = this.mockRequests.find((r) => r.id === requestId);
      if (req) req.status = 'ACCEPTED';
      this.mockFriendships.add(`${player1Id}_${player2Id}`);
      this.mockFriendships.add(`${player2Id}_${player1Id}`);
      return true;
    }

    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', requestId);

      await supabase.from('friendships').insert([
        { player_id_1: player1Id, player_id_2: player2Id },
      ]);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rejects an incoming friend request
   */
  public static async rejectFriendRequest(requestId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const req = this.mockRequests.find((r) => r.id === requestId);
      if (req) req.status = 'REJECTED';
      return true;
    }

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'REJECTED' })
        .eq('id', requestId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetches accepted friends list for a player
   */
  public static async getFriendsList(playerId: string): Promise<PublicPlayerCard[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'p_friend_1',
          displayName: 'SarahNova',
          avatarId: 'avatar_2',
          level: 24,
          totalStars: 312,
          classicBestScore: 21420,
          friendshipStatus: 'FRIENDS',
        },
        {
          id: 'p_friend_2',
          displayName: 'AhmedBlock',
          avatarId: 'avatar_3',
          level: 19,
          totalStars: 248,
          classicBestScore: 18410,
          friendshipStatus: 'FRIENDS',
        },
      ];
    }

    try {
      const { data: f1 } = await supabase
        .from('friendships')
        .select('p2:players!player_id_2(*)')
        .eq('player_id_1', playerId);

      const { data: f2 } = await supabase
        .from('friendships')
        .select('p1:players!player_id_1(*)')
        .eq('player_id_2', playerId);

      const list: PublicPlayerCard[] = [];

      f1?.forEach((item: any) => {
        if (item.p2) {
          list.push({
            id: item.p2.id,
            displayName: item.p2.display_name,
            avatarId: item.p2.avatar_id,
            level: item.p2.level || 1,
            totalStars: item.p2.total_stars || 0,
            classicBestScore: item.p2.classic_best_score || 0,
            friendshipStatus: 'FRIENDS',
          });
        }
      });

      f2?.forEach((item: any) => {
        if (item.p1) {
          list.push({
            id: item.p1.id,
            displayName: item.p1.display_name,
            avatarId: item.p1.avatar_id,
            level: item.p1.level || 1,
            totalStars: item.p1.total_stars || 0,
            classicBestScore: item.p1.classic_best_score || 0,
            friendshipStatus: 'FRIENDS',
          });
        }
      });

      return list;
    } catch {
      return [];
    }
  }

  /**
   * Removes a friend
   */
  public static async removeFriend(playerId: string, friendId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      this.mockFriendships.delete(`${playerId}_${friendId}`);
      this.mockFriendships.delete(`${friendId}_${playerId}`);
      return true;
    }

    try {
      await supabase
        .from('friendships')
        .delete()
        .or(`and(player_id_1.eq.${playerId},player_id_2.eq.${friendId}),and(player_id_1.eq.${friendId},player_id_2.eq.${playerId})`);

      return true;
    } catch {
      return false;
    }
  }
}
