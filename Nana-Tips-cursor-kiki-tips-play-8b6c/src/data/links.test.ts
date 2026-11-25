import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openableUrl, playStorePackage } from './links';

describe('openableUrl', () => {
  it('keeps websites, app schemes, and the Play Store', () => {
    assert.equal(openableUrl('https://nanaatips.com/story'), 'https://nanaatips.com/story');
    assert.equal(openableUrl('http://example.com'), 'http://example.com');
    assert.equal(
      openableUrl('https://play.google.com/store/apps/details?id=com.openai.chatgpt'),
      'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
    );
    assert.equal(openableUrl('market://details?id=com.openai.chatgpt'), 'market://details?id=com.openai.chatgpt');
    assert.equal(openableUrl('mailto:hello@nanaatips.com'), 'mailto:hello@nanaatips.com');
    assert.equal(openableUrl('/how-to/'), 'https://yerase.com/how-to/');
    assert.equal(openableUrl('//example.com/app'), 'https://example.com/app');
  });

  it('drops script and file addresses', () => {
    assert.equal(openableUrl('javascript:alert(1)'), null);
    assert.equal(openableUrl('data:text/html,hi'), null);
    assert.equal(openableUrl('file:///etc/passwd'), null);
    assert.equal(openableUrl('   '), null);
  });
});

describe('playStorePackage', () => {
  it('reads the app id from a Play Store link', () => {
    assert.equal(
      playStorePackage('https://play.google.com/store/apps/details?id=com.openai.chatgpt'),
      'com.openai.chatgpt',
    );
    assert.equal(playStorePackage('https://nanaatips.com'), null);
  });
});
