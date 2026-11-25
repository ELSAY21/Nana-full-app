import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  appearance: '@kiki-tips/appearance',
  bookmarks: '@kiki-tips/bookmarks',
  notifications: '@kiki-tips/notifications',
  seenStories: '@kiki-tips/seen-stories',
  notices: '@kiki-tips/notices',
  notificationPrompted: '@kiki-tips/notification-prompted',
  catalog: '@kiki-tips/catalog-v1',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory value for this session if device storage is unavailable.
  }
}
