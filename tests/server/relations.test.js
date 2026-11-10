import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRelations } from '../../server/relations.js';

const APPS = [
  { id: 'miro', category: 'Productivité / Tableau blanc', trusti_score: 'C' },
  { id: 'cryptpad', category: 'Productivité / Documents', trusti_score: 'A' },
  { id: 'word', category: 'Productivité / Documents', trusti_score: 'C' },
  { id: 'docs', category: 'Productivité / Documents', trusti_score: 'D' },
  { id: 'teams', category: 'Messagerie / Pro', trusti_score: 'C' },
  { id: 'tchap', category: 'Messagerie / Administration', trusti_score: 'A' },
  { id: 'old', category: 'Messagerie / Pro', trusti_score: 'B' },
];

const sorted = (list) => [...list].sort();

test('règle par catégorie : seulement les apps mieux notées', () => {
  const map = computeRelations(APPS);
  assert.deepEqual(sorted(map.get('docs').alternativeAppIds), ['cryptpad', 'word']);
  assert.deepEqual(map.get('cryptpad').alternativeAppIds, []);
  assert.deepEqual(sorted(map.get('cryptpad').replacesAppIds), ['docs', 'word']);
  assert.deepEqual(map.get('miro').alternativeAppIds, []);
});

test('les liens saisis ajoutent une alternative d’une autre catégorie', () => {
  const map = computeRelations(APPS, [{ app_id: 'miro', related_app_id: 'cryptpad' }]);
  assert.deepEqual(map.get('miro').alternativeAppIds, ['cryptpad']);
  assert.ok(map.get('cryptpad').replacesAppIds.includes('miro'));
});

test('union : un lien saisi ne retire pas les alternatives de la catégorie', () => {
  const map = computeRelations(APPS, [{ app_id: 'teams', related_app_id: 'tchap' }]);
  assert.deepEqual(sorted(map.get('teams').alternativeAppIds), ['old', 'tchap']);
});

test('un lien saisi vers une app moins bien ou aussi bien notée est ignoré', () => {
  const map = computeRelations(APPS, [
    { app_id: 'tchap', related_app_id: 'teams' },
    { app_id: 'word', related_app_id: 'miro' },
  ]);
  assert.deepEqual(map.get('tchap').alternativeAppIds, []);
  assert.deepEqual(map.get('word').alternativeAppIds, ['cryptpad']);
  assert.ok(!map.get('teams').replacesAppIds.includes('tchap'));
});

test('liens inconnus, doublons et auto-liens ignorés ; ids en texte', () => {
  const map = computeRelations(
    [...APPS, { id: 42, category: 'X', trusti_score: 'E' }],
    [
      { app_id: 'miro', related_app_id: 'absent' },
      { app_id: 'miro', related_app_id: 'cryptpad' },
      { app_id: 'miro', related_app_id: 'cryptpad' },
      { app_id: 'miro', related_app_id: 'miro' },
      { app_id: 42, related_app_id: 'tchap' },
    ],
  );
  assert.deepEqual(map.get('miro').alternativeAppIds, ['cryptpad']);
  assert.deepEqual(map.get('42').alternativeAppIds, ['tchap']);
  assert.ok(map.get('tchap').replacesAppIds.includes('42'));
});

test('replacesAppIds est l’inverse exact de alternativeAppIds', () => {
  const map = computeRelations(APPS, [
    { app_id: 'miro', related_app_id: 'cryptpad' },
    { app_id: 'teams', related_app_id: 'tchap' },
  ]);
  for (const [id, { alternativeAppIds }] of map) {
    for (const alt of alternativeAppIds) assert.ok(map.get(alt).replacesAppIds.includes(id));
  }
  for (const [id, { replacesAppIds }] of map) {
    for (const r of replacesAppIds) assert.ok(map.get(r).alternativeAppIds.includes(id));
  }
});
