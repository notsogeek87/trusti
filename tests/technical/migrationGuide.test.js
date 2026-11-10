import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDataTips, getMigrationCandidates, canStartMigration, computeProgress } from '../../src/utils/migrationGuide.js';
import { DEFAULT_DATA_TIPS } from '../../src/constants/migrationGuide.js';
import { APP_EXPORT_GUIDES, APP_IMPORT_GUIDES } from '../../src/constants/appMigrationGuides.js';

test('les conseils suivent la catégorie, avec repli générique', () => {
  assert.ok(getDataTips('Gestionnaires de Mots de Passe').export[0].includes('CSV'));
  assert.ok(getDataTips('Email').import.length > 0);
  const generic = { ...DEFAULT_DATA_TIPS, exportSource: null, importSource: null };
  assert.deepEqual(getDataTips('Jeux'), generic);
  assert.deepEqual(getDataTips(undefined), generic);
});

test('guide propre à l\'app quittée et à l\'alternative, avec la source officielle', () => {
  // WhatsApp -> Signal
  const tips = getDataTips('Messagerie', { appId: '1769879213451', altId: '1769540367871' });
  assert.ok(tips.export.some(t => t.includes('Exporter la discussion')));
  assert.ok(tips.import.some(t => t.includes('Signal')));
  assert.ok(tips.exportSource.startsWith('https://'));
  assert.ok(tips.importSource.startsWith('https://'));
});

test('un côté sans guide retombe sur les conseils de la catégorie', () => {
  // Gmail -> une messagerie sans guide dédié
  const tips = getDataTips('Email', { appId: '1769803097037', altId: 'mailo' });
  assert.ok(tips.export.some(t => t.includes('takeout.google.com')));
  assert.ok(tips.import.some(t => t.includes('contacts')));
  assert.equal(tips.importSource, null);
});

test('import direct : l\'export est remplacé par une seule consigne', () => {
  // Gmail -> Proton Mail (Easy Switch se connecte à Gmail)
  const tips = getDataTips('Email', { appId: '1769803097037', altId: '1769541460710' });
  assert.equal(tips.export.length, 1);
  assert.ok(tips.export[0].startsWith('Pas besoin d\'exporter'));
  assert.equal(tips.exportSource, null);
  assert.ok(tips.import.some(t => t.includes('Easy Switch')));
});

test('chaque guide a des conseils, une source https et une date de vérification', () => {
  for (const [id, guide] of Object.entries({ ...APP_EXPORT_GUIDES, ...APP_IMPORT_GUIDES })) {
    assert.ok(Array.isArray(guide.tips) && guide.tips.length > 0, id);
    assert.ok(guide.tips.every(t => typeof t === 'string' && t.length > 0), id);
    assert.match(guide.source, /^https:\/\//, id);
    assert.match(guide.checkedAt, /^\d{4}-\d{2}-\d{2}$/, id);
  }
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

test('le choix de l\'équipe passe en premier (présélectionné), même moins bien noté', () => {
  const app = { id: 1, grade: 'D' };
  const alts = [
    { id: 2, grade: 'A', popularity: 5 },
    { id: 3, grade: 'B', popularity: 9, isTeamPick: true },
    { id: 4, grade: 'B', popularity: 1 },
  ];
  assert.deepEqual(getMigrationCandidates(app, alts).map(a => a.id), [3, 2, 4]);
});

test('un choix de l\'équipe qui n\'est pas mieux noté que l\'app est ignoré', () => {
  const app = { id: 1, grade: 'C' };
  const alts = [{ id: 2, grade: 'C', isTeamPick: true }, { id: 3, grade: 'B' }];
  assert.deepEqual(getMigrationCandidates(app, alts).map(a => a.id), [3]);
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

test('migrations en cours : commencées, pas terminées, app encore à migrer', async () => {
  const { getMigrationsInProgress } = await import('../../src/utils/migrationGuide.js');
  const myApps = [
    { id: 'w', name: 'WhatsApp' },
    { id: 'g', name: 'Gmail' },
    { id: 'd', name: 'Drive' },
    { id: 'm', name: 'Messenger' },
    { id: 'z', name: 'Zoom', alternativeAdopted: true },
  ];
  const states = {
    w: { altId: 's', done: { choose: true, install: true } },
    g: { altId: null, done: { choose: true } },
    d: { altId: null, done: { choose: true, install: true, transfer: true, cleanup: true } },
    m: { altId: null, done: {} },
    z: { altId: null, done: { choose: true } },
    x: { altId: null, done: { choose: true } }, // plus dans « Mes Apps »
  };
  const items = getMigrationsInProgress(states, myApps, {
    migratedApps: new Set(), catalogApps: [{ id: 's', name: 'Signal' }],
  });
  assert.deepEqual(items.map(i => [i.app.id, i.altName, i.completed, i.total]), [
    ['w', 'Signal', 2, 4],
    ['g', null, 1, 4],
  ]);
  assert.deepEqual(getMigrationsInProgress(states, myApps, { migratedApps: new Set(['w', 'g']) }), []);
});
