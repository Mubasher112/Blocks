import { supabase, isSupabaseConfigured } from '../backend/supabaseClient';
import { StorageService } from '../Storage';
import { PRODUCT_CATALOG } from '../../game/monetization/MonetizationConfig';
import {
  ProductCatalogItem,
  PurchaseState,
  PurchaseTransactionRecord,
} from '../../game/monetization/MonetizationTypes';
import { EconomyService } from '../backend/EconomyService';
import { EntitlementService } from './EntitlementService';

const LOCAL_PURCHASE_HISTORY = 'block_nova_purchase_history';

export class PurchaseService {
  /**
   * Get available product catalog
   */
  public static getProducts(): ProductCatalogItem[] {
    return PRODUCT_CATALOG;
  }

  /**
   * Process product purchase with reference-based idempotency
   */
  public static async purchaseProduct(
    playerId: string,
    productId: string,
    simulatedState: PurchaseState = 'PURCHASED'
  ): Promise<{ success: boolean; state: PurchaseState; message?: string }> {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) {
      return { success: false, state: 'FAILED', message: 'Product not found' };
    }

    if (simulatedState !== 'PURCHASED') {
      return { success: false, state: simulatedState, message: 'Purchase cancelled or failed' };
    }

    const transactionId = `tx_store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const refId = `purchase_${playerId}_${productId}_${transactionId}`;

    // Record purchase transaction
    const history = (await StorageService.getItem<PurchaseTransactionRecord[]>(LOCAL_PURCHASE_HISTORY)) || [];
    const newRecord: PurchaseTransactionRecord = {
      id: transactionId,
      transactionId,
      playerId,
      productId,
      platform: 'web_mock',
      status: 'PURCHASED',
      purchaseDate: new Date().toISOString(),
    };

    history.unshift(newRecord);
    await StorageService.setItem(LOCAL_PURCHASE_HISTORY, history);

    if (playerId && isSupabaseConfigured) {
      try {
        await supabase.from('purchase_transactions').insert({
          transaction_id: transactionId,
          player_id: playerId,
          product_id: productId,
          platform: 'web_mock',
          status: 'PURCHASED',
          purchase_date: newRecord.purchaseDate,
        });
      } catch (err) {
        console.warn('PurchaseService.purchaseProduct cloud insert failed', err);
      }
    }

    // Process reward or entitlement based on product type
    if (product.type === 'CONSUMABLE_COINS' && product.coinsAmount) {
      await EconomyService.addCoins(
        playerId,
        product.coinsAmount,
        `Purchase ${product.title}`,
        refId,
        'PURCHASE'
      );
    } else if (product.type === 'NON_CONSUMABLE_ENTITLEMENT' && product.entitlementKey) {
      await EntitlementService.grantEntitlement(playerId, product.entitlementKey as any, `Purchase ${product.title}`);
    }

    return { success: true, state: 'PURCHASED' };
  }

  /**
   * Restore non-consumable purchases (e.g. REMOVE_ADS)
   */
  public static async restorePurchases(
    playerId: string
  ): Promise<{ restoredCount: number; message: string }> {
    const history = (await StorageService.getItem<PurchaseTransactionRecord[]>(LOCAL_PURCHASE_HISTORY)) || [];
    let restoredCount = 0;

    for (const record of history) {
      if (record.status === 'PURCHASED') {
        const product = PRODUCT_CATALOG.find(p => p.id === record.productId);
        if (product && product.type === 'NON_CONSUMABLE_ENTITLEMENT' && product.entitlementKey) {
          await EntitlementService.grantEntitlement(
            playerId,
            product.entitlementKey as any,
            'Restored Purchase'
          );
          restoredCount += 1;
        }
      }
    }

    if (playerId && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('purchase_transactions')
          .select('*')
          .eq('player_id', playerId)
          .eq('status', 'PURCHASED');

        if (data) {
          for (const item of data) {
            const product = PRODUCT_CATALOG.find(p => p.id === item.product_id);
            if (product && product.type === 'NON_CONSUMABLE_ENTITLEMENT' && product.entitlementKey) {
              await EntitlementService.grantEntitlement(
                playerId,
                product.entitlementKey as any,
                'Restored Cloud Purchase'
              );
              restoredCount += 1;
            }
          }
        }
      } catch (err) {
        console.warn('PurchaseService.restorePurchases cloud fetch failed', err);
      }
    }

    return {
      restoredCount,
      message: restoredCount > 0 ? `Restored ${restoredCount} purchase(s)` : 'No previous non-consumable purchases found',
    };
  }
}
