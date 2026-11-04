import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildStarterKit, mergeKitIntoSelection } from '../../src/utils/creationKit.js';
import { KIT_NEEDS, CREATION_APPROACHES, COST_LABELS } from '../../src/constants/creationKits.js';

// Catalogue factice contenant tous les outils cités par les kits
const allIds = new Set();
for (const need of KIT_NEEDS) for (const pick of Object.values(need.picks)) if (pick.appId) allIds.add(String(pick.appId));
const catalog = new Map([...allIds].map(id => [id, { id, name: id, grade: 'B' }]));

const needIds = kit => kit.steps.flatMap(s => s.items.map(i => i.need.id));

test('chaque besoin a un choix valide pour chaque approche qui le concerne', () => {
  for (const need of KIT_NEEDS) {
    const approaches = need.approaches || CREATION_APPROACHES.map(a => a.id);
    for (const a of approaches) {
      const pick = need.picks[a];
      assert.ok(pick, `${need.id} / ${a}`);
      if (!pick.note) {
        assert.ok(pick.appId && pick.why, `${need.id} / ${a} : appId et why`);
        assert.ok(COST_LABELS[pick.cost], `${need.id} / ${a} : coût connu`);
      }
    }
  }
});

test('aucun outil de La Suite numérique (réservée aux agents publics)', () => {
  for (const id of ['la-suite-docs', 'la-suite-fichiers', 'la-suite-visio', 'tchap']) assert.ok(!allIds.has(id), id);
});

test('seul·e : pas de discussion d\'équipe ni de visio', () => {
  const kit = buildStarterKit({ type: 'association', size: 'solo', approach: 'simple' }, catalog);
  const ids = needIds(kit);
  assert.ok(ids.includes('email'));
  assert.ok(!ids.includes('messagerie'));
  assert.ok(!ids.includes('visio'));
});

test('association : adhérents et lettre d\'information, pas de compta TPE', () => {
  const ids = needIds(buildStarterKit({ type: 'association', size: 'petite', approach: 'simple' }, catalog));
  assert.ok(ids.includes('adherents'));
  assert.ok(ids.includes('newsletter'));
  assert.ok(!ids.includes('compta'));
  assert.ok(!ids.includes('crm'));
});

test('petite entreprise : compta, signature et CRM dès 2 personnes', () => {
  const ids = needIds(buildStarterKit({ type: 'tpe', size: 'petite', approach: 'simple' }, catalog));
  assert.ok(ids.includes('compta'));
  assert.ok(ids.includes('signature'));
  assert.ok(ids.includes('crm'));
  assert.ok(!ids.includes('adherents'));
});

test('équipe plus large : tâches et wiki ; libre : sauvegardes et note sans outil', () => {
  const kit = buildStarterKit({ type: 'association', size: 'moyenne', approach: 'libre' }, catalog);
  const ids = needIds(kit);
  assert.ok(ids.includes('taches'));
  assert.ok(ids.includes('wiki'));
  assert.ok(ids.includes('sauvegarde'));
  const agenda = kit.steps.flatMap(s => s.items).find(i => i.need.id === 'agenda');
  assert.equal(agenda.app, null);
  assert.ok(agenda.note);
});

test('apps uniques : un outil cité deux fois ne compte qu\'une fois', () => {
  const kit = buildStarterKit({ type: 'tpe', size: 'moyenne', approach: 'libre' }, catalog);
  const ids = kit.apps.map(a => a.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(ids.includes('dolibarr'));
});

test('un outil absent du catalogue est ignoré', () => {
  const partial = new Map(catalog);
  partial.delete('libreoffice');
  const kit = buildStarterKit({ type: 'association', size: 'solo', approach: 'simple' }, partial);
  assert.ok(!needIds(kit).includes('bureautique'));
});

test('les étapes suivent l\'ordre de mise en place', () => {
  const kit = buildStarterKit({ type: 'tpe', size: 'moyenne', approach: 'simple' }, catalog);
  assert.equal(kit.steps[0].step, 'Démarrer');
  assert.deepEqual(kit.steps.map(s => s.step), ['Démarrer', 'Sécuriser', 'Travailler ensemble', 'Gérer', 'Organiser']);
});

test('mergeKitIntoSelection : ajout sans perte, ou remplacement', () => {
  const saved = { ids: ['a', 'b'], criticality: { a: 'vitale' }, orgName: 'Asso' };
  assert.deepEqual(mergeKitIntoSelection(saved, ['b', 'c'], 'merge'), { ids: ['a', 'b', 'c'], criticality: { a: 'vitale' }, orgName: 'Asso' });
  assert.deepEqual(mergeKitIntoSelection(saved, ['b', 'c'], 'replace'), { ids: ['b', 'c'], criticality: {}, orgName: 'Asso' });
  assert.deepEqual(mergeKitIntoSelection(null, ['c'], 'merge'), { ids: ['c'], criticality: {}, orgName: '' });
});
