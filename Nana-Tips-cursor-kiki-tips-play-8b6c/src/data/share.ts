import { WORDPRESS_ORIGIN } from '@/data/wordpress';

export function storyLink(id: string): string {
  const slug = id.trim().replace(/^\/+|\/+$/g, '');
  return `${WORDPRESS_ORIGIN}/${encodeURIComponent(slug)}/`;
}
