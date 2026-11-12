import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pdfText, gradeRgb, reportFilename, buildOrganisationPdf } from '../../src/utils/organisationPdf.js';
import { computeOrganisationSummary, buildActionPlan } from '../../src/utils/organisationAssessment.js';
import { computeAuditResult } from '../../src/utils/auditChecklist.js';
import { helpForProfile } from '../../src/constants/orgHelp.js';

test('texte PDF : espaces invisibles retirés, caractères hors police remplacés', () => {
  assert.equal(pdfText('​​Microsoft Copilot'), 'Microsoft Copilot');
  assert.equal(pdfText('Évaluation « œuvre » – 50 %'), 'Évaluation « œuvre » – 50 %');
  assert.equal(pdfText('Москва'), '??????');
  assert.equal(pdfText(null), '');
});

test('couleur des notes reprise de la charte', () => {
  assert.deepEqual(gradeRgb('A'), [0, 104, 55]);
  assert.deepEqual(gradeRgb('X'), [200, 200, 200]);
});

test('nom de fichier', () => {
  const d = new Date('2026-11-02T10:00:00Z');
  assert.equal(reportFilename('Mairie de Saint-Clément', d), 'trusti-rapport-mairie-de-saint-clement-2026-11-02.pdf');
  assert.equal(reportFilename('', d), 'trusti-rapport-2026-11-02.pdf');
});

test('rapport sur plusieurs pages quand il y a beaucoup d\'outils', async () => {
  const grades = ['A', 'B', 'C', 'D', 'E'];
  const apps = Array.from({ length: 90 }, (_, i) => ({
    id: `app${i}`, name: `Outil ${i}`, grade: grades[i % 5], category: 'Bureautique',
    developer: `Éditeur ${i % 7}`, isEuropean: i % 2 === 0, alternativeAppIds: ['app0'],
  }));
  const summary = computeOrganisationSummary(apps, { app3: 'vitale' });
  const plan = buildActionPlan(apps, apps, { app3: 'vitale' });
  const doc = await buildOrganisationPdf({ orgName: 'Mairie de Test', profileLabel: 'Collectivité', selectedApps: apps, summary, plan, criticality: { app3: 'vitale' } });
  assert.ok(doc.getNumberOfPages() >= 3, `pages : ${doc.getNumberOfPages()}`);
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  assert.equal(String.fromCharCode(...bytes.slice(0, 5)), '%PDF-');
});

test('rapport court sur une seule page', async () => {
  const apps = [{ id: 'a', name: 'Tchap', grade: 'A', category: 'Messagerie', developer: 'DINUM', isEuropean: true }];
  const doc = await buildOrganisationPdf({ orgName: '', selectedApps: apps, summary: computeOrganisationSummary(apps, {}), plan: [] });
  assert.equal(doc.getNumberOfPages(), 1);
});

test('rapport avec questionnaire d\'audit et aides : sections ajoutées', async () => {
  const apps = [{ id: 'a', name: 'GMail', grade: 'D', category: 'Email', developer: 'Google', isEuropean: false }];
  const summary = computeOrganisationSummary(apps, {});
  const audit = computeAuditResult({ mfa: 'non', dpo: 'non', sauvegarde: 'nsp' }, 'collectivite');
  const doc = await buildOrganisationPdf({
    orgName: 'Mairie de Test', profileLabel: 'Collectivité', selectedApps: apps, summary, plan: [],
    audit, help: helpForProfile('collectivite'),
  });
  const text = Buffer.from(doc.output('arraybuffer')).toString('latin1');
  assert.ok(text.includes('points de vigilance'), 'section vigilance');
  assert.ok(text.includes('Qui peut vous aider'), 'section aides');
  assert.ok(text.includes('suiteterritoriale.anct.gouv.fr'), 'lien Suite territoriale');
});
