import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// localStorage minimal pour exécuter les utilitaires hors navigateur
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { buildExportData, importExportData, parseDailyAppIds } = await import('../../src/utils/dataExportImport.js');

beforeEach(() => store.clear());

test('export : contient les apps du quotidien, ids en chaînes', () => {
  const out = buildExportData({ dailyApps: [{ id: 12, name: 'Signal' }, { id: '7' }] });
  assert.equal(out.format, 'trusti-local-export');
  assert.deepEqual(out.data.dailyApps, [{ id: '12', name: 'Signal' }, { id: '7' }]);
});

test('export sans apps du quotidien : liste vide', () => {
  assert.deepEqual(buildExportData().data.dailyApps, []);
});

test('aller-retour export -> import', () => {
  const exported = JSON.parse(JSON.stringify(buildExportData({ dailyApps: [{ id: 3 }, { id: 4 }] })));
  assert.deepEqual(importExportData(exported).dailyAppIds, ['3', '4']);
});

test('import : ignore entrées invalides et doublons', () => {
  const ids = parseDailyAppIds({
    data: { dailyApps: [{ id: 1 }, { id: '1' }, 2, null, {}, { id: '<script>' }, { id: { a: 1 } }, 'x y'] },
  });
  assert.deepEqual(ids, ['1', '2']);
});

test('import : plafonne la taille de la liste', () => {
  const dailyApps = Array.from({ length: 5000 }, (_, i) => ({ id: i }));
  assert.equal(parseDailyAppIds({ data: { dailyApps } }).length, 2000);
});

test('import : ancien export sans dailyApps toujours accepté', () => {
  const res = importExportData({ format: 'trusti-local-export', version: 1, data: { notes: {} } });
  assert.deepEqual(res, { notesImported: 0, dailyAppIds: [] });
});

test('import : fichier étranger rejeté', () => {
  assert.throws(() => importExportData({ format: 'autre' }), /Fichier invalide/);
});
