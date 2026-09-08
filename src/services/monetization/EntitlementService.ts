import { supabase, isSupabaseConfigured } from '../backend/supabaseClient';
import { StorageService } from '../Storage';
import { EntitlementKey, PlayerEntitlementRecord } from '../../game/monetization/MonetizationTypes';

const LOCAL_ENTITLEMENTS_KEY = 'block_nova_player_entitlements';

export class EntitlementService {
  /**
   * Check if player holds an active entitlement
   */
  public static async hasEntitlement(playerId: string, entitlement: EntitlementKey): Promise<boolean> {
    const entitlements = await this.getEntitlements(playerId);
    const record = entitlements[entitlement];
    return Boolean(record && record.status === 'ACTIVE');
  }

  /**
   * Get all active entitlements for player
   */
  public static async getEntitlements(playerId?: string): Promise<Record<string, PlayerEntitlementRecord>> {
    let localMap = (await StorageService.getItem<Record<string, PlayerEntitlementRecord>>(LOCAL_ENTITLEMENTS_KEY)) || {};

    if (playerId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('player_entitlements')
          .select('entitlement, status, source, updated_at')
          .eq('player_id', playerId);

        if (data && !error) {
          data.forEach((item: any) => {
            localMap[item.entitlement] = {
              entitlement: item.entitlement,
              status: item.status,
              source: item.source,
              updatedAt: item.updated_at,
            };
          });
          await StorageService.setItem(LOCAL_ENTITLEMENTS_KEY, localMap);
        }
      } catch (err) {
        console.warn('EntitlementService.getEntitlements cloud fetch failed', err);
      }
    }

    return localMap;
  }

  /**
   * Grant entitlement to player idempotently
   */
  public static async grantEntitlement(
    playerId: string,
    entitlement: EntitlementKey,
    source: string
  ): Promise<void> {
    const localMap = (await StorageService.getItem<Record<string, PlayerEntitlementRecord>>(LOCAL_ENTITLEMENTS_KEY)) || {};

    const record: PlayerEntitlementRecord = {
      entitlement,
      status: 'ACTIVE',
      source,
      updatedAt: new Date().toISOString(),
    };

    localMap[entitlement] = record;
    await StorageService.setItem(LOCAL_ENTITLEMENTS_KEY, localMap);

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('player_entitlements').upsert({
          player_id: playerId,
          entitlement,
          status: 'ACTIVE',
          source,
          updated_at: record.updatedAt,
        }, { onConflict: 'player_id,entitlement' });
      } catch (err) {
        console.warn('EntitlementService.grantEntitlement cloud update failed', err);
      }
    }
  }

  /**
   * Revoke entitlement if refunded/revoked
   */
  public static async revokeEntitlement(playerId: string, entitlement: EntitlementKey): Promise<void> {
    const localMap = (await StorageService.getItem<Record<string, PlayerEntitlementRecord>>(LOCAL_ENTITLEMENTS_KEY)) || {};

    if (localMap[entitlement]) {
      localMap[entitlement].status = 'REVOKED';
      localMap[entitlement].updatedAt = new Date().toISOString();
      await StorageService.setItem(LOCAL_ENTITLEMENTS_KEY, localMap);
    }

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase
          .from('player_entitlements')
          .update({ status: 'REVOKED', updated_at: new Date().toISOString() })
          .eq('player_id', playerId)
          .eq('entitlement', entitlement);
      } catch (err) {
        console.warn('EntitlementService.revokeEntitlement cloud update failed', err);
      }
    }
  }
}
