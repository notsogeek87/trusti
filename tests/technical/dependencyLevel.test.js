import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDependencyLevel } from '../../src/technical/analyzer/DependencyLevelCalculator.js';
import { DependencyLevel } from '../../src/technical/model/DependencyLevel.js';
import { TechnicalAnalyzer } from '../../src/technical/analyzer/TechnicalAnalyzer.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';
import { withFirebaseFixture } from './fixtures/withFirebase.js';
import { multipleTrackersFixture } from './fixtures/multipleTrackers.js';
import { componentsUnavailableFixture } from './fixtures/componentsUnavailable.js';

test('score 0 => LOW quand rien n\'est détecté', () => {
  const { level, score } = calculateDependencyLevel({
    googleDependencies: [],
    trackers: [],
    sdks: [],
    componentsAvailable: true,
  });
  assert.equal(level, DependencyLevel.LOW);
  assert.equal(score, 0);
});

test('les trackers comptent double dans le score', () => {
  const { score, breakdown } = calculateDependencyLevel({
    googleDependencies: [],
    trackers: [{ id: 't1' }],
    sdks: [{ id: 't1' }],
    componentsAvailable: true,
  });
  // t1 est à la fois listé en tracker et en sdk (sdk = superset) : ne doit pas être compté deux fois côté "autres SDK".
  assert.equal(breakdown.otherSdks, 0);
  assert.equal(score, 2);
});

test('componentsAvailable=false => UNKNOWN, jamais une valeur inventée', () => {
  const { level, score } = calculateDependencyLevel({
    googleDependencies: [],
    trackers: [],
    sdks: [],
    componentsAvailable: false,
  });
  assert.equal(level, DependencyLevel.UNKNOWN);
  assert.equal(score, null);
});

test('bout en bout : app minimale => LOW', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(noGoogleFixture);
  assert.equal(analysis.dependencyLevel, DependencyLevel.LOW);
});

test('bout en bout : app avec Firebase => au moins MODERATE', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(withFirebaseFixture);
  assert.notEqual(analysis.dependencyLevel, DependencyLevel.LOW);
  assert.notEqual(analysis.dependencyLevel, DependencyLevel.UNKNOWN);
});

test('bout en bout : app avec 4 trackers => niveau élevé', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(multipleTrackersFixture);
  assert.ok(
    [DependencyLevel.HIGH, DependencyLevel.VERY_HIGH].includes(analysis.dependencyLevel),
    `attendu HIGH ou VERY_HIGH, reçu ${analysis.dependencyLevel}`
  );
});

test('bout en bout : composants indisponibles => dependencyLevel UNKNOWN et limitation signalée', () => {
  const analysis = TechnicalAnalyzer.analyzeRaw(componentsUnavailableFixture);
  assert.equal(analysis.dependencyLevel, DependencyLevel.UNKNOWN);
  assert.equal(analysis.componentsAvailable, false);
  assert.ok(analysis.limitations.some((msg) => msg.includes('composants')));
});
