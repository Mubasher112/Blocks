export type ProductType = 'CONSUMABLE_COINS' | 'NON_CONSUMABLE_ENTITLEMENT';

export interface ProductCatalogItem {
  id: string;
  title: string;
  description: string;
  type: ProductType;
  coinsAmount?: number;
  entitlementKey?: string;
  priceFormatted: string; // e.g. "$0.99"
  priceMicros: number;
  currencyCode: string;
}

export type PurchaseState =
  | 'NOT_PURCHASED'
  | 'PURCHASE_PENDING'
  | 'PURCHASED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RESTORED'
  | 'REFUNDED'
  | 'REVOKED'
  | 'UNKNOWN';

export interface PurchaseTransactionRecord {
  id: string;
  transactionId: string;
  playerId: string;
  productId: string;
  platform: 'android' | 'ios' | 'web_mock';
  status: PurchaseState;
  purchaseDate: string;
  validationData?: Record<string, any>;
}

export type EntitlementKey = 'REMOVE_ADS';

export interface PlayerEntitlementRecord {
  entitlement: EntitlementKey;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  source: string;
  updatedAt: string;
}

export type AdResult = 'COMPLETED' | 'SKIPPED' | 'FAILED' | 'NOT_AVAILABLE';

export type ConsentStatus = 'UNKNOWN' | 'REQUIRED' | 'GRANTED' | 'DENIED' | 'NOT_APPLICABLE';
