import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeGoogleDependencies } from '../../src/technical/analyzer/GoogleDependencyAnalyzer.js';
import { Confidence } from '../../src/technical/model/Confidence.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';
import { withFirebaseFixture } from './fixtures/withFirebase.js';

test('aucune dépendance Google détectée sur une app qui n\'en a pas', () => {
  const deps = analyzeGoogleDependencies(noGoogleFixture);
  assert.deepEqual(deps, []);
});

test('détecte Firebase Cloud Messaging et Google Play Services avec confiance forte', () => {
  const deps = analyzeGoogleDependencies(withFirebaseFixture);
  const ids = deps.map((d) => d.id);

  assert.ok(ids.includes('firebase_cloud_messaging'), 'FCM doit être détecté via le service manifeste');
  assert.ok(ids.includes('google_play_services'), 'GMS doit être détecté via la clé de méta-données');

  for (const dep of deps) {
    assert.equal(dep.confidence, Confidence.HIGH);
    assert.equal(dep.isGoogleProduct, true);
    assert.ok(dep.detectionMethod.length > 0);
  }
});
