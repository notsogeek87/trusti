import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAppInfo } from '../../src/technical/analyzer/AppInfoAnalyzer.js';
import { withFirebaseFixture } from './fixtures/withFirebase.js';
import { componentsUnavailableFixture } from './fixtures/componentsUnavailable.js';

test('parse les informations générales d\'une app (taille, split APK, versions)', () => {
  const appInfo = analyzeAppInfo(withFirebaseFixture);
  assert.equal(appInfo.packageName, 'org.example.withfirebase');
  assert.equal(appInfo.versionName, '2.3.1');
  assert.equal(appInfo.versionCode, 42);
  assert.equal(appInfo.minSdkVersion, 24);
  assert.equal(appInfo.targetSdkVersion, 35);
  assert.equal(appInfo.isSystemApp, false);
  assert.equal(appInfo.splitApkPaths.length, 1);
});

test('les champs non disponibles restent null, jamais une valeur inventée', () => {
  const appInfo = analyzeAppInfo(componentsUnavailableFixture);
  assert.equal(appInfo.sizeBytes, null);
  assert.equal(appInfo.firstInstallTime, null);
  assert.equal(appInfo.installerPackageName, null);
});
