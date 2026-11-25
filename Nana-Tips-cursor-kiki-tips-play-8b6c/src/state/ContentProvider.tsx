import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  articlesForCategory,
  categoryName as nameFor,
  categoryShortName as shortNameFor,
  featuredArticle,
  findArticle,
  findCategory,
  latestArticles,
  publishedArticles,
  relatedArticles,
  savedArticles,
  searchStories,
} from '@/data/repository';
import type { Article, Category } from '@/data/types';
import { fetchCatalog } from '@/data/wordpress';
import { readJson, storageKeys, writeJson } from '@/state/storage';

type Catalog = {
  articles: Article[];
  categories: Category[];
};

type ContentValue = {
  ready: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  articles: Article[];
  categories: Category[];
  featured: Article | undefined;
  latest: Article[];
  categoryBySlug: (slug: string) => Category | undefined;
  articlesIn: (slug: string) => Article[];
  articleById: (id: string) => Article | undefined;
  related: (article: Article) => Article[];
  search: (query: string) => Article[];
  saved: (ids: readonly string[]) => Article[];
  categoryName: (slug: string) => string;
  categoryShortName: (slug: string) => string;
};

const ContentContext = createContext<ContentValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const catalogRef = useRef<Catalog | null>(null);
  const lastFetch = useRef(0);

  const apply = useCallback((next: Catalog) => {
    catalogRef.current = next;
    setCatalog(next);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (catalogRef.current && now - lastFetch.current < 8000) return;
    lastFetch.current = now;
    setRefreshing(true);
    try {
      const next = await fetchCatalog();
      apply(next);
      await writeJson(storageKeys.catalog, next);
    } catch {
      if (!catalogRef.current) {
        setError('Kiki Tips could not reach yerase.com. Check your connection and try again.');
      }
    } finally {
      setRefreshing(false);
    }
  }, [apply]);

  useEffect(() => {
    let active = true;
    readJson<Catalog>(storageKeys.catalog).then((cached) => {
      if (!active || catalogRef.current || !cached?.articles || !cached.categories) return;
      apply(cached);
    });
    fetchCatalog()
      .then((next) => {
        if (!active) return;
        lastFetch.current = Date.now();
        apply(next);
        return writeJson(storageKeys.catalog, next);
      })
      .catch(() => {
        if (!active || catalogRef.current) return;
        setError('Kiki Tips could not reach yerase.com. Check your connection and try again.');
      });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        lastFetch.current = 0;
        void refresh();
      }
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [apply, refresh]);

  const articles = useMemo(() => publishedArticles(catalog?.articles ?? []), [catalog]);
  const categories = useMemo(() => catalog?.categories ?? [], [catalog]);

  const value = useMemo<ContentValue>(
    () => ({
      ready: catalog !== null,
      refreshing,
      error,
      refresh: async () => {
        lastFetch.current = 0;
        await refresh();
      },
      articles,
      categories,
      featured: featuredArticle(articles),
      latest: latestArticles(articles, 4),
      categoryBySlug: (slug) => findCategory(categories, slug),
      articlesIn: (slug) => articlesForCategory(articles, slug),
      articleById: (id) => findArticle(articles, id),
      related: (article) => relatedArticles(articles, article, 4),
      search: (query) => searchStories(articles, categories, query),
      saved: (ids) => savedArticles(articles, ids),
      categoryName: (slug) => nameFor(categories, slug),
      categoryShortName: (slug) => shortNameFor(categories, slug),
    }),
    [articles, catalog, categories, error, refresh, refreshing],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used within ContentProvider');
  return value;
}
