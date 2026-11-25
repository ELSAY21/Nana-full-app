import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Constants from 'expo-constants';

import { bannerUnitId, configuredBanner } from '@/ads/units';
import { loadAdsModule } from '@/ads/mobileAds';
import { AppText } from '@/components/AppText';
import { useAds } from '@/state/AdsProvider';

type AdsModule = Awaited<ReturnType<typeof loadAdsModule>>;

type Props = {
  /** Parent already insets the content by this many pixels on each side. */
  parentInset?: number;
};

export function StoryAd({ parentInset }: Props = {}) {
  const { canRequest } = useAds();
  const { width } = useWindowDimensions();
  const [mod, setMod] = useState<AdsModule>(null);
  const [failed, setFailed] = useState(false);
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const unitId = bannerUnitId(Platform.OS, configuredBanner(Constants.expoConfig?.extra, platform));
  const edge = parentInset ?? 16;
  const available = Math.max(0, Math.floor(width - edge * 2));
  const bannerWidth = Math.min(available, 560);
  const flush = parentInset != null;

  useEffect(() => {
    if (!canRequest || !unitId) return;
    let active = true;
    loadAdsModule().then((loaded) => {
      if (active) setMod(loaded);
    });
    return () => {
      active = false;
    };
  }, [canRequest, unitId]);

  if (!canRequest || !unitId || !mod || failed || bannerWidth < 1) return null;
  const Banner = mod.BannerAd;

  return (
    <View style={[styles.wrap, flush && styles.flush]}>
      <AppText variant="meta" tone="muted" style={styles.label}>
        Advertisement
      </AppText>
      <Banner
        unitId={unitId}
        size={mod.BannerAdSize.INLINE_ADAPTIVE_BANNER}
        width={bannerWidth}
        maxHeight={100}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    alignItems: 'center',
    gap: 4,
  },
  flush: {
    marginHorizontal: 0,
    marginTop: 6,
    marginBottom: 2,
  },
  label: {
    alignSelf: 'flex-start',
  },
});
