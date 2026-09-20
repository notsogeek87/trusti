import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSdks } from '../../src/technical/analyzer/SdkAnalyzer.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';
import { multipleSdksFixture } from './fixtures/multipleSdks.js';
import { withFirebaseFixture } from './fixtures/withFirebase.js';

test('aucun SDK connu détecté sur une app minimale', () => {
  assert.deepEqual(analyzeSdks(noGoogleFixture), []);
});

test('détecte Sentry, Unity et RevenueCat', () => {
  const sdks = analyzeSdks(multipleSdksFixture);
  const ids = sdks.map((s) => s.id);
  assert.ok(ids.includes('sentry'));
  assert.ok(ids.includes('unity_engine'));
  assert.ok(ids.includes('revenuecat'));
});

test('le SDK détecté "Sentry" affiche bien son vendeur', () => {
  const sdks = analyzeSdks(multipleSdksFixture);
  const sentry = sdks.find((s) => s.id === 'sentry');
  assert.equal(sentry.vendor, 'Sentry');
});

test('SDK est un superset : une app Firebase y retrouve ses dépendances Google', () => {
  const sdks = analyzeSdks(withFirebaseFixture);
  const ids = sdks.map((s) => s.id);
  assert.ok(ids.includes('firebase_cloud_messaging'));
  assert.ok(ids.includes('google_play_services'));
});
