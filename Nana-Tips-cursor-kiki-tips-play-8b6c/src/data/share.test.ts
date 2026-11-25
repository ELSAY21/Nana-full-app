import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { storyLink } from './share';

describe('storyLink', () => {
  it('uses the live WordPress permalink', () => {
    assert.equal(storyLink('ai-tools-worth-knowing'), 'https://yerase.com/ai-tools-worth-knowing/');
  });
});
