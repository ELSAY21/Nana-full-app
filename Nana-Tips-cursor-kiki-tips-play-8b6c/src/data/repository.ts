import { articlesInCategory, orderByIds, randomArticles, searchArticles, sortByDate } from '@/data/queries';
import type { Article, Category } from '@/data/types';

/**
 * Screens read the catalog loaded from https://yerase.com.
 * A newly published WordPress post arrives with the categories assigned on the site.
 */

export function publishedArticles(articles: readonly Article[]): Article[] {
  return sortByDate(articles);
}

export function findArticle(articles: readonly Article[], id: string): Article | undefined {
  return articles.find((article) => article.id === id);
}

export function findCategory(categories: readonly Category[], slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function articlesForCategory(articles: readonly Article[], slug: string): Article[] {
  return sortByDate(articlesInCategory(articles, slug));
}

export function featuredArticle(articles: readonly Article[]): Article | undefined {
  return publishedArticles(articles)[0];
}

export function latestArticles(articles: readonly Article[], limit = 4): Article[] {
  const [featured, ...rest] = publishedArticles(articles);
  if (!featured) return [];
  return rest.slice(0, limit);
}

export function relatedArticles(articles: readonly Article[], article: Article, limit = 4): Article[] {
  return randomArticles(articles, article.id, limit);
}

export function searchStories(articles: readonly Article[], categories: readonly Category[], query: string): Article[] {
  return searchArticles(articles, categories, query);
}

export function savedArticles(articles: readonly Article[], ids: readonly string[]): Article[] {
  return orderByIds(articles, ids);
}

export function categoryName(categories: readonly Category[], slug: string): string {
  return findCategory(categories, slug)?.name ?? 'Technology';
}

export function categoryShortName(categories: readonly Category[], slug: string): string {
  return findCategory(categories, slug)?.shortName ?? 'Tech';
}
