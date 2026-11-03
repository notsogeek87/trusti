import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAwardsPodiums } from '../../src/utils/awards.js';
import { CATEGORY_MAPPING } from '../../src/constants/categories.js';

const normalize = (c) => CATEGORY_MAPPING[c] || 'Divers';

test('le Palmarès exclut les apps notées C, D ou E', () => {
  const podiums = buildAwardsPodiums([
    { id: '1', name: 'Tuta', category: 'Email', grade: 'A' },
    { id: '2', name: 'Slack', category: 'Messagerie', grade: 'D' },
    { id: '3', name: 'Signal', category: 'Messagerie', grade: 'C' }
  ], normalize);
  assert.deepEqual(podiums.map(p => p.apps.map(a => a.id)), [['1']]);
});

test('podium de 3 apps max par catégorie : grade, puis popularité', () => {
  const apps = [
    { id: 'b-pop', name: 'B pop', category: 'Email', grade: 'B', popularity: 1 },
    { id: 'b-rare', name: 'B rare', category: 'Email', grade: 'B', popularity: 500 },
    { id: 'a', name: 'A', category: 'Messagerie', grade: 'A', popularity: 900 },
    { id: 'b-mid', name: 'B mid', category: 'Visioconférence', grade: 'B', popularity: 50 }
  ];
  const [messagerie] = buildAwardsPodiums(apps, normalize);
  assert.equal(messagerie.category, 'Messagerie');
  assert.deepEqual(messagerie.apps.map(a => a.id), ['a', 'b-pop', 'b-mid']);
});

test('les catégories du catalogue pro ne tombent plus dans « Divers »', () => {
  for (const c of ['CRM & Support', 'RH & Paie', 'Gestion de projet', 'Sauvegarde & Supervision', 'Sécurité / 2FA']) {
    assert.notEqual(normalize(c), 'Divers', c);
  }
});
