import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { toggleId } from '@/data/queries';
import { readJson, storageKeys, writeJson } from '@/state/storage';

type BookmarksContextValue = {
  ids: string[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    readJson<unknown>(storageKeys.bookmarks).then((stored) => {
      if (!active) return;
      setIds(sanitizeIds(stored));
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = toggleId(current, id);
      void writeJson(storageKeys.bookmarks, next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, ready, isSaved, toggle }), [ids, ready, isSaved, toggle]);

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks(): BookmarksContextValue {
  const value = useContext(BookmarksContext);
  if (!value) {
    throw new Error('useBookmarks must be used within BookmarksProvider');
  }
  return value;
}
