import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAssessmentFromDB } from '../../server/assessment.js';

const row = {
  app_id: 'alan', grade: 'B', score: 65, computed_grade: 'B', overridden: false, provisional: true,
  score_range: { min: 65, max: 70 }, has_unverified_sources: true, summary: 'x', assessed_at: '2026-10-08',
  criteria: {
    transparence: { name: 'Transparence', points: 3, level_label: 'CGU claires : CGU/PPD compréhensibles', confidence: 'medium', rationale: 'r', provisional: false, sources: [] },
    gouvernance: {
      name: 'Gouvernance et juridiction', weight: 20, points: 3, level_label: 'UE mixte : filiale européenne', confidence: 'low', rationale: 'r', provisional: true,
      sources: [{ kind: 'background', url: null, quote: null, to_confirm: true }, { kind: 'primary', url: 'https://alan.com/fr-fr/privacy', quote: 'q' }],
    },
    controle: { name: 'Contrôle technique', points: 1, level_label: 'Dép. fortes : dépendances fortes', sources: [] },
  },
};

test('retourne null quand l\'app n\'a pas d\'évaluation', () => {
  assert.equal(formatAssessmentFromDB(null), null);
  assert.equal(formatAssessmentFromDB(undefined), null);
});

test('ordonne les critères selon la grille TrustiScore', () => {
  const a = formatAssessmentFromDB(row);
  assert.deepEqual(a.criteria.map(c => c.key), ['controle', 'gouvernance', 'transparence']);
});

test('sépare le titre et la description du niveau', () => {
  const c = formatAssessmentFromDB(row).criteria[0];
  assert.equal(c.levelTitle, 'Dép. fortes');
  assert.equal(c.levelDescription, 'dépendances fortes');
});

test('marque les sources background « à confirmer », pas les autres', () => {
  const gov = formatAssessmentFromDB(row).criteria.find(c => c.key === 'gouvernance');
  assert.equal(gov.sources[0].toConfirm, true);
  assert.equal(gov.sources[1].toConfirm, false);
  assert.equal(gov.sources[1].url, 'https://alan.com/fr-fr/privacy');
});

test('une source background est à confirmer même sans le drapeau to_confirm', () => {
  const r = { ...row, criteria: { controle: { name: 'c', points: 1, sources: [{ kind: 'background' }] } } };
  assert.equal(formatAssessmentFromDB(r).criteria[0].sources[0].toConfirm, true);
});

test('note d\'office : pas de critères ni de score', () => {
  const a = formatAssessmentFromDB({ app_id: 'x', grade: 'E', score: null, overridden: true, criteria: {}, assessed_at: '2026-10-08' });
  assert.equal(a.criteria.length, 0);
  assert.equal(a.score, null);
  assert.equal(a.overridden, true);
});

test('ne divulgue pas la trace interne ni le motif brut', () => {
  const a = formatAssessmentFromDB({ ...row, trace: 'lot1.json', override_reason: 'Règle de David' });
  assert.equal('trace' in a, false);
  assert.equal(JSON.stringify(a).includes('David'), false);
});
