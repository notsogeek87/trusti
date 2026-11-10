import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const {
  saveMigrationGuideState, removeMigrationGuideState, getAllMigrationGuideStates,
} = await import('../../src/utils/migrationGuideStorage.js');

beforeEach(() => store.clear());

test("abandonner un parcours l'efface sans toucher aux autres, et peut être annulé", () => {
  saveMigrationGuideState('word', { altId: 'libreoffice', done: { install: true } });
  saveMigrationGuideState('chrome', { done: { install: true, data: true } });

  const previous = removeMigrationGuideState('word');
  assert.deepEqual(previous, { altId: 'libreoffice', done: { install: true } });
  assert.deepEqual(Object.keys(getAllMigrationGuideStates()), ['chrome']);

  saveMigrationGuideState('word', previous);
  assert.deepEqual(getAllMigrationGuideStates().word, { altId: 'libreoffice', done: { install: true } });
});

test("abandonner un parcours inconnu ne casse rien", () => {
  assert.deepEqual(removeMigrationGuideState('inconnue'), { altId: null, done: {} });
  assert.deepEqual(getAllMigrationGuideStates(), {});
});
