import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDataTips, getMigrationCandidates, canStartMigration, computeProgress } from '../../src/utils/migrationGuide.js';
import { DEFAULT_DATA_TIPS } from '../../src/constants/migrationGuide.js';

test('les conseils suivent la catégorie, avec repli générique', () => {
  assert.ok(getDataTips('Gestionnaires de Mots de Passe').export[0].includes('CSV'));
  assert.ok(getDataTips('Email').import.length > 0);
  assert.deepEqual(getDataTips('Jeux'), DEFAULT_DATA_TIPS);
  assert.deepEqual(getDataTips(undefined), DEFAULT_DATA_TIPS);
});

test('les candidats sont de meilleur grade, la meilleure en premier', () => {
  const app = { id: 1, grade: 'E' };
  const alts = [
    { id: 2, grade: 'C', popularity: 1 },
    { id: 3, grade: 'B', popularity: 9 },
    { id: 4, grade: 'A', popularity: 5 },
    { id: 5, grade: 'E', popularity: 1 },
  ];
  assert.deepEqual(getMigrationCandidates(app, alts).map(a => a.id), [4, 2, 3]);
  assert.deepEqual(getMigrationCandidates(null, alts), []);
});

test('le parcours n\'est proposé que pour une app C/D/E avec une meilleure alternative', () => {
  const alts = [{ id: 2, grade: 'A' }];
  assert.equal(canStartMigration({ id: 1, grade: 'D' }, alts), true);
  assert.equal(canStartMigration({ id: 1, grade: 'C' }, alts), true);
  assert.equal(canStartMigration({ id: 1, grade: 'B' }, alts), false);
  assert.equal(canStartMigration({ id: 1, grade: 'D' }, []), false);
});

test('la progression compte les étapes cochées et pointe la suivante', () => {
  assert.deepEqual(computeProgress({}), { completed: 0, total: 4, nextIndex: 0, isComplete: false });
  assert.equal(computeProgress({ choose: true, install: true }).nextIndex, 2);
  const full = computeProgress({ choose: true, install: true, transfer: true, cleanup: true });
  assert.equal(full.isComplete, true);
});
