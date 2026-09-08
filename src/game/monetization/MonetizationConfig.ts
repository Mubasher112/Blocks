import { ProductCatalogItem } from './MonetizationTypes';

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    id: 'blocknova_coins_1000',
    title: 'Small Coin Pack',
    description: '1,000 Bonus Coins for customization and power utilities',
    type: 'CONSUMABLE_COINS',
    coinsAmount: 1000,
    priceFormatted: '$0.99',
    priceMicros: 990000,
    currencyCode: 'USD',
  },
  {
    id: 'blocknova_coins_5500',
    title: 'Medium Coin Pack',
    description: '5,500 Bonus Coins (Best Value)',
    type: 'CONSUMABLE_COINS',
    coinsAmount: 5500,
    priceFormatted: '$4.99',
    priceMicros: 4990000,
    currencyCode: 'USD',
  },
  {
    id: 'blocknova_coins_12000',
    title: 'Large Coin Pack',
    description: '12,000 Bonus Coins (Mega Vault)',
    type: 'CONSUMABLE_COINS',
    coinsAmount: 12000,
    priceFormatted: '$9.99',
    priceMicros: 9990000,
    currencyCode: 'USD',
  },
  {
    id: 'blocknova_remove_ads',
    title: 'Remove Ads',
    description: 'Permanently remove forced interstitial ads for smooth play',
    type: 'NON_CONSUMABLE_ENTITLEMENT',
    entitlementKey: 'REMOVE_ADS',
    priceFormatted: '$2.99',
    priceMicros: 2990000,
    currencyCode: 'USD',
  },
];

export class MonetizationConfig {
  // Rewarded Ads Limits
  public static readonly REWARDED_COIN_AMOUNT = 50;
  public static readonly MAX_REWARDED_COIN_ADS_PER_DAY = 3;
  public static readonly MAX_CONTINUES_PER_GAME = 1;

  // Interstitial Ads Frequency Rules
  public static readonly INTERSTITIAL_GAME_FREQUENCY = 3; // Show every 3 completed games
  public static readonly INTERSTITIAL_MIN_COOLDOWN_SEC = 90; // Minimum 90 sec between interstitials

  // Feature Flags
  public static readonly FLAGS = {
    adsEnabled: true,
    rewardedAdsEnabled: true,
    interstitialAdsEnabled: true,
    shopEnabled: true,
    removeAdsEnabled: true,
    coinPurchasesEnabled: true,
  };
}
