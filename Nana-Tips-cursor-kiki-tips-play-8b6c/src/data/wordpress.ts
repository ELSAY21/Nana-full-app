import { openableUrl } from '@/data/links';
import type { StoryBrief } from '@/data/notices';
import type { Article, Category, IonName, StoryBlock, StoryImage, StorySpan } from '@/data/types';

export const WORDPRESS_ORIGIN = 'https://yerase.com';

const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

const categoryStyle: Record<string, { icon: IonName; shortName: string; tintLight: string; tintDark: string }> = {
  'artificial-intelligence': {
    icon: 'sparkles',
    shortName: 'AI',
    tintLight: '#D1FAE5',
    tintDark: '#14382C',
  },
  mobile: {
    icon: 'phone-portrait-outline',
    shortName: 'Mobile',
    tintLight: '#CCFBF1',
    tintDark: '#12352F',
  },
  cybersecurity: {
    icon: 'shield-checkmark-outline',
    shortName: 'Security',
    tintLight: '#D7FBEA',
    tintDark: '#102E2A',
  },
  'how-to': {
    icon: 'book-outline',
    shortName: 'How-to',
    tintLight: '#ECFDF5',
    tintDark: '#143028',
  },
};

const fallbackIcons: IonName[] = ['leaf-outline', 'grid-outline', 'newspaper-outline', 'bulb-outline'];
const fallbackTints = [
  { tintLight: '#D1FAE5', tintDark: '#14382C' },
  { tintLight: '#CCFBF1', tintDark: '#12352F' },
  { tintLight: '#DCFCE7', tintDark: '#163528' },
  { tintLight: '#E2F8EF', tintDark: '#14332C' },
];

const preferredOrder = ['artificial-intelligence', 'mobile', 'cybersecurity', 'how-to'];

export type WpCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
};

export type WpMediaSize = {
  source_url?: string;
  width?: number;
  height?: number;
};

export type WpMedia = {
  source_url?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, WpMediaSize>;
  };
};

export type WpTerm = { slug: string; name: string; taxonomy?: string };

export type WpPost = {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[];
    'wp:term'?: WpTerm[][];
  };
};

export function decodeHtml(html: string): string {
  const withoutTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const decoded = withoutTags
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCharCode(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => namedEntities[name.toLowerCase()] ?? match);
  return decoded.replace(/\s+/g, ' ').trim();
}

function inlineText(html: string): string {
  const withoutTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  return withoutTags
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCharCode(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => namedEntities[name.toLowerCase()] ?? match)
    .replace(/[ \t\f\v]+/g, ' ');
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, 'i').exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function elementSlice(html: string, start: number): string {
  const open = /^<(\w+)/.exec(html.slice(start));
  if (!open) return html.slice(start, start + 1);
  const tag = open[1];
  const marker = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'gi');
  marker.lastIndex = start;
  let depth = 0;
  let found: RegExpExecArray | null;
  while ((found = marker.exec(html))) {
    depth += found[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, found.index + found[0].length);
  }
  return html.slice(start);
}

function inlineSpans(html: string): StorySpan[] {
  const spans: StorySpan[] = [];
  const anchors = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let last = 0;
  let found: RegExpExecArray | null;
  while ((found = anchors.exec(html))) {
    const before = inlineText(html.slice(last, found.index));
    if (before) spans.push({ text: before });
    const href = openableUrl(attribute(found[1], 'href') ?? '');
    const text = inlineText(found[2]).replace(/\s+/g, ' ').trim();
    if (text) spans.push(href ? { text, href } : { text });
    last = found.index + found[0].length;
  }
  const after = inlineText(html.slice(last));
  if (after) spans.push({ text: after });
  if (!spans.length) return [];
  spans[0] = { ...spans[0], text: spans[0].text.replace(/^\s+/, '') };
  const end = spans.length - 1;
  spans[end] = { ...spans[end], text: spans[end].text.replace(/\s+$/, '') };
  return spans.filter((span) => span.text.length > 0);
}

function anchorsIn(html: string): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const anchors = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let found: RegExpExecArray | null;
  while ((found = anchors.exec(html))) {
    const href = openableUrl(attribute(found[1], 'href') ?? '');
    const text = inlineText(found[2]).replace(/\s+/g, ' ').trim();
    if (href && text) links.push({ text, href });
  }
  return links;
}

export function storyBlocksFromHtml(html: string): StoryBlock[] {
  const source = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const blocks: StoryBlock[] = [];
  const opener = /<(p|h[1-6]|li|blockquote|div)\b[^>]*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = opener.exec(source))) {
    if (match.index < cursor) {
      opener.lastIndex = cursor;
      continue;
    }
    const loose = inlineText(source.slice(cursor, match.index)).trim();
    if (loose) blocks.push({ kind: 'text', spans: [{ text: loose }] });

    const tag = match[1].toLowerCase();
    const start = match.index;
    if (tag === 'div') {
      const className = attribute(match[0], 'class') ?? '';
      const whole = elementSlice(source, start);
      if (/\bwp-block-buttons\b/.test(className) || /\bwp-block-button\b/.test(className)) {
        for (const link of anchorsIn(whole)) blocks.push({ kind: 'button', text: link.text, href: link.href });
      }
      cursor = start + Math.max(whole.length, 1);
      opener.lastIndex = cursor;
      continue;
    }

    const innerStart = start + match[0].length;
    const close = source.toLowerCase().indexOf(`</${tag}>`, innerStart);
    if (close === -1) break;
    const spans = inlineSpans(source.slice(innerStart, close));
    cursor = close + tag.length + 3;
    opener.lastIndex = cursor;
    const onlyLink = spans.length === 1 && spans[0].href ? spans[0] : null;
    if (onlyLink?.href && /^h[1-6]$/.test(tag)) {
      blocks.push({ kind: 'button', text: onlyLink.text, href: onlyLink.href });
    } else if (spans.length > 0) {
      blocks.push({ kind: 'text', spans });
    }
  }

  const tail = inlineText(source.slice(cursor)).trim();
  if (tail) blocks.push({ kind: 'text', spans: [{ text: tail }] });
  return blocks;
}

export function paragraphsFromBlocks(blocks: readonly StoryBlock[]): string[] {
  return blocks
    .map((block) => (block.kind === 'button' ? block.text : block.spans.map((span) => span.text).join('')))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function paragraphsFromHtml(html: string): string[] {
  return paragraphsFromBlocks(storyBlocksFromHtml(html));
}

function readMinutes(paragraphs: string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function positive(value: number | undefined): number | undefined {
  return value && value > 0 ? value : undefined;
}

/**
 * Use the original upload. WordPress thumbnails are center-cropped, so a card
 * that uses one hides part of a new post's photo.
 */
export function storyImage(media: WpMedia | undefined): StoryImage | null {
  const full = media?.media_details?.sizes?.full;
  const uri = full?.source_url || media?.source_url;
  if (!uri) return null;
  const width = positive(full?.width) ?? positive(media?.media_details?.width);
  const height = positive(full?.height) ?? positive(media?.media_details?.height);
  return { uri, width, height };
}

export function mapCatalog(wpCategories: readonly WpCategory[], wpPosts: readonly WpPost[]): {
  articles: Article[];
  categories: Category[];
} {
  const visible = wpCategories.filter((category) => category.slug !== 'uncategorized');
  const byId = new Map(visible.map((category) => [category.id, category.slug]));

  const categories = visible
    .map((category, index): Category => {
      const style = categoryStyle[category.slug];
      const tint = style ?? fallbackTints[index % fallbackTints.length];
      return {
        slug: category.slug,
        name: decodeHtml(category.name),
        shortName: style?.shortName ?? decodeHtml(category.name),
        description: decodeHtml(category.description) || 'Stories from Kiki Tips',
        icon: style?.icon ?? fallbackIcons[index % fallbackIcons.length],
        tintLight: tint.tintLight,
        tintDark: tint.tintDark,
      };
    })
    .sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.slug);
      const bIndex = preferredOrder.indexOf(b.slug);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const known = new Set(categories.map((category) => category.slug));

  const articles = wpPosts.map((post): Article => {
    const embedded = post._embedded?.['wp:term']?.flat() ?? [];
    const fromTerms = embedded
      .filter((term) => !term.taxonomy || term.taxonomy === 'category')
      .map((term) => term.slug)
      .filter((slug) => known.has(slug));
    const fromIds = post.categories.map((id) => byId.get(id)).filter((slug): slug is string => Boolean(slug));
    const categorySlugs = [...new Set(fromTerms.length > 0 ? fromTerms : fromIds)];
    const blocks = storyBlocksFromHtml(post.content.rendered);
    const body = paragraphsFromBlocks(blocks);
    return {
      id: post.slug,
      title: decodeHtml(post.title.rendered),
      excerpt: decodeHtml(post.excerpt.rendered),
      body,
      blocks,
      categorySlug: categorySlugs[0] ?? 'uncategorized',
      categorySlugs,
      publishedAt: post.date.slice(0, 10),
      readMinutes: readMinutes(body),
      image: storyImage(post._embedded?.['wp:featuredmedia']?.[0]),
    };
  });

  return { articles, categories };
}

async function fetchPage<T>(path: string, page: number): Promise<{ items: T[]; totalPages: number }> {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${WORDPRESS_ORIGIN}/wp-json/wp/v2/${path}${separator}per_page=100&page=${page}`);
  if (response.status === 400) return { items: [], totalPages: page - 1 };
  if (!response.ok) throw new Error(`WordPress returned ${response.status}`);
  const items = (await response.json()) as T[];
  const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? '1');
  return { items, totalPages: Number.isFinite(totalPages) ? totalPages : 1 };
}

async function fetchAll<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { items, totalPages } = await fetchPage<T>(path, page);
    all.push(...items);
    if (page >= totalPages || items.length === 0) break;
  }
  return all;
}

type WpBrief = {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
};

export function storyBriefs(posts: readonly WpBrief[]): StoryBrief[] {
  return posts
    .filter((post) => post.slug)
    .map((post) => ({
      id: post.slug,
      title: decodeHtml(post.title.rendered),
      excerpt: decodeHtml(post.excerpt.rendered),
      publishedAt: post.date.slice(0, 10),
    }));
}

export async function fetchRecentStories(limit = 10): Promise<StoryBrief[]> {
  const safeLimit = Math.min(20, Math.max(1, limit));
  const response = await fetch(`${WORDPRESS_ORIGIN}/wp-json/wp/v2/posts?per_page=${safeLimit}&orderby=date&order=desc`);
  if (!response.ok) throw new Error(`WordPress returned ${response.status}`);
  const posts = (await response.json()) as WpBrief[];
  return storyBriefs(posts);
}

export async function registerAlertDevice(token: string, platform: string): Promise<boolean> {
  const response = await fetch(`${WORDPRESS_ORIGIN}/wp-json/kiki-tips/v1/devices`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform }),
  });
  return response.ok;
}

export async function removeAlertDevice(token: string): Promise<void> {
  await fetch(`${WORDPRESS_ORIGIN}/wp-json/kiki-tips/v1/devices/remove`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export async function fetchCatalog(): Promise<{ articles: Article[]; categories: Category[] }> {
  const [wpCategories, wpPosts] = await Promise.all([
    fetchAll<WpCategory>('categories?hide_empty=false'),
    fetchAll<WpPost>('posts?_embed=1'),
  ]);
  return mapCatalog(wpCategories, wpPosts);
}
