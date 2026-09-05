import { supabase, isSupabaseConfigured } from './supabaseClient';

export type AuthProvider = 'google' | 'facebook' | 'apple' | 'guest';

export interface PlayerProfile {
  id: string; // Internal UUID
  userId: string | null; // Auth.users UUID if linked
  displayName: string;
  avatarId: string;
  accountStatus: 'GUEST' | 'LINKED';
  xp: number;
  level: number;
  coins: number;
  totalStars: number;
  gamesPlayed: number;
  classicBestScore: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthState {
  player: PlayerProfile | null;
  loading: boolean;
  authenticated: boolean;
  isGuest: boolean;
  error: string | null;
}

export class AuthService {
  private static mockPlayer: PlayerProfile | null = null;

  /**
   * Creates or restores a Guest account
   */
  public static async loginAsGuest(): Promise<PlayerProfile> {
    if (!isSupabaseConfigured) {
      if (!this.mockPlayer) {
        const guestNum = Math.floor(1000 + Math.random() * 9000);
        this.mockPlayer = {
          id: `guest_${Date.now()}`,
          userId: null,
          displayName: `Nova Player ${guestNum}`,
          avatarId: 'avatar_1',
          accountStatus: 'GUEST',
          xp: 0,
          level: 1,
          coins: 0,
          totalStars: 0,
          gamesPlayed: 0,
          classicBestScore: 0,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };
      }
      return this.mockPlayer;
    }

    // Supabase Anonymous / Guest sign in
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) throw authError;

    const userId = authData.user?.id || null;
    const guestNum = Math.floor(1000 + Math.random() * 9000);

    const newPlayer: PlayerProfile = {
      id: userId || `guest_${Date.now()}`,
      userId,
      displayName: `Nova Player ${guestNum}`,
      avatarId: 'avatar_1',
      accountStatus: 'GUEST',
      xp: 0,
      level: 1,
      coins: 0,
      totalStars: 0,
      gamesPlayed: 0,
      classicBestScore: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    // Upsert into Supabase players table
    await supabase.from('players').upsert({
      id: newPlayer.id,
      user_id: userId,
      display_name: newPlayer.displayName,
      avatar_id: newPlayer.avatarId,
      account_status: newPlayer.accountStatus,
    });

    return newPlayer;
  }

  /**
   * OAuth Provider Sign In (Google, Facebook, Apple)
   */
  public static async signInWithOAuth(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
    if (!isSupabaseConfigured) {
      if (this.mockPlayer) {
        this.mockPlayer.accountStatus = 'LINKED';
        this.mockPlayer.displayName = `Nova Champion (${provider.toUpperCase()})`;
      }
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'com.blocknova.game://auth-callback',
      },
    });

    if (error) throw error;
  }

  /**
   * Links an existing Guest account to an OAuth provider without changing player ID or losing progress
   */
  public static async linkGuestToProvider(
    currentGuest: PlayerProfile,
    provider: 'google' | 'facebook' | 'apple'
  ): Promise<PlayerProfile> {
    if (!isSupabaseConfigured) {
      currentGuest.accountStatus = 'LINKED';
      currentGuest.displayName = `${currentGuest.displayName} (${provider.toUpperCase()})`;
      return currentGuest;
    }

    await this.signInWithOAuth(provider);
    currentGuest.accountStatus = 'LINKED';

    await supabase.from('players').update({
      account_status: 'LINKED',
    }).eq('id', currentGuest.id);

    return currentGuest;
  }

  /**
   * Updates player display name or avatar ID
   */
  public static async updateProfile(
    player: PlayerProfile,
    updates: { displayName?: string; avatarId?: string }
  ): Promise<PlayerProfile> {
    const updated = {
      ...player,
      displayName: updates.displayName?.trim() || player.displayName,
      avatarId: updates.avatarId || player.avatarId,
      lastActiveAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('players').update({
        display_name: updated.displayName,
        avatar_id: updated.avatarId,
        last_active_at: updated.lastActiveAt,
      }).eq('id', player.id);
    } else {
      this.mockPlayer = updated;
    }

    return updated;
  }

  /**
   * Sign out current session
   */
  public static async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    this.mockPlayer = null;
  }
}
