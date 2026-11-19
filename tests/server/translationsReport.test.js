import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceHash } from '../../server/contentTranslations.js';
import { expectedTranslations, compareTranslations, fieldFamily } from '../../server/translationsReport.js';

const catalogue = {
  apps: [
    { id: 'a1', reason: 'Hébergé en France', description: 'Messagerie libre', team_pick_reason: null },
    { id: 'a2', reason: '', description: '   ', team_pick_reason: 'Choix de l\'équipe' },
  ],
  assessments: [
    { app_id: 'a1', criteria: { controle: { rationale: 'Code ouvert.' }, gouvernance: { rationale: '' } } },
    // forme « liste » renvoyée par l'API : même résultat
    { app_id: 'a2', criteria: [{ key: 'controle', rationale: 'Propriétaire.' }] },
  ],
  guides: [
    {
      app_id: 'g1', direction: 'import', summary: 'Résumé', steps: ['Étape 1', 'Étape 2'],
      notes: ['Note simple', { text: 'Note danger', level: 'danger' }], direct_export: 'Pas besoin d\'exporter.',
    },
    { app_id: 'g2', direction: 'export', summary: 'Export', steps: [], notes: [], direct_export: 'ignoré hors import' },
  ],
};

const find = (list, entity, entityId, field) => list.find(e => e.entity === entity && e.entityId === entityId && e.field === field);

test('attendu : seuls les textes non vides, avec l\'empreinte de l\'API', () => {
  const exp = expectedTranslations(catalogue);
  assert.equal(find(exp, 'application', 'a1', 'reason').hash, sourceHash('Hébergé en France'));
  assert.equal(find(exp, 'application', 'a1', 'teamPickReason'), undefined, 'null ignoré');
  assert.equal(find(exp, 'application', 'a2', 'reason'), undefined, 'chaîne vide ignorée');
  assert.equal(find(exp, 'application', 'a2', 'description'), undefined, 'espaces seuls ignorés');
  assert.ok(find(exp, 'application', 'a2', 'teamPickReason'));
  assert.equal(find(exp, 'assessment', 'a1', 'rationale.controle').hash, sourceHash('Code ouvert.'));
  assert.equal(find(exp, 'assessment', 'a1', 'rationale.gouvernance'), undefined);
  assert.ok(find(exp, 'assessment', 'a2', 'rationale.controle'), 'critères en liste acceptés');
});

test('attendu : guides, notes en objets ramenées à leur texte, export direct réservé à l\'import', () => {
  const exp = expectedTranslations(catalogue);
  const steps = find(exp, 'migration_guide', 'g1:import', 'steps');
  assert.equal(steps.kind, 'list');
  assert.equal(steps.length, 2);
  assert.equal(steps.hash, sourceHash(['Étape 1', 'Étape 2']));
  assert.equal(find(exp, 'migration_guide', 'g1:import', 'notes').hash, sourceHash(['Note simple', 'Note danger']));
  assert.ok(find(exp, 'migration_guide', 'g1:import', 'directExport'));
  assert.equal(find(exp, 'migration_guide', 'g2:export', 'directExport'), undefined);
  assert.equal(find(exp, 'migration_guide', 'g2:export', 'steps'), undefined, 'liste vide ignorée');
});

const tr = (entity, entity_id, field, lang, value, fr) => ({ entity, entity_id, field, lang, value, source_hash: sourceHash(fr) });

test('comparaison : ok, manquant, périmé, invalide, orphelin', () => {
  const exp = expectedTranslations({
    apps: [{ id: 'a1', reason: 'Texte', description: 'Autre texte' }],
    guides: [{ app_id: 'g', direction: 'import', summary: 'R', steps: ['a', 'b'], notes: [], direct_export: null }],
  });
  const rows = [
    tr('application', 'a1', 'reason', 'en', 'Text', 'Texte'),
    tr('application', 'a1', 'reason', 'de', 'Text', 'Ancien texte'),
    tr('application', 'a1', 'description', 'en', '', 'Autre texte'),
    tr('migration_guide', 'g:import', 'steps', 'en', ['one'], ['a', 'b']),
    tr('migration_guide', 'g:import', 'steps', 'de', ['eins', 'zwei'], ['a', 'b']),
    tr('migration_guide', 'g:import', 'summary', 'en', 'S', 'R'),
    tr('application', 'supprimee', 'reason', 'en', 'Gone', 'Disparue'),
    tr('application', 'a1', 'reason', 'it', 'Testo', 'Texte'),
  ];
  const { rows: out, summary, orphans, complete } = compareTranslations(exp, rows);
  const status = (entity, id, field, lang) => out.find(r => r.entity === entity && r.entityId === id && r.field === field && r.lang === lang).status;

  assert.equal(status('application', 'a1', 'reason', 'en'), 'ok');
  assert.equal(status('application', 'a1', 'reason', 'de'), 'stale');
  assert.equal(status('application', 'a1', 'description', 'en'), 'invalid');
  assert.equal(status('application', 'a1', 'description', 'de'), 'missing');
  assert.equal(status('migration_guide', 'g:import', 'steps', 'en'), 'invalid', 'longueur différente : l\'API l\'ignorerait');
  assert.equal(status('migration_guide', 'g:import', 'steps', 'de'), 'ok');
  assert.equal(status('migration_guide', 'g:import', 'summary', 'de'), 'missing');
  assert.equal(complete, false);

  assert.deepEqual(orphans, [{ entity: 'application', entityId: 'supprimee', field: 'reason', lang: 'en' }],
    'la langue non gérée (it) n\'est pas comptée');

  const reasonEn = summary.find(s => s.entity === 'application' && s.field === 'reason' && s.lang === 'en');
  assert.deepEqual(reasonEn, { entity: 'application', field: 'reason', lang: 'en', expected: 1, ok: 1, missing: 0, stale: 0, invalid: 0 });
});

test('comparaison : tout traduit = complet ; les justifications sont regroupées', () => {
  const exp = expectedTranslations({
    apps: [{ id: '1', reason: 'R' }],
    assessments: [{ app_id: '1', criteria: { controle: { rationale: 'A' }, localisation: { rationale: 'B' } } }],
  });
  const rows = ['en', 'de'].flatMap(lang => [
    tr('application', '1', 'reason', lang, 'x', 'R'),
    tr('assessment', '1', 'rationale.controle', lang, 'x', 'A'),
    tr('assessment', '1', 'rationale.localisation', lang, 'x', 'B'),
  ]);
  const { complete, summary, orphans } = compareTranslations(exp, rows);
  assert.equal(complete, true);
  assert.equal(orphans.length, 0);
  const rat = summary.find(s => s.field === 'rationale.*' && s.lang === 'de');
  assert.equal(rat.expected, 2);
  assert.equal(rat.ok, 2);
  assert.equal(fieldFamily('rationale.transparence'), 'rationale.*');
  assert.equal(fieldFamily('summary'), 'summary');
});

test('valeur stockée en chaîne JSON (driver qui ne parse pas le jsonb) : reconnue', () => {
  const exp = expectedTranslations({ guides: [{ app_id: 'g', direction: 'import', summary: null, steps: ['a'], notes: [] }] });
  const rows = ['en', 'de'].map(lang => tr('migration_guide', 'g:import', 'steps', lang, JSON.stringify(['one']), ['a']));
  assert.equal(compareTranslations(exp, rows).complete, true);
});
