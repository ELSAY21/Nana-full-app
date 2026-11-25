import { Alert, Platform, Share } from 'react-native';

import { storyLink } from '@/data/share';

function isAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError';
}

async function copyText(value: string): Promise<void> {
  const writeText = globalThis.navigator?.clipboard?.writeText;
  if (!writeText) throw new Error('clipboard unavailable');
  await writeText.call(globalThis.navigator.clipboard, value);
}

export async function shareStory(title: string, id: string): Promise<void> {
  const url = storyLink(id);
  const message = `${title}\n${url}`;
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text: title, url });
        return;
      }
      await copyText(message);
      Alert.alert('Link copied', url);
      return;
    }
    await Share.share(Platform.OS === 'ios' ? { title, message: title, url } : { title, message });
  } catch (error) {
    if (isAbort(error)) return;
    try {
      await copyText(message);
      Alert.alert('Link copied', url);
    } catch {
      // The share sheet was unavailable and the link could not be copied.
    }
  }
}
