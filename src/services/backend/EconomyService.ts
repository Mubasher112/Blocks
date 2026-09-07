import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StorageService } from '../Storage';
import { CoinTransaction, PlayerEconomy, TransactionType } from '../../game/economy/EconomyTypes';
import { ProgressionConfig } from '../../game/economy/EconomyConfig';

const LOCAL_ECONOMY_KEY = 'block_nova_player_economy';
const LOCAL_LEDGER_KEY = 'block_nova_coin_ledger';

export class EconomyService {
  /**
   * Get current player economy (Coins, Level, XP)
   */
  public static async getEconomy(playerId?: string): Promise<PlayerEconomy> {
    if (playerId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('player_economy')
          .select('coins, level, current_xp, total_xp')
          .eq('player_id', playerId)
          .single();

        if (data && !error) {
          const economy: PlayerEconomy = {
            coins: data.coins,
            level: data.level,
            currentXP: data.current_xp,
            totalXP: data.total_xp,
          };
          await StorageService.setItem(LOCAL_ECONOMY_KEY, economy);
          return economy;
        }
      } catch (err) {
        console.warn('EconomyService.getEconomy cloud fetch failed, falling back to local storage', err);
      }
    }

    const localEconomy = await StorageService.getItem<PlayerEconomy>(LOCAL_ECONOMY_KEY);
    return (
      localEconomy || {
        coins: 0,
        level: 1,
        currentXP: 0,
        totalXP: 0,
      }
    );
  }

  /**
   * Save authoritative player economy locally and to cloud
   */
  public static async saveEconomy(playerId: string, economy: PlayerEconomy): Promise<void> {
    const sanitizedCoins = Math.min(Math.max(0, economy.coins), ProgressionConfig.MAX_COINS);
    const sanitizedXP = Math.min(Math.max(0, economy.totalXP), ProgressionConfig.MAX_XP);

    const sanitizedEconomy: PlayerEconomy = {
      ...economy,
      coins: sanitizedCoins,
      totalXP: sanitizedXP,
    };

    await StorageService.setItem(LOCAL_ECONOMY_KEY, sanitizedEconomy);

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('player_economy').upsert(
          {
            player_id: playerId,
            coins: sanitizedEconomy.coins,
            level: sanitizedEconomy.level,
            current_xp: sanitizedEconomy.currentXP,
            total_xp: sanitizedEconomy.totalXP,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'player_id' }
        );
      } catch (err) {
        console.warn('EconomyService.saveEconomy cloud sync failed', err);
      }
    }
  }

  /**
   * Process an idempotent coin addition
   */
  public static async addCoins(
    playerId: string,
    amount: number,
    source: string,
    referenceId: string,
    type: TransactionType = 'GAME_REWARD',
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; newBalance: number; duplicate: boolean }> {
    if (amount <= 0) {
      const economy = await this.getEconomy(playerId);
      return { success: false, newBalance: economy.coins, duplicate: false };
    }

    // Check transaction idempotency reference
    const ledger = (await StorageService.getItem<CoinTransaction[]>(LOCAL_LEDGER_KEY)) || [];
    const existingTx = ledger.find(tx => tx.referenceId === referenceId);
    if (existingTx) {
      const economy = await this.getEconomy(playerId);
      return { success: true, newBalance: economy.coins, duplicate: true };
    }

    const currentEconomy = await this.getEconomy(playerId);
    const newBalance = Math.min(currentEconomy.coins + amount, ProgressionConfig.MAX_COINS);

    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playerId,
      type,
      amount,
      balanceAfter: newBalance,
      source,
      referenceId,
      metadata,
      createdAt: new Date().toISOString(),
    };

    ledger.unshift(newTx);
    await StorageService.setItem(LOCAL_LEDGER_KEY, ledger.slice(0, 100)); // Keep recent 100 transactions locally

    currentEconomy.coins = newBalance;
    await this.saveEconomy(playerId, currentEconomy);

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('coin_ledger').insert({
          player_id: playerId,
          transaction_type: type,
          amount,
          balance_after: newBalance,
          source,
          reference_id: referenceId,
          metadata,
          created_at: newTx.createdAt,
        });
      } catch (err) {
        console.warn('EconomyService.addCoins ledger insert failed', err);
      }
    }

    return { success: true, newBalance, duplicate: false };
  }

  /**
   * Spend coins safely with non-negative balance enforcement
   */
  public static async spendCoins(
    playerId: string,
    amount: number,
    reason: string,
    referenceId: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; newBalance: number; message?: string }> {
    if (amount <= 0) {
      const economy = await this.getEconomy(playerId);
      return { success: false, newBalance: economy.coins, message: 'Invalid spend amount' };
    }

    const currentEconomy = await this.getEconomy(playerId);
    if (currentEconomy.coins < amount) {
      return { success: false, newBalance: currentEconomy.coins, message: 'Insufficient coins' };
    }

    const newBalance = currentEconomy.coins - amount;

    const ledger = (await StorageService.getItem<CoinTransaction[]>(LOCAL_LEDGER_KEY)) || [];
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playerId,
      type: 'SPEND',
      amount: -amount,
      balanceAfter: newBalance,
      source: reason,
      referenceId,
      metadata,
      createdAt: new Date().toISOString(),
    };

    ledger.unshift(newTx);
    await StorageService.setItem(LOCAL_LEDGER_KEY, ledger.slice(0, 100));

    currentEconomy.coins = newBalance;
    await this.saveEconomy(playerId, currentEconomy);

    if (playerId && supabase) {
      try {
        await supabase.from('coin_ledger').insert({
          player_id: playerId,
          transaction_type: 'SPEND',
          amount: -amount,
          balance_after: newBalance,
          source: reason,
          reference_id: referenceId,
          metadata,
          created_at: newTx.createdAt,
        });
      } catch (err) {
        console.warn('EconomyService.spendCoins ledger insert failed', err);
      }
    }

    return { success: true, newBalance };
  }

  /**
   * Check if player can afford an amount
   */
  public static async canAfford(playerId: string, amount: number): Promise<boolean> {
    const economy = await this.getEconomy(playerId);
    return economy.coins >= amount;
  }

  /**
   * Get transaction history for auditing
   */
  public static async getTransactionHistory(playerId?: string): Promise<CoinTransaction[]> {
    if (playerId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coin_ledger')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data && !error) {
          return data.map((d: any) => ({
            id: d.id,
            playerId: d.player_id,
            type: d.transaction_type,
            amount: d.amount,
            balanceAfter: d.balance_after,
            source: d.source,
            referenceId: d.reference_id,
            metadata: d.metadata,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('EconomyService.getTransactionHistory cloud fetch failed', err);
      }
    }

    return (await StorageService.getItem<CoinTransaction[]>(LOCAL_LEDGER_KEY)) || [];
  }
}
