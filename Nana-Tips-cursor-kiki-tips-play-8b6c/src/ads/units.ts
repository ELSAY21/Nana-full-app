const samplePublisher = 'ca-app-pub-3940256099942544';

export const testAndroidBanner = `${samplePublisher}/6300978111`;
export const testIosBanner = `${samplePublisher}/2934735716`;

export function isRealAdUnit(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^ca-app-pub-\d+\/\d+$/.test(value) && !value.startsWith(`${samplePublisher}/`);
}

export function configuredBanner(extra: unknown, platform: 'android' | 'ios'): string | null {
  if (!extra || typeof extra !== 'object') return null;
  const admob = (extra as { admob?: { androidBanner?: unknown; iosBanner?: unknown } }).admob;
  const value = platform === 'ios' ? admob?.iosBanner : admob?.androidBanner;
  return typeof value === 'string' ? value : null;
}

/**
 * A real banner unit in app.json is used as-is. Android is set to the Kiki Tips
 * AdMob app. An empty unit still falls back to Google's test banner so a build
 * cannot request live ads by accident.
 */
export function bannerUnitId(platform: string, configured: string | null | undefined): string | null {
  if (platform !== 'android' && platform !== 'ios') return null;
  if (isRealAdUnit(configured)) return configured;
  return platform === 'ios' ? testIosBanner : testAndroidBanner;
}
