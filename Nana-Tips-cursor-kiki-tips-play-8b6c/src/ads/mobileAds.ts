import { Platform, TurboModuleRegistry } from 'react-native';
import Constants from 'expo-constants';

type AdsModule = typeof import('react-native-google-mobile-ads');

export type AdsReadiness = {
  canRequest: boolean;
  privacyOptions: boolean;
};

let loading: Promise<AdsModule | null> | null = null;

function adsNativeModulePresent(): boolean {
  if (Platform.OS === 'web') return false;
  // Importing this package calls TurboModuleRegistry.getEnforcing. Expo Go does
  // not include the native module, and that call closes the app even inside
  // try/catch, so the import must not run there at all.
  const inExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';
  if (inExpoGo) return false;
  try {
    return TurboModuleRegistry.get('RNGoogleMobileAdsModule') != null;
  } catch {
    return false;
  }
}

export function loadAdsModule(): Promise<AdsModule | null> {
  if (!adsNativeModulePresent()) return Promise.resolve(null);
  loading ??= import('react-native-google-mobile-ads').then(
    (mod) => mod,
    () => null,
  );
  return loading;
}

/**
 * Ask for ad consent, then start the Google Mobile Ads SDK.
 * Measurement stays delayed until this runs. Expo Go has no ads native module,
 * so a failed load leaves ads off and the rest of the app keeps working.
 */
export async function prepareAds(): Promise<AdsReadiness> {
  const idle: AdsReadiness = { canRequest: false, privacyOptions: false };
  try {
    const ads = await loadAdsModule();
    if (!ads) return idle;
    await ads.MobileAds().setRequestConfiguration({
      maxAdContentRating: ads.MaxAdContentRating.T,
      ageRestrictedTreatment: ads.AgeRestrictedTreatment.UNSPECIFIED,
    });
    const info = await ads.AdsConsent.gatherConsent();
    const privacyOptions =
      info.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    if (!info.canRequestAds) return { canRequest: false, privacyOptions };
    await ads.MobileAds().initialize();
    return { canRequest: true, privacyOptions };
  } catch {
    return idle;
  }
}

export async function openAdPrivacyOptions(): Promise<void> {
  const ads = await loadAdsModule();
  if (!ads) return;
  await ads.AdsConsent.showPrivacyOptionsForm();
}
