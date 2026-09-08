import { describe, it, expect, beforeEach } from 'vitest';
import { MonetizationService } from '../services/monetization/MonetizationService';
import { EconomyService } from '../services/backend/EconomyService';
import { StorageService } from '../services/Storage';
import { AdFrequencyManager } from '../services/monetization/AdService';

describe('Monetization, Shop & Ad Architecture', () => {
  const TEST_PLAYER_ID = 'player_monetization_test';

  beforeEach(async () => {
    await StorageService.removeItem('block_nova_player_economy');
    await StorageService.removeItem('block_nova_coin_ledger');
    await StorageService.removeItem('block_nova_player_entitlements');
    await StorageService.removeItem('block_nova_purchase_history');
    await StorageService.removeItem('block_nova_rewarded_ads_tracker');
  });

  describe('PurchaseService & Coin Packages', () => {
    it('returns product catalog with coin packs and Remove Ads', () => {
      const products = MonetizationService.purchases.getProducts();
      expect(products.length).toBeGreaterThanOrEqual(4);

      const removeAds = products.find(p => p.id === 'blocknova_remove_ads');
      expect(removeAds).toBeDefined();
      expect(removeAds?.type).toBe('NON_CONSUMABLE_ENTITLEMENT');
    });

    it('purchases consumable coin pack and grants coins to EconomyService', async () => {
      const initialEcon = await EconomyService.getEconomy(TEST_PLAYER_ID);
      expect(initialEcon.coins).toBe(0);

      const buyRes = await MonetizationService.purchases.purchaseProduct(
        TEST_PLAYER_ID,
        'blocknova_coins_1000'
      );
      expect(buyRes.success).toBe(true);
      expect(buyRes.state).toBe('PURCHASED');

      const updatedEcon = await EconomyService.getEconomy(TEST_PLAYER_ID);
      expect(updatedEcon.coins).toBe(1000);
    });

    it('purchases Remove Ads and grants active entitlement', async () => {
      const initialHasAds = await MonetizationService.entitlements.hasEntitlement(
        TEST_PLAYER_ID,
        'REMOVE_ADS'
      );
      expect(initialHasAds).toBe(false);

      const buyRes = await MonetizationService.purchases.purchaseProduct(
        TEST_PLAYER_ID,
        'blocknova_remove_ads'
      );
      expect(buyRes.success).toBe(true);

      const hasAdsAfter = await MonetizationService.entitlements.hasEntitlement(
        TEST_PLAYER_ID,
        'REMOVE_ADS'
      );
      expect(hasAdsAfter).toBe(true);
    });

    it('restores non-consumable Remove Ads purchase', async () => {
      await MonetizationService.purchases.purchaseProduct(
        TEST_PLAYER_ID,
        'blocknova_remove_ads'
      );

      // Simulate new session/device
      await StorageService.removeItem('block_nova_player_entitlements');
      const hasAdsCleared = await MonetizationService.entitlements.hasEntitlement(
        TEST_PLAYER_ID,
        'REMOVE_ADS'
      );
      expect(hasAdsCleared).toBe(false);

      const restoreRes = await MonetizationService.purchases.restorePurchases(TEST_PLAYER_ID);
      expect(restoreRes.restoredCount).toBeGreaterThan(0);

      const hasAdsRestored = await MonetizationService.entitlements.hasEntitlement(
        TEST_PLAYER_ID,
        'REMOVE_ADS'
      );
      expect(hasAdsRestored).toBe(true);
    });
  });

  describe('AdService & Frequency Rules', () => {
    it('enforces 3/day daily limit on rewarded coin ads', async () => {
      for (let i = 1; i <= 3; i++) {
        const canWatch = await MonetizationService.ads.canWatchRewardedCoinAd(TEST_PLAYER_ID);
        expect(canWatch).toBe(true);

        const adRes = await MonetizationService.ads.showRewardedCoinAd(TEST_PLAYER_ID);
        expect(adRes.result).toBe('COMPLETED');
        expect(adRes.coinsGranted).toBe(50);
      }

      // 4th attempt should be blocked
      const canWatch4 = await MonetizationService.ads.canWatchRewardedCoinAd(TEST_PLAYER_ID);
      expect(canWatch4).toBe(false);

      const adRes4 = await MonetizationService.ads.showRewardedCoinAd(TEST_PLAYER_ID);
      expect(adRes4.result).toBe('NOT_AVAILABLE');
      expect(adRes4.coinsGranted).toBe(0);

      const econ = await EconomyService.getEconomy(TEST_PLAYER_ID);
      expect(econ.coins).toBe(150); // Exactly 3 * 50
    });

    it('suppresses interstitials for players with REMOVE_ADS entitlement', async () => {
      // Grant Remove Ads entitlement
      await MonetizationService.entitlements.grantEntitlement(
        TEST_PLAYER_ID,
        'REMOVE_ADS',
        'Test Purchase'
      );

      // Simulate 5 completed games
      for (let i = 0; i < 5; i++) {
        AdFrequencyManager.recordGameCompleted();
      }

      const shouldShow = await MonetizationService.ads.showInterstitialIfEligible(TEST_PLAYER_ID);
      expect(shouldShow).toBe(false); // Suppressed by REMOVE_ADS
    });
  });
});
