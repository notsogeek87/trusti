import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerBackHandler, runBackHandler } from '../../src/utils/backHandlers.js';

test('le dernier écran enregistré prend le retour, puis le précédent après désinscription', () => {
  const calls = [];
  const removeParent = registerBackHandler(() => calls.push('parent'));
  const removeChild = registerBackHandler(() => calls.push('enfant'));

  assert.equal(runBackHandler(), true);
  removeChild();
  assert.equal(runBackHandler(), true);
  removeParent();
  assert.equal(runBackHandler(), false);
  assert.deepEqual(calls, ['enfant', 'parent']);
});

test('désinscrire deux fois ou dans le désordre ne retire que le bon gestionnaire', () => {
  const calls = [];
  const removeA = registerBackHandler(() => calls.push('a'));
  const removeB = registerBackHandler(() => calls.push('b'));
  removeA();
  removeA();
  runBackHandler();
  removeB();
  assert.deepEqual(calls, ['b']);
  assert.equal(runBackHandler(), false);
});
