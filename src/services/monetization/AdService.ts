import { StorageService } from '../Storage';
import { EntitlementService } from './EntitlementService';
import { AdResult } from '../../game/monetization/MonetizationTypes';
import { MonetizationConfig } from '../../game/monetization/MonetizationConfig';
import { EconomyService } from '../backend/EconomyService';

const LOCAL_REWARDED_ADS_TRACKER = 'block_nova_rewarded_ads_tracker';

export class AdFrequencyManager {
  private static gamesPlayedCount = 0;
  private static lastInterstitialTimestamp = 0;

  public static recordGameCompleted(): void {
    this.gamesPlayedCount += 1;
  }

  public static canShowInterstitial(): boolean {
    const now = Date.now();
    const timeSinceLastSec = (now - this.lastInterstitialTimestamp) / 1000;

    if (this.gamesPlayedCount >= MonetizationConfig.INTERSTITIAL_GAME_FREQUENCY) {
      if (this.lastInterstitialTimestamp === 0 || timeSinceLastSec >= MonetizationConfig.INTERSTITIAL_MIN_COOLDOWN_SEC) {
        return true;
      }
    }
    return false;
  }

  public static recordInterstitialShown(): void {
    this.gamesPlayedCount = 0;
    this.lastInterstitialTimestamp = Date.now();
  }
}

export class AdService {
  /**
   * Get total rewarded coin ads watched today UTC
   */
  public static async getDailyRewardedCoinAdsCount(playerId: string): Promise<number> {
    const tracker = (await StorageService.getItem<Record<string, { date: string; count: number }>>(
      LOCAL_REWARDED_ADS_TRACKER
    )) || {};

    const today = new Date().toISOString().split('T')[0];
    const record = tracker[playerId];

    if (record && record.date === today) {
      return record.count;
    }
    return 0;
  }

  /**
   * Check if player can watch a rewarded ad for free coins today
   */
  public static async canWatchRewardedCoinAd(playerId: string): Promise<boolean> {
    const count = await this.getDailyRewardedCoinAdsCount(playerId);
    return count < MonetizationConfig.MAX_REWARDED_COIN_ADS_PER_DAY;
  }

  /**
   * Show optional Rewarded Ad for free coins
   */
  public static async showRewardedCoinAd(
    playerId: string
  ): Promise<{ result: AdResult; coinsGranted: number; message?: string }> {
    const canWatch = await this.canWatchRewardedCoinAd(playerId);
    if (!canWatch) {
      return {
        result: 'NOT_AVAILABLE',
        coinsGranted: 0,
        message: 'Daily limit reached for free coin ads (3/3)',
      };
    }

    // Simulate/invoke rewarded ad playback
    const adResult: AdResult = 'COMPLETED';

    if (adResult === 'COMPLETED') {
      const today = new Date().toISOString().split('T')[0];
      const count = await this.getDailyRewardedCoinAdsCount(playerId);

      const tracker = (await StorageService.getItem<Record<string, { date: string; count: number }>>(
        LOCAL_REWARDED_ADS_TRACKER
      )) || {};

      tracker[playerId] = { date: today, count: count + 1 };
      await StorageService.setItem(LOCAL_REWARDED_ADS_TRACKER, tracker);

      const refId = `rewarded_ad_coins_${playerId}_${today}_${count + 1}`;

      await EconomyService.addCoins(
        playerId,
        MonetizationConfig.REWARDED_COIN_AMOUNT,
        'Rewarded Ad Free Coins',
        refId,
        'AD_REWARD'
      );

      return {
        result: 'COMPLETED',
        coinsGranted: MonetizationConfig.REWARDED_COIN_AMOUNT,
      };
    }

    return { result: adResult, coinsGranted: 0 };
  }

  /**
   * Show optional Rewarded Ad for Continue
   */
  public static async showRewardedContinueAd(): Promise<{ result: AdResult }> {
    // In dev / production abstraction, return completed ad result
    return { result: 'COMPLETED' };
  }

  /**
   * Show forced Interstitial Ad if applicable and not suppressed by REMOVE_ADS
   */
  public static async showInterstitialIfEligible(playerId: string): Promise<boolean> {
    if (!MonetizationConfig.FLAGS.interstitialAdsEnabled) return false;

    const hasRemoveAds = await EntitlementService.hasEntitlement(playerId, 'REMOVE_ADS');
    if (hasRemoveAds) {
      return false; // Suppressed by REMOVE_ADS entitlement
    }

    if (AdFrequencyManager.canShowInterstitial()) {
      AdFrequencyManager.recordInterstitialShown();
      return true;
    }

    return false;
  }
}
