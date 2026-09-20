import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSecurity } from '../../src/technical/analyzer/SecurityAnalyzer.js';
import { DetectionStatus } from '../../src/technical/model/DetectionStatus.js';
import { cleartextExportedFixture } from './fixtures/cleartextExported.js';
import { componentsUnavailableFixture } from './fixtures/componentsUnavailable.js';

test('détecte debuggable, backup et cleartext HTTP', () => {
  const security = analyzeSecurity(cleartextExportedFixture);
  assert.equal(security.debuggable, DetectionStatus.DETECTED);
  assert.equal(security.allowBackup, DetectionStatus.DETECTED);
  assert.equal(security.usesCleartextTraffic, DetectionStatus.DETECTED);
});

test('calcule le nombre de composants exportés et récupère le certificat de signature', () => {
  const security = analyzeSecurity(cleartextExportedFixture);
  assert.equal(security.exportedComponentCount, 4);
  assert.deepEqual(security.signingCertificatesSha256, ['AB12CD34EF56']);
  assert.equal(security.hasMultipleSigners, DetectionStatus.NOT_DETECTED);
});

test('le schéma de signature APK, le Network Security Config et les certificats épinglés restent toujours UNKNOWN (limite documentée)', () => {
  const security = analyzeSecurity(cleartextExportedFixture);
  assert.equal(security.signatureScheme, DetectionStatus.UNKNOWN);
  assert.equal(security.networkSecurityConfigPresent, DetectionStatus.UNKNOWN);
  assert.equal(security.customPinnedCertificates, DetectionStatus.UNKNOWN);
});

test('bloc sécurité absent => tout reste UNKNOWN, jamais un faux "non détecté"', () => {
  const security = analyzeSecurity(componentsUnavailableFixture);
  assert.equal(security.dataAvailable, false);
  assert.equal(security.debuggable, DetectionStatus.UNKNOWN);
  assert.equal(security.allowBackup, DetectionStatus.UNKNOWN);
  assert.equal(security.usesCleartextTraffic, DetectionStatus.UNKNOWN);
  assert.equal(security.exportedComponentCount, null);
});

test('targetSdkVersion/minSdkVersion viennent de appInfo même si le bloc security est absent', () => {
  const security = analyzeSecurity({
    appInfo: { targetSdkVersion: 34, minSdkVersion: 24 },
    componentCounts: null,
    security: null,
  });
  assert.equal(security.targetSdkVersion, 34);
  assert.equal(security.minSdkVersion, 24);
});
