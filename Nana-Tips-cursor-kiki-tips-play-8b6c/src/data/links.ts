const namedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCharCode(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => namedEntities[name.toLowerCase()] ?? match);
}

const blockedScheme = /^(javascript|data|file|blob|vbscript):/i;

/**
 * A link from a story can point at a website, another app, or the Play Store.
 * Script and file addresses stay closed.
 */
export function openableUrl(raw: string, origin = 'https://yerase.com'): string | null {
  const href = decodeEntities(raw).trim();
  if (!href || blockedScheme.test(href)) return null;
  if (href.startsWith('//')) return `https:${href}`;
  if (href.startsWith('/')) return `${origin}${href}`;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  return null;
}

export function playStorePackage(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'play.google.com') return null;
    const id = parsed.searchParams.get('id');
    return id && /^[A-Za-z0-9._]+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
