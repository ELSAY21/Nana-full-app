import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addNotices, takeFreshStories, unreadCount, type StoryBrief } from './notices';

const older: StoryBrief = {
  id: 'older-story',
  title: 'Older story',
  excerpt: 'Already on the site.',
  publishedAt: '2026-10-20',
};

const newer: StoryBrief = {
  id: 'new-story',
  title: 'A brand new story',
  excerpt: 'Just published.',
  publishedAt: '2026-10-25',
};

describe('takeFreshStories', () => {
  it('remembers the current stories and does not alert the first time', () => {
    const result = takeFreshStories({ primed: false, ids: [] }, [newer, older], true);
    assert.deepEqual(result.alerts, []);
    assert.equal(result.seen.primed, true);
    assert.deepEqual(result.seen.ids, ['new-story', 'older-story']);
  });

  it('alerts only for a story published after that first check', () => {
    const primed = takeFreshStories({ primed: false, ids: [] }, [older], true).seen;
    const result = takeFreshStories(primed, [newer, older], true);
    assert.deepEqual(result.alerts.map((story) => story.id), ['new-story']);
    assert.equal(result.seen.ids.includes('new-story'), true);
  });

  it('stays quiet while alerts are turned off', () => {
    const result = takeFreshStories({ primed: false, ids: [] }, [newer], false);
    assert.equal(result.changed, false);
    assert.deepEqual(result.alerts, []);
    assert.equal(result.seen.primed, false);
  });

  it('does not treat an empty check as the baseline', () => {
    const result = takeFreshStories({ primed: false, ids: [] }, [], true);
    assert.equal(result.seen.primed, false);
  });
});

describe('addNotices', () => {
  it('puts the new story at the front and counts it as unread', () => {
    const notices = addNotices([], [newer]);
    assert.equal(notices[0]?.title, 'A brand new story');
    assert.equal(unreadCount(notices), 1);
  });
});
