import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isAppMigrated,
  appHasAlternative,
  countMigrations,
  countAlternatives,
  resolveAlternativeFilter,
  filterMyApps,
} from '../../src/utils/myAppsFilters.js';

const noCustom = new Map();
const apps = [
  { id: '1', grade: 'A' },
  { id: '2', grade: 'D', alternativeAdopted: true, alternative: { id: 'x' } },
  { id: '3', grade: 'E', alternative: { id: 'y' } },
  { id: '4', grade: 'C' },
  { id: '5', isLoadingSkeleton: true },
];

test('une app est migrée si elle est notée A ou si son alternative est adoptée', () => {
  assert.equal(isAppMigrated(apps[0]), true);
  assert.equal(isAppMigrated(apps[1]), true);
  assert.equal(isAppMigrated(apps[2]), false);
});

test("une migration personnalisée ou une alternative en chargement compte comme alternative", () => {
  assert.equal(appHasAlternative(apps[3], noCustom), false);
  assert.equal(appHasAlternative(apps[3], new Map([['4', 'Signal']])), true);
  assert.equal(appHasAlternative({ id: '6', grade: 'D', isLoadingAlternative: true }, noCustom), true);
});

test('les compteurs ignorent les cartes de chargement', () => {
  assert.deepEqual(countMigrations(apps), { migrated: 2, todo: 2 });
  assert.deepEqual(countAlternatives(apps, noCustom), { with: 3, without: 1 });
});

test("le filtre « avec alternative » sans aucune app concernée retombe sur « tout »", () => {
  assert.equal(resolveAlternativeFilter('with', { with: 0, without: 3 }), 'all');
  assert.equal(resolveAlternativeFilter('with', { with: 1, without: 3 }), 'with');
  assert.equal(resolveAlternativeFilter('without', { with: 0, without: 3 }), 'without');
});

test('filterMyApps combine les deux filtres et garde les cartes de chargement', () => {
  const ids = (list) => list.map(app => app.id);
  assert.equal(filterMyApps(apps, { migrationFilter: 'all', alternativeFilter: 'all', customMigrations: noCustom }), apps);
  assert.deepEqual(ids(filterMyApps(apps, { migrationFilter: 'todo', alternativeFilter: 'all', customMigrations: noCustom })), ['3', '4', '5']);
  assert.deepEqual(ids(filterMyApps(apps, { migrationFilter: 'todo', alternativeFilter: 'with', customMigrations: noCustom })), ['3', '5']);
  assert.deepEqual(ids(filterMyApps(apps, { migrationFilter: 'all', alternativeFilter: 'without', customMigrations: noCustom })), ['4', '5']);
});
