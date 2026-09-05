import { supabase, isSupabaseConfigured } from './supabaseClient';
import { LeaderboardCategory } from './ScoreService';

export interface LeaderboardRankEntry {
  rank: number;
  playerId: string;
  displayName: string;
  avatarId: string;
  score: number;
  isCurrentPlayer: boolean;
}

export class LeaderboardService {
  /**
   * Fetches top N leaderboard entries for a specific category, period, and filter mode
   */
  public static async getLeaderboard(
    category: LeaderboardCategory,
    periodKey: string = 'ALL_TIME',
    filterMode: 'GLOBAL' | 'FRIENDS' = 'GLOBAL',
    currentPlayerId: string | null = null,
    limit: number = 50
  ): Promise<LeaderboardRankEntry[]> {
    if (!isSupabaseConfigured) {
      // Mock leaderboard data for development/testing
      const mockList: LeaderboardRankEntry[] = [
        { rank: 1, playerId: 'p_1', displayName: 'SarahNova', avatarId: 'avatar_2', score: 18920, isCurrentPlayer: false },
        { rank: 2, playerId: 'p_2', displayName: 'AhmedBlock', avatarId: 'avatar_3', score: 18410, isCurrentPlayer: false },
        { rank: 3, playerId: currentPlayerId || 'guest_1', displayName: 'You', avatarId: 'avatar_1', score: 17850, isCurrentPlayer: true },
        { rank: 4, playerId: 'p_3', displayName: 'JohnPuzzle', avatarId: 'avatar_4', score: 16920, isCurrentPlayer: false },
        { rank: 5, playerId: 'p_4', displayName: 'AliMaster', avatarId: 'avatar_1', score: 16480, isCurrentPlayer: false },
      ];
      return mockList.slice(0, limit);
    }

    try {
      let query = supabase
        .from('leaderboards')
        .select('*')
        .eq('category', category)
        .eq('period_key', periodKey)
        .order('score', { ascending: false })
        .limit(limit);

      if (filterMode === 'FRIENDS' && currentPlayerId) {
        // Query accepted friend IDs
        const { data: friends1 } = await supabase
          .from('friendships')
          .select('player_id_2')
          .eq('player_id_1', currentPlayerId);

        const { data: friends2 } = await supabase
          .from('friendships')
          .select('player_id_1')
          .eq('player_id_2', currentPlayerId);

        const friendIds = [
          currentPlayerId,
          ...(friends1?.map((f) => f.player_id_2) || []),
          ...(friends2?.map((f) => f.player_id_1) || []),
        ];

        query = query.in('player_id', friendIds);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((entry, idx) => ({
        rank: idx + 1,
        playerId: entry.player_id,
        displayName: entry.display_name,
        avatarId: entry.avatar_id,
        score: entry.score,
        isCurrentPlayer: entry.player_id === currentPlayerId,
      }));
    } catch (e) {
      console.warn('LeaderboardService fetch error:', e);
      return [];
    }
  }

  /**
   * Looks up the player's own rank in a given category and period
   */
  public static async getPlayerRank(
    playerId: string,
    category: LeaderboardCategory,
    periodKey: string = 'ALL_TIME'
  ): Promise<LeaderboardRankEntry | null> {
    const list = await this.getLeaderboard(category, periodKey, 'GLOBAL', playerId, 100);
    const own = list.find((entry) => entry.playerId === playerId);
    return own || null;
  }
}
