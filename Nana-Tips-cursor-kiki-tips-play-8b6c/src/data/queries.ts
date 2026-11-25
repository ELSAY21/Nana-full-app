import type { Article, Category } from '@/data/types';

export const HOME_PAGE_SIZE = 20;

export function homeFeed(articles: readonly Article[], shown: number): {
  featured: Article | undefined;
  latest: Article[];
  hasMore: boolean;
} {
  const ordered = sortByDate(articles);
  const visible = ordered.slice(0, Math.max(0, shown));
  const [featured, ...latest] = visible;
  return {
    featured,
    latest,
    hasMore: ordered.length > visible.length,
  };
}

export function sortByDate(articles: readonly Article[]): Article[] {
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function articlesInCategory(articles: readonly Article[], slug: string): Article[] {
  return articles.filter((article) => article.categorySlugs.includes(slug));
}

export function searchArticles(
  articles: readonly Article[],
  categories: readonly Category[],
  query: string,
): Article[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  return sortByDate(
    articles.filter((article) => {
      const category = bySlug.get(article.categorySlug);
      const haystack = [
        article.title,
        article.excerpt,
        article.body.join(' '),
        category?.name ?? '',
        category?.shortName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    }),
  );
}

export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [id, ...ids];
}

function mix(seed: string, id: string): number {
  let value = 0;
  const text = `${seed}:${id}`;
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 33 + text.charCodeAt(index)) >>> 0;
  }
  return value;
}

/** Four other stories, stable for this post and different from one post to the next. */
export function randomArticles(articles: readonly Article[], excludeId: string, limit = 4): Article[] {
  return articles
    .filter((article) => article.id !== excludeId)
    .sort((a, b) => mix(excludeId, a.id) - mix(excludeId, b.id))
    .slice(0, limit);
}

export function orderByIds(articles: readonly Article[], ids: readonly string[]): Article[] {
  const byId = new Map(articles.map((article) => [article.id, article]));
  return ids.flatMap((id) => {
    const article = byId.get(id);
    return article ? [article] : [];
  });
}
