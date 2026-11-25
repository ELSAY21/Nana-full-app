function asRecord(data: unknown): Record<string, unknown> | null {
  if (typeof data === 'string') {
    try {
      return asRecord(JSON.parse(data) as unknown);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as Record<string, unknown>;
}

export function storyIdFromNotificationData(data: unknown): string | null {
  const slug = asRecord(data)?.slug;
  if (typeof slug !== 'string') return null;
  const trimmed = slug.trim();
  return trimmed || null;
}
