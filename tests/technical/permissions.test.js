import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzePermissions } from '../../src/technical/analyzer/PermissionAnalyzer.js';
import { DetectionStatus } from '../../src/technical/model/DetectionStatus.js';
import { ProtectionLevel } from '../../src/technical/model/ProtectionLevel.js';
import { sensitivePermissionsFixture } from './fixtures/sensitivePermissions.js';
import { noGoogleFixture } from './fixtures/noGoogle.js';

test('analyzePermissions distingue déclarée / accordée / refusée / inconnue', () => {
  const permissions = analyzePermissions(sensitivePermissionsFixture);
  assert.equal(permissions.length, 4);

  const camera = permissions.find((p) => p.androidName === 'android.permission.CAMERA');
  assert.equal(camera.declared, true);
  assert.equal(camera.granted, DetectionStatus.DETECTED);
  assert.equal(camera.protectionLevel, ProtectionLevel.DANGEROUS);
  assert.equal(camera.readableName, 'Caméra');

  const mic = permissions.find((p) => p.androidName === 'android.permission.RECORD_AUDIO');
  assert.equal(mic.granted, DetectionStatus.NOT_DETECTED);

  const contacts = permissions.find((p) => p.androidName === 'android.permission.READ_CONTACTS');
  assert.equal(contacts.granted, DetectionStatus.UNKNOWN, 'granted=null doit rester UNKNOWN, jamais NOT_DETECTED');
});

test('une permission personnalisée non résolue reste ProtectionLevel.UNKNOWN', () => {
  const permissions = analyzePermissions(sensitivePermissionsFixture);
  const custom = permissions.find((p) => p.androidName === 'org.example.permissions.permission.CUSTOM_ACCESS');
  assert.equal(custom.protectionLevel, ProtectionLevel.UNKNOWN);
});

test('une permission connue reçoit un nom lisible et une icône', () => {
  const permissions = analyzePermissions(noGoogleFixture);
  const internet = permissions.find((p) => p.androidName === 'android.permission.INTERNET');
  assert.equal(internet.readableName, 'Accès Internet');
  assert.equal(internet.icon, '🌐');
});

test('une permission inconnue du catalogue retombe sur un nom humanisé, sans planter', () => {
  const permissions = analyzePermissions({
    permissions: [{ name: 'com.example.permission.WEIRD_ONE', protectionLevel: 'normal', granted: true }],
  });
  assert.equal(permissions[0].readableName, 'weird one');
});
