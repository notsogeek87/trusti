import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  criticalityWeight,
  familyForCategory,
  groupAppsByFamily,
  editorKey,
  computeOrganisationSummary,
  buildActionPlan,
  toCsv,
  buildOrganisationExport,
  parseOrganisationImport,
} from '../../src/utils/organisationAssessment.js';

const word = { id: 'word', name: 'Word', grade: 'C', category: 'Bureautique', developer: 'Microsoft', isEuropean: false, popularity: 5, alternativeAppIds: ['libreoffice', 'onlyoffice'] };
const excel = { id: 'excel', name: 'Excel', grade: 'C', category: 'Bureautique', developer: 'Microsoft Corporation', isEuropean: false, popularity: 6, alternativeAppIds: ['libreoffice', 'onlyoffice'] };
const libreoffice = { id: 'libreoffice', name: 'LibreOffice', grade: 'A', category: 'Bureautique', developer: 'The Document Foundation', isEuropean: true, popularity: 50, alternativeAppIds: [] };
const onlyoffice = { id: 'onlyoffice', name: 'OnlyOffice', grade: 'B', category: 'Bureautique', developer: 'Ascensio', isEuropean: true, popularity: 20, alternativeAppIds: ['libreoffice'] };
const slack = { id: 'slack', name: 'Slack', grade: 'D', category: 'Messagerie', developer: 'Slack Technologies', isEuropean: false, popularity: 3, alternativeAppIds: ['tchap'] };
const tchap = { id: 'tchap', name: 'Tchap', grade: 'A', category: 'Messagerie', developer: 'DINUM', isEuropean: true, popularity: 40, alternativeAppIds: [], isTeamPick: true };
const odd = { id: 'odd', name: 'Odd', grade: 'B', category: 'Catégorie inconnue', developer: null, popularity: 1 };
const catalog = [word, excel, libreoffice, onlyoffice, slack, tchap, odd];

test('poids de criticité, importante par défaut', () => {
  assert.equal(criticalityWeight('vitale'), 3);
  assert.equal(criticalityWeight('secondaire'), 1);
  assert.equal(criticalityWeight(undefined), 2);
  assert.equal(criticalityWeight('inconnu'), 2);
});

test('famille par catégorie, « Autres outils » en repli', () => {
  assert.equal(familyForCategory('Email').id, 'messagerie');
  assert.equal(familyForCategory('Catégorie inconnue').id, 'autres');
});

test('regroupement par famille dans l\'ordre défini, tri par popularité', () => {
  const groups = groupAppsByFamily(catalog);
  assert.deepEqual(groups.map(g => g.family.id), ['messagerie', 'bureautique', 'autres']);
  assert.deepEqual(groups[1].apps.map(a => a.id), ['word', 'excel', 'onlyoffice', 'libreoffice']);
  assert.deepEqual(groupAppsByFamily(undefined), []);
});

test('clé d\'éditeur : même éditeur malgré la raison sociale', () => {
  assert.equal(editorKey('Microsoft'), editorKey('Microsoft Corporation'));
  assert.equal(editorKey('Évernote'), 'evernote');
  assert.equal(editorKey(null), null);
  assert.equal(editorKey('  '), null);
});

test('synthèse vide', () => {
  const s = computeOrganisationSummary([], {});
  assert.equal(s.total, 0);
  assert.equal(s.overallGrade, null);
});

test('note pondérée par la criticité, distincte de la note brute', () => {
  // Sans criticité, tout pèse pareil : (2 + 1 + 4) / 3 = 2,33 -> C, note pondérée = note brute.
  const s1 = computeOrganisationSummary([word, slack, tchap], {});
  assert.equal(s1.rawGrade, 'C');
  assert.equal(s1.overallGrade, 'C');
  // Deux outils faibles vitaux et un outil A secondaire : (1*3 + 1*3 + 4*1) / 7 = 1,43 -> D (brut 2 -> C)
  const weakSlack = { ...slack, id: 'slack2' };
  const s2 = computeOrganisationSummary([slack, weakSlack, tchap], { slack: 'vitale', slack2: 'vitale', tchap: 'secondaire' });
  assert.equal(s2.rawGrade, 'C');
  assert.equal(s2.overallGrade, 'D');
  assert.equal(s2.counts.D, 2);
  assert.equal(s2.criticalWeak.length, 2);
  assert.ok(Math.abs(s2.weakShare - 2 / 3) < 1e-9);
});

test('dépendance à un éditeur et part d\'éditeurs européens', () => {
  const s = computeOrganisationSummary([word, excel, tchap, odd], {});
  assert.equal(s.topEditor.count, 2);
  assert.equal(s.topEditor.share, 0.5);
  // odd n'a pas isEuropean : exclu du calcul
  assert.equal(s.europeanKnown, 3);
  assert.ok(Math.abs(s.europeanShare - 1 / 3) < 1e-9);
  assert.equal(computeOrganisationSummary([word, tchap], {}).topEditor, null);
});

test('les apps sans note valide sont ignorées', () => {
  const s = computeOrganisationSummary([{ id: 'x', grade: null }, tchap], {});
  assert.equal(s.total, 1);
  assert.equal(s.overallGrade, 'A');
});

test('plan d\'action : alternatives mieux notées, priorité aux outils vitaux', () => {
  const plan = buildActionPlan([word, slack, tchap], catalog, { word: 'vitale' });
  assert.deepEqual(plan.map(p => p.app.id), ['word', 'slack']);
  assert.equal(plan[0].alternative.id, 'libreoffice');
  assert.equal(plan[1].alternative.id, 'tchap');
  // Sans criticité : la note la plus faible d'abord
  assert.deepEqual(buildActionPlan([word, slack], catalog, {}).map(p => p.app.id), ['slack', 'word']);
  // Alternative absente du catalogue : null
  assert.equal(buildActionPlan([slack], [slack], {})[0].alternative, null);
});

test('plan d\'action : les alternatives choisies une par une passent avant la catégorie', () => {
  const crm = { id: 'crm', name: 'CRM US', grade: 'D', category: 'CRM & Support', alternativeAppIds: ['tickets', 'twenty'], curatedAlternativeIds: ['twenty', 'inconnue'] };
  const tickets = { id: 'tickets', name: 'Tickets', grade: 'A', category: 'CRM & Support' };
  const twenty = { id: 'twenty', name: 'Twenty', grade: 'B', category: 'CRM & Support' };
  assert.equal(buildActionPlan([crm], [crm, tickets, twenty], {})[0].alternative.id, 'twenty');
  // Alternative choisie moins bien notée ou absente du catalogue : repli sur la catégorie
  const crm2 = { ...crm, curatedAlternativeIds: ['inconnue'] };
  assert.equal(buildActionPlan([crm2], [crm2, tickets, twenty], {})[0].alternative.id, 'tickets');
});

test('export CSV avec échappement', () => {
  const tricky = { ...odd, name: 'Nom; "spécial"' };
  const plan = buildActionPlan([word], catalog, {});
  const csv = toCsv([word, tricky], { word: 'vitale' }, plan).split('\n');
  assert.equal(csv.length, 3);
  assert.ok(csv[0].startsWith('Outil;Éditeur'));
  assert.equal(csv[1], 'Word;Microsoft;Bureautique;Bureautique et documents;C;Vitale;LibreOffice;A');
  assert.ok(csv[2].startsWith('"Nom; ""spécial"""'));
});

test('export puis import JSON : seuls les ids connus et niveaux valides sont repris', () => {
  const exported = buildOrganisationExport(['word', 'slack'], { word: 'vitale' }, computeOrganisationSummary([word, slack], {}));
  assert.equal(exported.selection[1].criticality, 'importante');
  const parsed = parseOrganisationImport(exported, ['word', 'slack']);
  assert.deepEqual(parsed, { ids: ['word', 'slack'], criticality: { word: 'vitale', slack: 'importante' } });

  const mixed = { ...exported, selection: [{ id: 'word', criticality: 'bidon' }, { id: 'inconnu' }, { id: 'word' }] };
  assert.deepEqual(parseOrganisationImport(mixed, ['word']), { ids: ['word'], criticality: {} });
  assert.equal(parseOrganisationImport({ format: 'autre' }, ['word']), null);
  assert.equal(parseOrganisationImport(null, ['word']), null);
});
