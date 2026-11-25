export type StoryBrief = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export type SeenStories = {
  primed: boolean;
  ids: string[];
};

export type StoryNotice = StoryBrief & {
  read: boolean;
};

const maxSeen = 200;
const maxNotices = 30;

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

/**
 * The first successful check remembers stories already on the site and stays quiet.
 * Later checks alert only for stories that were not in that list.
 */
export function takeFreshStories(
  seen: SeenStories,
  incoming: readonly StoryBrief[],
  alerting: boolean,
): { seen: SeenStories; alerts: StoryBrief[]; changed: boolean } {
  if (!alerting) return { seen, alerts: [], changed: false };
  if (!seen.primed) {
    if (incoming.length === 0) return { seen, alerts: [], changed: false };
    return {
      seen: { primed: true, ids: unique(incoming.map((story) => story.id)).slice(0, maxSeen) },
      alerts: [],
      changed: true,
    };
  }
  const known = new Set(seen.ids);
  const alerts = incoming.filter((story) => story.id && !known.has(story.id)).slice().reverse();
  if (alerts.length === 0) return { seen, alerts: [], changed: false };
  return {
    seen: {
      primed: true,
      ids: unique([...alerts.map((story) => story.id), ...seen.ids]).slice(0, maxSeen),
    },
    alerts,
    changed: true,
  };
}

export function addNotices(current: readonly StoryNotice[], alerts: readonly StoryBrief[]): StoryNotice[] {
  const additions: StoryNotice[] = alerts.map((story) => ({ ...story, read: false }));
  const added = new Set(additions.map((item) => item.id));
  return [...additions, ...current.filter((item) => !added.has(item.id))].slice(0, maxNotices);
}

export function markNoticesRead(current: readonly StoryNotice[]): StoryNotice[] {
  return current.map((item) => (item.read ? item : { ...item, read: true }));
}

export function unreadCount(current: readonly StoryNotice[]): number {
  return current.filter((item) => !item.read).length;
}
