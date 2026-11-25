import { Linking, Platform } from 'react-native';

import { openableUrl, playStorePackage } from '@/data/links';

export async function openExternalLink(raw: string): Promise<void> {
  const url = openableUrl(raw);
  if (!url) return;

  const packageId = playStorePackage(url);
  if (packageId && Platform.OS === 'android') {
    try {
      await Linking.openURL(`market://details?id=${encodeURIComponent(packageId)}`);
      return;
    } catch {
      // The Play Store app is not available. The web address still opens.
    }
  }

  await Linking.openURL(url);
}
