import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeComposition } from '../../src/technical/analyzer/CompositionAnalyzer.js';
import { multiArchNativeLibsFixture } from './fixtures/multiArchNativeLibs.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';
import { componentsUnavailableFixture } from './fixtures/componentsUnavailable.js';

test('détecte DEX, bibliothèques natives, architectures et split APK', () => {
  const composition = analyzeComposition(multiArchNativeLibsFixture);
  assert.equal(composition.dataAvailable, true);
  assert.equal(composition.dexCount, 2);
  assert.equal(composition.nativeLibraryCount, 5);
  assert.deepEqual([...composition.architectures].sort(), ['arm64-v8a', 'armeabi-v7a', 'x86_64']);
  assert.equal(composition.isSplitApk, true);
  assert.equal(composition.splitCount, 2);
});

test('calcule le nombre de composants exportés à partir de componentCounts', () => {
  const composition = analyzeComposition(multiArchNativeLibsFixture);
  assert.equal(composition.activityCount, 5);
  assert.equal(composition.exportedComponentCount, 1);
});

test('composition absente => dataAvailable=false, tout reste null (jamais 0 inventé)', () => {
  const composition = analyzeComposition(componentsUnavailableFixture);
  assert.equal(composition.dataAvailable, false);
  assert.equal(composition.dexCount, null);
  assert.equal(composition.nativeLibraryCount, null);
  assert.equal(composition.exportedComponentCount, null);
  assert.deepEqual(composition.architectures, []);
});

test('une app sans bloc composition explicite (fixture historique) reste dataAvailable=false', () => {
  const composition = analyzeComposition(noGoogleFixture);
  assert.equal(composition.dataAvailable, false);
});
