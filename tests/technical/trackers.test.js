import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTrackers } from '../../src/technical/analyzer/TrackerAnalyzer.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';
import { multipleTrackersFixture } from './fixtures/multipleTrackers.js';

test('aucun tracker détecté sur une app minimale', () => {
  assert.deepEqual(analyzeTrackers(noGoogleFixture), []);
});

test('détecte plusieurs trackers connus (Meta, AppsFlyer, Adjust, OneSignal)', () => {
  const trackers = analyzeTrackers(multipleTrackersFixture);
  const ids = trackers.map((t) => t.id);

  assert.ok(ids.includes('meta_sdk'));
  assert.ok(ids.includes('appsflyer'));
  assert.ok(ids.includes('adjust'));
  assert.ok(ids.includes('onesignal'));
  assert.equal(trackers.length, 4, `exactement 4 trackers attendus, reçu: ${ids.join(', ')}`);
});

test('chaque tracker détecté porte une trackerCategory non nulle', () => {
  const trackers = analyzeTrackers(multipleTrackersFixture);
  for (const tracker of trackers) {
    assert.ok(tracker.trackerCategory, `${tracker.id} devrait avoir une trackerCategory`);
  }
});
