import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  addNotices,
  markNoticesRead,
  takeFreshStories,
  unreadCount,
  type SeenStories,
  type StoryNotice,
} from '@/data/notices';
import { fetchRecentStories } from '@/data/wordpress';
import {
  ensureNotificationPermission,
  notificationPermissionState,
  presentStoryNotification,
  registerPushDevice,
  unregisterPushDevice,
} from '@/notifications/delivery';
import { readJson, storageKeys, writeJson } from '@/state/storage';
import { useContent } from '@/state/ContentProvider';

export type NotificationPrefs = {
  enabled: boolean;
  newPosts: boolean;
};

type NotificationsContextValue = {
  prefs: NotificationPrefs;
  ready: boolean;
  notices: StoryNotice[];
  unread: number;
  allowed: boolean | null;
  update: (patch: Partial<NotificationPrefs>) => void;
  setAlerts: (on: boolean) => void;
  markRead: () => void;
};

const defaultPrefs: NotificationPrefs = {
  enabled: true,
  newPosts: true,
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function sanitizePrefs(value: unknown): NotificationPrefs {
  if (!value || typeof value !== 'object') return defaultPrefs;
  const record = value as Partial<NotificationPrefs>;
  return {
    enabled: record.enabled !== false,
    newPosts: record.newPosts !== false,
  };
}

function sanitizeSeen(value: unknown): SeenStories {
  if (!value || typeof value !== 'object') return { primed: false, ids: [] };
  const record = value as Partial<SeenStories>;
  const ids = Array.isArray(record.ids) ? record.ids.filter((item): item is string => typeof item === 'string') : [];
  return { primed: Boolean(record.primed), ids };
}

function sanitizeNotices(value: unknown): StoryNotice[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Partial<StoryNotice>;
    if (typeof record.id !== 'string' || typeof record.title !== 'string') return [];
    return [
      {
        id: record.id,
        title: record.title,
        excerpt: typeof record.excerpt === 'string' ? record.excerpt : '',
        publishedAt: typeof record.publishedAt === 'string' ? record.publishedAt : '',
        read: Boolean(record.read),
      },
    ];
  });
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { refresh } = useContent();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [notices, setNotices] = useState<StoryNotice[]>([]);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const prefsRef = useRef(prefs);
  const seenRef = useRef<SeenStories>({ primed: false, ids: [] });
  const noticesRef = useRef<StoryNotice[]>([]);
  const pushReady = useRef(false);
  const promptedRef = useRef(false);
  const forceAskRef = useRef(false);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const applyStories = useCallback((incoming: Awaited<ReturnType<typeof fetchRecentStories>>) => {
    const alerting = prefsRef.current.enabled && prefsRef.current.newPosts;
    const result = takeFreshStories(seenRef.current, incoming, alerting);
    if (!result.changed) return false;
    seenRef.current = result.seen;
    void writeJson(storageKeys.seenStories, result.seen);
    if (result.alerts.length === 0) return false;
    const next = addNotices(noticesRef.current, result.alerts);
    noticesRef.current = next;
    setNotices(next);
    void writeJson(storageKeys.notices, next);
    if (!pushReady.current) {
      for (const story of result.alerts) {
        void presentStoryNotification(story);
      }
    }
    return true;
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      readJson<unknown>(storageKeys.notifications),
      readJson<unknown>(storageKeys.seenStories),
      readJson<unknown>(storageKeys.notices),
      readJson<unknown>(storageKeys.notificationPrompted),
    ]).then(([storedPrefs, storedSeen, storedNotices, storedPrompted]) => {
      if (!active) return;
      const nextPrefs = sanitizePrefs(storedPrefs);
      const nextSeen = sanitizeSeen(storedSeen);
      const nextNotices = sanitizeNotices(storedNotices);
      prefsRef.current = nextPrefs;
      seenRef.current = nextSeen;
      noticesRef.current = nextNotices;
      promptedRef.current = storedPrompted === true;
      setPrefs(nextPrefs);
      setNotices(nextNotices);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !prefs.enabled || !prefs.newPosts) return;
    let active = true;
    const check = () => {
      fetchRecentStories()
        .then((stories) => {
          if (!active) return;
          if (applyStories(stories)) void refresh();
        })
        .catch(() => {});
    };
    check();
    const timer = setInterval(check, 30000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [applyStories, prefs.enabled, prefs.newPosts, ready, refresh]);

  useEffect(() => {
    if (!ready) return;
    if (!prefs.enabled || !prefs.newPosts) {
      pushReady.current = false;
      void unregisterPushDevice();
      return;
    }
    let active = true;
    const force = forceAskRef.current;
    forceAskRef.current = false;
    const ask = async () => {
      let state = await notificationPermissionState();
      if (!active) return;
      if (state !== 'granted' && !(promptedRef.current && !force)) {
        if (!force) await new Promise((resolve) => setTimeout(resolve, 450));
        if (!active) return;
        await ensureNotificationPermission();
        if (!active) return;
        state = await notificationPermissionState();
      }
      if (state !== 'undetermined') {
        promptedRef.current = true;
        void writeJson(storageKeys.notificationPrompted, true);
      }
      if (!active) return;
      const ok = state === 'granted';
      setAllowed(state === 'undetermined' ? null : ok);
      if (!ok) {
        pushReady.current = false;
        return;
      }
      const registered = await registerPushDevice();
      if (!active) {
        await unregisterPushDevice();
        return;
      }
      pushReady.current = registered;
    };
    ask().catch(() => {
      if (active) setAllowed(false);
    });
    return () => {
      active = false;
    };
  }, [prefs.enabled, prefs.newPosts, ready]);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      prefsRef.current = next;
      void writeJson(storageKeys.notifications, next);
      return next;
    });
  }, []);

  const setAlerts = useCallback((on: boolean) => {
    if (on) forceAskRef.current = true;
    update({ enabled: on, newPosts: on });
  }, [update]);

  const markRead = useCallback(() => {
    const next = markNoticesRead(noticesRef.current);
    noticesRef.current = next;
    setNotices(next);
    void writeJson(storageKeys.notices, next);
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      prefs,
      ready,
      notices,
      unread: unreadCount(notices),
      allowed,
      update,
      setAlerts,
      markRead,
    }),
    [allowed, markRead, notices, prefs, ready, setAlerts, update],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error('useNotifications must be used within NotificationsProvider');
  return value;
}
