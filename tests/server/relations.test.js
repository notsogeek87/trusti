import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRelations, allowsAutoAlternatives } from '../../server/relations.js';

const app = (id, category, trusti_score) => ({ id, category, trusti_score });

test('une alternative automatique est notée A/B/C, jamais D/E', () => {
  const rel = computeRelations([
    app('tiktok', 'Réseaux sociaux', 'E'),
    app('insta', 'Réseaux sociaux', 'D'),
    app('mastodon', 'Réseaux sociaux', 'A'),
  ]);
  assert.deepEqual(rel.get('tiktok').alternativeAppIds, ['mastodon']);
  assert.deepEqual(rel.get('insta').alternativeAppIds, ['mastodon']);
});

test('sans alternative A/B/C dans la catégorie, aucune alternative n\'est proposée', () => {
  const rel = computeRelations([
    app('a', 'Streaming Vidéo', 'D'),
    app('b', 'Streaming Vidéo', 'E'),
  ]);
  assert.deepEqual(rel.get('a').alternativeAppIds, []);
  assert.deepEqual(rel.get('b').alternativeAppIds, []);
});

test('« remplace » est le miroir des alternatives', () => {
  const rel = computeRelations([
    app('disney', 'Streaming Vidéo', 'D'),
    app('canal', 'Streaming Vidéo', 'C'),
  ]);
  assert.deepEqual(rel.get('disney').alternativeAppIds, ['canal']);
  assert.deepEqual(rel.get('canal').replacesAppIds, ['disney']);
  assert.deepEqual(rel.get('disney').replacesAppIds, []);
});

test('pas d\'alternative automatique pour les catégories non substituables', () => {
  for (const category of ['Système Android', 'Outils Samsung', 'Outils / Transfert', 'Jeux', 'Jeux / Émulation', 'Shopping', 'Utilitaires', 'Personnalisation', 'Services publics / Santé']) {
    assert.equal(allowsAutoAlternatives(category), false, category);
  }
  const rel = computeRelations([
    app('clock', 'Utilitaires', 'D'),
    app('termux', 'Utilitaires', 'A'),
  ]);
  assert.deepEqual(rel.get('clock').alternativeAppIds, []);
  assert.deepEqual(rel.get('termux').replacesAppIds, []);
});

test('les catégories de contenu restent éligibles', () => {
  for (const category of ['Streaming Vidéo', 'Navigateurs Web', 'Messagerie', 'Retouche Photo', 'IA', 'Email']) {
    assert.equal(allowsAutoAlternatives(category), true, category);
  }
});

test('les relations manuelles passent en premier, sans doublon', () => {
  const rel = computeRelations(
    [
      app('chrome', 'Navigateurs Web', 'D'),
      app('firefox', 'Navigateurs Web', 'C'),
      app('brave', 'Navigateurs Web', 'C'),
      app('qwant', 'Moteurs de Recherche', 'B'),
    ],
    [
      { app_id: 'chrome', related_app_id: 'qwant', relation_type: 'alternative' },
      { app_id: 'chrome', related_app_id: 'firefox', relation_type: 'alternative' },
    ]
  );
  assert.deepEqual(rel.get('chrome').alternativeAppIds, ['qwant', 'firefox', 'brave']);
});

test('les relations manuelles vers une app inconnue sont ignorées', () => {
  const rel = computeRelations(
    [app('a', 'Email', 'D')],
    [{ app_id: 'a', related_app_id: 'supprimee', relation_type: 'alternative' }]
  );
  assert.deepEqual(rel.get('a').alternativeAppIds, []);
});
