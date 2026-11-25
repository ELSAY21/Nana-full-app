import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

import { registerAlertDevice, removeAlertDevice } from '@/data/wordpress';
import type { StoryBrief } from '@/data/notices';
import { storyIdFromNotificationData } from '@/notifications/payload';

const channelId = 'stories';
let registeredToken: string | null = null;
let handlerReady = false;

type NotificationResponse = {
  notification: { request: { identifier?: string; content: { data?: unknown } } };
};

type NotificationApi = {
  getPermissionsAsync: () => Promise<{ granted?: boolean; status?: string }>;
  requestPermissionsAsync: () => Promise<{ granted?: boolean; status?: string }>;
  scheduleNotificationAsync: (request: {
    content: { title: string; body: string; data: { slug: string }; sound: 'default' };
    trigger: null | { channelId: string };
  }) => Promise<string>;
  setNotificationChannelAsync: (
    id: string,
    channel: { name: string; importance: number; sound: 'default' },
  ) => Promise<unknown>;
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
  addNotificationResponseReceivedListener: (listener: (response: NotificationResponse) => void) => { remove: () => void };
  getLastNotificationResponse: () => NotificationResponse | null;
  clearLastNotificationResponse: () => void;
  getExpoPushTokenAsync?: (options: { projectId: string }) => Promise<{ data: string }>;
};

let webOpen: ((slug: string) => void) | null = null;

/**
 * Import the local-notification pieces directly. The package entry also loads a
 * topic module that Expo Go on Android does not include, and that crash takes
 * the whole app down.
 */
async function loadNotifications(): Promise<NotificationApi | null> {
  try {
    const [handler, permissions, scheduler, emitter, channels] = await Promise.all([
      import('expo-notifications/build/NotificationsHandler'),
      import('expo-notifications/build/NotificationPermissions'),
      import('expo-notifications/build/scheduleNotificationAsync'),
      import('expo-notifications/build/NotificationsEmitter'),
      import('expo-notifications/build/setNotificationChannelAsync'),
    ]);
    const api: NotificationApi = {
      getPermissionsAsync: permissions.getPermissionsAsync,
      requestPermissionsAsync: permissions.requestPermissionsAsync,
      scheduleNotificationAsync: scheduler.scheduleNotificationAsync,
      setNotificationChannelAsync: channels.setNotificationChannelAsync,
      setNotificationHandler: handler.setNotificationHandler,
      addNotificationResponseReceivedListener: emitter.addNotificationResponseReceivedListener,
      getLastNotificationResponse: () => {
        try {
          return emitter.getLastNotificationResponse();
        } catch {
          return null;
        }
      },
      clearLastNotificationResponse: () => {
        try {
          emitter.clearLastNotificationResponse();
        } catch {
          // Opening the story still works for this tap.
        }
      },
    };
    if (!handlerReady && Platform.OS !== 'web') {
      api.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerReady = true;
    }
    return api;
  } catch {
    return null;
  }
}

type WebNotificationApi = {
  permission: string;
  requestPermission: () => Promise<string>;
};

function webNotificationApi(): WebNotificationApi | null {
  const candidate = (globalThis as { Notification?: WebNotificationApi }).Notification;
  return candidate ?? null;
}

function granted(status: { granted?: boolean; status?: string } | undefined): boolean {
  return Boolean(status?.granted || status?.status === 'granted');
}

async function ensureAndroidChannel(api: NotificationApi): Promise<void> {
  if (Platform.OS !== 'android') return;
  await api.setNotificationChannelAsync(channelId, {
    name: 'New stories',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function notificationPermissionState(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    const permission = webNotificationApi()?.permission;
    if (permission === 'granted' || permission === 'denied') return permission;
    return 'undetermined';
  }
  const api = await loadNotifications();
  if (!api) return 'undetermined';
  try {
    const status = await api.getPermissionsAsync();
    if (granted(status)) return 'granted';
    if (status?.status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

export async function notificationPermissionGranted(): Promise<boolean> {
  return (await notificationPermissionState()) === 'granted';
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const web = webNotificationApi();
    if (!web) return false;
    if (web.permission === 'granted') return true;
    if (web.permission === 'denied') return false;
    return (await web.requestPermission()) === 'granted';
  }
  const api = await loadNotifications();
  if (!api) return false;
  await ensureAndroidChannel(api);
  if (granted(await api.getPermissionsAsync())) return true;
  return granted(await api.requestPermissionsAsync());
}

export async function presentStoryNotification(story: StoryBrief): Promise<void> {
  const title = 'New story on Kiki Tips';
  if (Platform.OS === 'web') {
    if (!(await notificationPermissionGranted())) return;
    const Ctor = (globalThis as { Notification?: new (title: string, options?: { body?: string }) => unknown }).Notification;
    if (!Ctor) return;
    const note = new Ctor(title, { body: story.title }) as { onclick: (() => void) | null };
    note.onclick = () => webOpen?.(story.id);
    return;
  }
  const api = await loadNotifications();
  if (!api || !granted(await api.getPermissionsAsync())) return;
  await ensureAndroidChannel(api);
  await api.scheduleNotificationAsync({
    content: {
      title,
      body: story.title,
      data: { slug: story.id },
      sound: 'default',
    },
    trigger: Platform.OS === 'android' ? { channelId } : null,
  });
}

export function listenForNotificationOpens(onSlug: (slug: string) => void): () => void {
  if (Platform.OS === 'web') {
    webOpen = onSlug;
    return () => {
      if (webOpen === onSlug) webOpen = null;
    };
  }
  let removed = false;
  let subscription: { remove: () => void } | null = null;
  const opened = new Set<string>();
  const deliver = (response: NotificationResponse | null, api: NotificationApi) => {
    const slug = storyIdFromNotificationData(response?.notification.request.content.data);
    if (!slug) return;
    const key = response?.notification.request.identifier || slug;
    if (opened.has(key)) return;
    opened.add(key);
    api.clearLastNotificationResponse();
    onSlug(slug);
  };
  loadNotifications()
    .then((api) => {
      if (removed || !api) return;
      subscription = api.addNotificationResponseReceivedListener((response) => deliver(response, api));
      deliver(api.getLastNotificationResponse(), api);
    })
    .catch(() => {});
  return () => {
    removed = true;
    subscription?.remove();
  };
}

function projectId(): string | null {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

export async function registerPushDevice(): Promise<boolean> {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  const id = projectId();
  if (!id) return false;
  try {
    const push = await import('expo-notifications/build/getExpoPushTokenAsync');
    const token = (await push.getExpoPushTokenAsync({ projectId: id })).data;
    if (!token) return false;
    const ok = await registerAlertDevice(token, Platform.OS);
    registeredToken = ok ? token : null;
    return ok;
  } catch {
    return false;
  }
}

export async function unregisterPushDevice(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await removeAlertDevice(token);
  } catch {
    // Alerts stop on this phone even if the site cannot be reached.
  }
}
