import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { storyIdFromNotificationData } from './payload';

describe('storyIdFromNotificationData', () => {
  it('reads the story slug from a notification tap', () => {
    assert.equal(storyIdFromNotificationData({ slug: 'new-story' }), 'new-story');
    assert.equal(storyIdFromNotificationData('{"slug":"new-story"}'), 'new-story');
  });

  it('ignores a notification that has no story', () => {
    assert.equal(storyIdFromNotificationData({}), null);
    assert.equal(storyIdFromNotificationData(null), null);
    assert.equal(storyIdFromNotificationData('not-json'), null);
  });
});
