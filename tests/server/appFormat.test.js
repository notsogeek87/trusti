import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPackageId,
  buildPlayStoreUrl,
  escapeLike,
  calculateAppType,
  formatAppFromDB,
} from '../../server/database/postgres/app-format.js';

test('extractPackageId lit une URL Play Store ou un package saisi à la main', () => {
  assert.equal(extractPackageId('https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms&hl=fr'), 'org.thoughtcrime.securesms');
  assert.equal(extractPackageId('  com.whatsapp '), 'com.whatsapp');
  assert.equal(extractPackageId('pas un package'), null);
  assert.equal(extractPackageId(null), null);
  assert.equal(buildPlayStoreUrl('com.whatsapp'), 'https://play.google.com/store/apps/details?id=com.whatsapp');
  assert.equal(buildPlayStoreUrl(''), null);
});

test('escapeLike neutralise les jokers LIKE', () => {
  assert.equal(escapeLike('100%_sûr\\'), '100\\%\\_sûr\\\\');
});

test('calculateAppType déduit le type du TrustiScore', () => {
  assert.equal(calculateAppType('B'), 'trusti');
  assert.equal(calculateAppType('E'), 'star');
  assert.equal(calculateAppType(undefined), 'regular');
});

test('formatAppFromDB : colonnes SQL vers objet API', () => {
  const app = formatAppFromDB({
    id: 'signal',
    name: 'Signal',
    trusti_score: 'A',
    grade: 'A',
    play_store_url: 'org.thoughtcrime.securesms',
    permissions: '["CAMERA"]',
    privacy_features: '{"e2e":true}',
    show_in_awards: 1,
    show_in_onboarding: 0,
    popularity: null,
  }, { alternativeAppIds: ['x'], replacesAppIds: ['whatsapp'] });

  assert.equal(app.appType, 'trusti');
  assert.equal(app.playStoreUrl, 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms');
  assert.deepEqual(app.permissions, ['CAMERA']);
  assert.deepEqual(app.privacyFeatures, { e2e: true });
  assert.equal(app.showInAwards, true);
  assert.equal(app.showInOnboarding, false);
  assert.equal(app.popularity, 9999);
  assert.deepEqual(app.replacesAppIds, ['whatsapp']);
});

test("formatAppFromDB : sans relations ni permissions, valeurs vides", () => {
  const app = formatAppFromDB({ id: '1', name: 'X', trusti_score: 'D', app_type: 'regular' });
  assert.equal(app.appType, 'regular');
  assert.deepEqual(app.permissions, []);
  assert.deepEqual(app.alternativeAppIds, []);
  assert.equal(app.playStoreUrl, undefined);
});
