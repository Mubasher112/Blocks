import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react-native';
import { ProductCatalogItem } from '../../game/monetization/MonetizationTypes';
import { PurchaseService } from '../../services/monetization/PurchaseService';

interface ShopScreenProps {
  products: ProductCatalogItem[];
  coins: number;
  hasRemoveAds: boolean;
  onBuyProduct: (productId: string) => Promise<void>;
  onRestorePurchases: () => Promise<void>;
  onWatchFreeCoinAd: () => Promise<void>;
  canWatchCoinAd: boolean;
  freeCoinAdCount: number;
  onBack: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  products,
  coins,
  hasRemoveAds,
  onBuyProduct,
  onRestorePurchases,
  onWatchFreeCoinAd,
  canWatchCoinAd,
  freeCoinAdCount,
  onBack,
}) => {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const handleBuy = async (productId: string) => {
    if (purchasingId) return; // Prevent double-tap
    setPurchasingId(productId);
    await onBuyProduct(productId);
    setPurchasingId(null);
  };

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    await onRestorePurchases();
    setIsRestoring(false);
  };

  const coinPacks = products.filter(p => p.type === 'CONSUMABLE_COINS');
  const removeAdsItem = products.find(p => p.id === 'blocknova_remove_ads');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHOP</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>🪙 {coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Remove Ads Section */}
        {removeAdsItem && (
          <View style={styles.removeAdsCard}>
            <View style={styles.removeAdsHeader}>
              <Sparkles color="#00F0FF" size={28} />
              <View style={styles.removeAdsTextCol}>
                <Text style={styles.removeAdsTitle}>{removeAdsItem.title}</Text>
                <Text style={styles.removeAdsDesc}>{removeAdsItem.description}</Text>
              </View>
            </View>

            {hasRemoveAds ? (
              <View style={styles.ownedBadge}>
                <Text style={styles.ownedBadgeText}>✓ ADS REMOVED</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.buyBtn, purchasingId === removeAdsItem.id && styles.disabledBtn]}
                disabled={Boolean(purchasingId)}
                onPress={() => handleBuy(removeAdsItem.id)}
              >
                <Text style={styles.buyBtnText}>
                  {purchasingId === removeAdsItem.id ? 'PROCESSING...' : `BUY FOR ${removeAdsItem.priceFormatted}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Free Coins Rewarded Ad Card */}
        <View style={styles.freeCoinsCard}>
          <View style={styles.freeCoinsTextCol}>
            <Text style={styles.freeCoinsTitle}>FREE COINS</Text>
            <Text style={styles.freeCoinsDesc}>
              Watch a short video for +50 Bonus Coins ({freeCoinAdCount}/3 today)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.watchAdBtn, !canWatchCoinAd && styles.disabledBtn]}
            disabled={!canWatchCoinAd}
            onPress={onWatchFreeCoinAd}
          >
            <Text style={styles.watchAdBtnText}>
              {canWatchCoinAd ? '📺 WATCH (+50 🪙)' : 'LIMIT REACHED'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Coin Packages Grid */}
        <Text style={styles.sectionTitle}>COIN PACKAGES</Text>
        <View style={styles.coinGrid}>
          {coinPacks.map((pack) => (
            <View key={pack.id} style={styles.packCard}>
              <Text style={styles.packCoinsText}>🪙 +{pack.coinsAmount?.toLocaleString()}</Text>
              <Text style={styles.packTitleText}>{pack.title}</Text>
              <TouchableOpacity
                style={[styles.packBuyBtn, purchasingId === pack.id && styles.disabledBtn]}
                disabled={Boolean(purchasingId)}
                onPress={() => handleBuy(pack.id)}
              >
                <Text style={styles.packBuyBtnText}>
                  {purchasingId === pack.id ? '...' : pack.priceFormatted}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreBtn}
          disabled={isRestoring}
          onPress={handleRestore}
        >
          <RefreshCw color="#9CA3AF" size={16} />
          <Text style={styles.restoreBtnText}>
            {isRestoring ? 'RESTORING...' : 'RESTORE PURCHASES'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  coinBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFB800',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  coinBadgeText: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 13,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  removeAdsCard: {
    backgroundColor: '#161B2E',
    borderWidth: 2,
    borderColor: '#00F0FF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  removeAdsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  removeAdsTextCol: {
    flex: 1,
  },
  removeAdsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  removeAdsDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  ownedBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ownedBadgeText: {
    color: '#00FF88',
    fontWeight: '900',
    fontSize: 14,
  },
  buyBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  buyBtnText: {
    color: '#0A0C14',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  freeCoinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  freeCoinsTextCol: {
    flex: 1,
  },
  freeCoinsTitle: {
    color: '#FFB800',
    fontSize: 15,
    fontWeight: '900',
  },
  freeCoinsDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  watchAdBtn: {
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  watchAdBtnText: {
    color: '#0A0C14',
    fontWeight: '900',
    fontSize: 12,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
  },
  coinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  packCard: {
    width: '48%',
    backgroundColor: '#161B2E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  packCoinsText: {
    color: '#FFB800',
    fontSize: 16,
    fontWeight: '900',
  },
  packTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  packBuyBtn: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  packBuyBtnText: {
    color: '#00F0FF',
    fontWeight: '900',
    fontSize: 13,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  restoreBtnText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
