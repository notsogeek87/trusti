import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatGuideSection, buildTransferGuide } from '../../server/migrationGuides.js';

const GMAIL = '1769803097037';
const PROTON = '1769541460710';
const MAILO = 'mailo';

const gmailExport = {
  app_id: GMAIL, direction: 'export', summary: 'Google fournit vos e-mails en MBOX.',
  steps: ['Ouvrez takeout.google.com.', 'Cochez Mail.'], notes: ['Lien valable 7 jours.'],
  direct_from: [], direct_export: null, source_url: 'https://support.google.com/x', checked_at: '2026-11-10', verified: true,
};
const protonImport = {
  app_id: PROTON, direction: 'import', summary: 'Easy Switch copie tout.',
  steps: ['Connectez-vous.', 'Importer via Easy Switch.'], notes: [],
  direct_from: [GMAIL], direct_export: 'Pas besoin d\'exporter.', source_url: 'https://proton.me/x', checked_at: '2026-11-10', verified: false,
};

test('formatGuideSection : section prête à afficher', () => {
  assert.deepEqual(formatGuideSection(gmailExport), {
    summary: 'Google fournit vos e-mails en MBOX.',
    steps: ['Ouvrez takeout.google.com.', 'Cochez Mail.'],
    notes: ['Lien valable 7 jours.'],
    source: 'https://support.google.com/x',
    checkedAt: '2026-11-10',
    verified: true,
  });
  assert.equal(formatGuideSection(null), null);
});

test('formatGuideSection : ignore les étapes vides ou mal formées', () => {
  const s = formatGuideSection({ ...gmailExport, steps: ['ok', '', null, 3], notes: 'pas une liste' });
  assert.deepEqual(s.steps, ['ok']);
  assert.deepEqual(s.notes, []);
});

test('buildTransferGuide : export de l\'app quittée et import de l\'alternative', () => {
  const guide = buildTransferGuide([gmailExport, { ...protonImport, app_id: MAILO, direct_from: [] }], GMAIL, MAILO);
  assert.equal(guide.export.summary, gmailExport.summary);
  assert.equal(guide.import.summary, protonImport.summary);
});

test('buildTransferGuide : import direct -> l\'export se résume à une phrase', () => {
  const guide = buildTransferGuide([gmailExport, protonImport], GMAIL, PROTON);
  assert.equal(guide.export.summary, 'Pas besoin d\'exporter.');
  assert.deepEqual(guide.export.steps, []);
  assert.equal(guide.export.source, null);
  assert.deepEqual(guide.import.steps, protonImport.steps);
});

test('buildTransferGuide : sans guide, les deux côtés sont null', () => {
  assert.deepEqual(buildTransferGuide([], GMAIL, PROTON), { export: null, import: null });
  // une ligne d'import pour l'app quittée n'est pas un export
  assert.equal(buildTransferGuide([{ ...protonImport, app_id: GMAIL }], GMAIL, PROTON).export, null);
});
