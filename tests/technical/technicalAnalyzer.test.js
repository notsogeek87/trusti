import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TechnicalAnalyzer } from '../../src/technical/analyzer/TechnicalAnalyzer.js';
import { toExportJSON } from '../../src/technical/model/TechnicalAnalysis.js';
import { ApplicationSource } from '../../src/technical/source/ApplicationSource.js';
import { normalizeRawPackageData } from '../../src/technical/source/RawPackageData.js';
import { withFirebaseFixture } from './fixtures/withFirebase.js';
import { multipleSdksFixture } from './fixtures/multipleSdks.js';

class FixtureSource extends ApplicationSource {
  constructor(rawData) {
    super();
    this.rawData = rawData;
  }
  get kind() {
    return 'installed';
  }
  async getRawData() {
    return normalizeRawPackageData(this.rawData);
  }
}

test('TechnicalAnalyzer.analyze() est indépendant de la source (ApplicationSource générique)', async () => {
  const analysis = await TechnicalAnalyzer.analyze(new FixtureSource(withFirebaseFixture));
  assert.equal(analysis.packageName, 'org.example.withfirebase');
  assert.equal(analysis.source, 'installed');
  assert.ok(analysis.googleDependencies.length > 0);
});

test('toExportJSON() ne contient que les données réellement détectées', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(multipleSdksFixture);
  const exported = toExportJSON(analysis);

  assert.equal(exported.packageName, 'org.example.sdks');
  assert.equal(exported.version, '1.2.0');
  assert.equal(exported.googleDependencies.length, 0);
  assert.ok(exported.sdk.length >= 3);
  assert.ok(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'UNKNOWN'].includes(exported.dependencyLevel));

  // Forme conforme à l'exemple de la spec : packageName, version, composition,
  // permissions, googleDependencies, sdk, trackers, security, dependencyLevel.
  for (const key of ['packageName', 'version', 'composition', 'permissions', 'googleDependencies', 'sdk', 'trackers', 'security', 'dependencyLevel']) {
    assert.ok(key in exported, `clé manquante dans l'export: ${key}`);
  }
});

test('chaque SDK exporté conserve sa provenance (metadata.method / source)', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(multipleSdksFixture);
  const exported = toExportJSON(analysis);
  const sentry = exported.sdk.find((s) => s.id === 'sentry');

  assert.ok(sentry, 'Sentry doit être présent dans l\'export');
  assert.equal(sentry.metadata.method, 'MANIFEST');
  assert.ok(sentry.metadata.source.includes('io.sentry'));
});

test('l\'analyse technique ne modifie/ne lit jamais le module Trusti-Score éditorial', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const path = await import('node:path');
  const root = path.join(import.meta.dirname, '../../src/technical');

  const forbidden = ['trustiScore', 'models/Application', 'constants/grades'];
  const offenders = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith('.js')) {
        const content = readFileSync(full, 'utf-8');
        for (const term of forbidden) {
          if (content.includes(term)) offenders.push(`${full} référence "${term}"`);
        }
      }
    }
  };
  walk(root);

  assert.deepEqual(offenders, [], 'src/technical/ ne doit jamais référencer le Trusti-Score communautaire/éditorial');
});
