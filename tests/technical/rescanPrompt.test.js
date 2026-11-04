import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};

const {
  packagesChanged, loadPackagesSnapshot, savePackagesSnapshot,
  isWebPromptDue, markRescanPromptHandled, WEB_PROMPT_INTERVAL_MS
} = await import('../../src/utils/rescanPrompt.js');

beforeEach(() => store.clear());

test('packagesChanged ignore l\'ordre et détecte ajout / retrait', () => {
  assert.equal(packagesChanged(['a', 'b'], ['b', 'a']), false);
  assert.equal(packagesChanged(['a'], ['a', 'b']), true);
  assert.equal(packagesChanged(['a', 'b'], ['a']), true);
  assert.equal(packagesChanged(['a', 'b'], ['a', 'c']), true);
});

test('snapshot : null tant que jamais enregistré, puis relu tel quel', () => {
  assert.equal(loadPackagesSnapshot(), null);
  savePackagesSnapshot(['b', 'a', 'a']);
  assert.deepEqual(loadPackagesSnapshot(), ['a', 'b']);
});

test('web : proposé une première fois, puis espacé', () => {
  const now = 1_000_000_000_000;
  assert.equal(isWebPromptDue(now), true);
  markRescanPromptHandled(now);
  assert.equal(isWebPromptDue(now + 1000), false);
  assert.equal(isWebPromptDue(now + WEB_PROMPT_INTERVAL_MS), true);
});
