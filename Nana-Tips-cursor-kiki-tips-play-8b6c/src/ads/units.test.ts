import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bannerUnitId, configuredBanner, isRealAdUnit, testAndroidBanner, testIosBanner } from './units';

describe('bannerUnitId', () => {
  it('keeps Google test ads until a real unit is configured', () => {
    assert.equal(bannerUnitId('android', ''), testAndroidBanner);
    assert.equal(bannerUnitId('ios', testIosBanner), testIosBanner);
    assert.equal(isRealAdUnit(testAndroidBanner), false);
  });

  it('uses a real banner unit on the matching platform', () => {
    const unit = 'ca-app-pub-1234567890123456/1234567890';
    assert.equal(bannerUnitId('android', unit), unit);
    assert.equal(bannerUnitId('web', unit), null);
  });

  it('reads the banner id from the app config', () => {
    const unit = 'ca-app-pub-1234567890123456/1234567890';
    assert.equal(configuredBanner({ admob: { androidBanner: unit } }, 'android'), unit);
    assert.equal(configuredBanner({}, 'ios'), null);
  });
});
