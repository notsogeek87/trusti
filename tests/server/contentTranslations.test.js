import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeContentLang, sourceHash, indexTranslations, applyToApiBody, translateApiBody, collectEntityIds,
  contentLanguages,
} from '../../server/contentTranslations.js';

const row = (entity, entity_id, field, value, fr) => ({ entity, entity_id, field, value, source_hash: sourceHash(fr) });

test('langue : en, de, es, it, nl, pl, pt ; le reste = français', () => {
  assert.equal(normalizeContentLang('EN'), 'en');
  assert.equal(normalizeContentLang('de-DE'), 'de');
  assert.equal(normalizeContentLang('it'), 'it');
  assert.equal(normalizeContentLang('pl-PL'), 'pl');
  assert.equal(normalizeContentLang('fr'), null);
  assert.equal(normalizeContentLang('sv'), null);
  assert.equal(normalizeContentLang(undefined), null);
});

test('apps : traduction à jour appliquée, périmée ou absente = français', () => {
  const index = indexTranslations([
    row('application', '1', 'reason', 'Hosted in France', 'Hébergé en France'),
    row('application', '1', 'description', 'Old text', 'Ancienne description'),
  ]);
  const body = { success: true, apps: [
    { id: 1, reason: 'Hébergé en France', description: 'Nouvelle description', teamPickReason: null },
    { id: 2, reason: 'Autre', description: 'Texte' },
  ] };
  const out = applyToApiBody(body, index);
  assert.equal(out.apps[0].reason, 'Hosted in France');
  assert.equal(out.apps[0].description, 'Nouvelle description');
  assert.equal(out.apps[0].teamPickReason, null);
  assert.deepEqual(out.apps[1], body.apps[1]);
  assert.equal(body.apps[0].reason, 'Hébergé en France', 'la réponse d\'origine n\'est pas modifiée');
});

test('évaluation : justification par critère traduite, résumé interne jamais exposé', () => {
  const index = indexTranslations([
    row('assessment', '7', 'summary', 'Good', 'Bien'),
    row('assessment', '7', 'rationale.gouvernance', 'EU company', 'Société européenne'),
  ]);
  const out = applyToApiBody({ assessment: { appId: 7, summary: 'Bien', criteria: [
    { key: 'gouvernance', rationale: 'Société européenne' },
    { key: 'donnees', rationale: 'Serveurs en France' },
  ] } }, index);
  assert.equal(out.assessment.summary, 'Bien', 'le résumé interne n\'est plus traduit (il ne sort plus de l\'API)');
  assert.equal(out.assessment.criteria[0].rationale, 'EU company');
  assert.equal(out.assessment.criteria[1].rationale, 'Serveurs en France');
});

test('guide : étapes et notes (niveau gardé), liste de longueur différente ignorée', () => {
  const frSteps = ['Ouvrir', 'Exporter'];
  const frNotes = ['Attention'];
  const index = indexTranslations([
    row('migration_guide', '3:export', 'steps', ['Open', 'Export'], frSteps),
    row('migration_guide', '3:export', 'notes', ['Careful'], frNotes),
    row('migration_guide', '4:import', 'steps', ['Only one'], ['Importer', 'Vérifier']),
  ]);
  const guide = {
    export: { summary: 'Résumé', steps: frSteps, notes: [{ text: 'Attention', level: 'danger' }], source: 'https://x' },
    import: { summary: null, steps: ['Importer', 'Vérifier'], notes: [], source: null },
  };
  const out = applyToApiBody({ guide }, index, { migration_guide_from: '3', migration_guide_to: '4' });
  assert.deepEqual(out.guide.export.steps, ['Open', 'Export']);
  assert.deepEqual(out.guide.export.notes, [{ text: 'Careful', level: 'danger' }]);
  assert.equal(out.guide.export.summary, 'Résumé');
  assert.deepEqual(out.guide.import.steps, ['Importer', 'Vérifier']);
});

test('guide : export direct traduit via directExport', () => {
  const index = indexTranslations([row('migration_guide', '4:import', 'directExport', 'Nothing to do', 'Rien à faire')]);
  const guide = { export: { summary: 'Rien à faire', steps: [], notes: [], source: null }, import: null };
  const out = applyToApiBody({ guide }, index, { migration_guide_from: '3', migration_guide_to: '4' });
  assert.equal(out.guide.export.summary, 'Nothing to do');
});

test('ids collectés et requête unique ; erreur base = français', async () => {
  const body = { success: true, app: { id: 1, reason: 'A' }, alternatives: [{ id: 2, reason: 'B' }] };
  const ids = collectEntityIds(body);
  assert.deepEqual([...ids.application].sort(), ['1', '2']);
  let calls = 0;
  const fakeSql = async () => { calls++; return [row('application', '2', 'reason', 'B-en', 'B')]; };
  const out = await translateApiBody(body, 'en', {}, async () => fakeSql);
  assert.equal(calls, 1);
  assert.equal(out.alternatives[0].reason, 'B-en');
  const failing = async () => { throw new Error('connection refused'); };
  assert.equal(await translateApiBody(body, 'de', {}, async () => failing), body);
  assert.equal(await translateApiBody(body, null, {}, async () => fakeSql), body);
});

test("langue sans traduction : repli sur l'anglais, puis le français", async () => {
  assert.deepEqual(contentLanguages('pl'), ['pl', 'en']);
  assert.deepEqual(contentLanguages('en'), ['en']);
  const tr = (lang, field, value, fr) => ({ ...row('application', '1', field, value, fr), lang });
  // Ordre de lecture quelconque : la langue demandée l'emporte, l'anglais sert de secours.
  const rows = [
    tr('pl', 'reason', 'Hostowane we Francji', 'Hébergé en France'),
    tr('en', 'reason', 'Hosted in France', 'Hébergé en France'),
    tr('en', 'description', 'English only', 'Description'),
    tr('pl', 'teamPickReason', 'Stary tekst', 'Ancien choix'),
    tr('en', 'teamPickReason', 'Team pick', 'Choix'),
  ];
  const index = indexTranslations(rows, ['pl', 'en']);
  const body = { success: true, app: { id: 1, reason: 'Hébergé en France', description: 'Description', teamPickReason: 'Choix' } };
  const out = applyToApiBody(body, index);
  assert.equal(out.app.reason, 'Hostowane we Francji');
  assert.equal(out.app.description, 'English only', 'absent en polonais : anglais');
  assert.equal(out.app.teamPickReason, 'Team pick', 'polonais périmé : anglais');
  const reversed = applyToApiBody(body, indexTranslations([...rows].reverse(), ['pl', 'en']));
  assert.deepEqual(reversed.app, out.app);

  let langsAsked = null;
  const fakeSql = async (strings, ...values) => { langsAsked = values[0]; return rows; };
  const viaSql = await translateApiBody(body, 'pl', {}, async () => fakeSql);
  assert.deepEqual(langsAsked, ['pl', 'en']);
  assert.equal(viaSql.app.description, 'English only');
});
