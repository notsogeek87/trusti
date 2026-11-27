import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FACT_SECTIONS, factTone } from '../../src/constants/assessmentFacts.js';
import { buildFactSections, expectedLabel, observedLabel } from '../../src/utils/assessmentFacts.js';
import fr from '../../src/i18n/locales/fr/index.js';

const item = (key) => FACT_SECTIONS.flatMap(s => s.items).find(i => i.key === key);

test('données attendues : 4 sections et 21 données (copie de facts.json de trustillm)', () => {
  assert.deepEqual(FACT_SECTIONS.map(s => s.key), ['juridique', 'technique', 'rgpd', 'certifications']);
  assert.equal(FACT_SECTIONS.flatMap(s => s.items).length, 21);
});

test('chaque section, donnée et valeur a son libellé', () => {
  const { facts } = fr.assessment;
  for (const s of FACT_SECTIONS) {
    assert.ok(facts.sections[s.key], s.key);
    for (const i of s.items) {
      assert.ok(facts.items[i.key], i.key);
      for (const v of i.values || []) assert.ok(facts.values[v], `${i.key}.${v}`);
    }
  }
});

test('lecture des valeurs observées', () => {
  assert.equal(factTone('cloud_act', 'expose'), 'bad');
  assert.equal(factTone('cloud_act', 'inconnu'), 'unknown');
  assert.equal(factTone('cloud_act', undefined), 'missing');
  assert.equal(factTone('siege_pays', 'DE'), 'good');
  assert.equal(factTone('siege_pays', 'CH'), 'warn');
  assert.equal(factTone('siege_pays', 'US'), 'bad');
  assert.equal(factTone('hebergement', ['fr', 'ue']), 'good');
  assert.equal(factTone('hebergement', ['ue', 'hors_ue']), 'bad');
  assert.equal(factTone('droit_applicable', ['fr', 'us']), 'bad');
  assert.equal(factTone('iso27001', 'non'), 'neutral');
  assert.equal(factTone('sectorielles', []), 'neutral');
});

test('donnée attendue et valeur observée en texte', () => {
  assert.equal(expectedLabel(item('hebergement')), "France / UE / Pays adéquat (hors UE) / Hors UE / Sur l'appareil ou auto-hébergé / Inconnu");
  assert.equal(expectedLabel(item('maison_mere_pays')), 'Pays / Aucune (indépendant) / Inconnu');
  assert.equal(observedLabel(item('hebergement'), { value: ['fr', 'ue'] }), 'France, UE');
  assert.equal(observedLabel(item('sectorielles'), { value: ['C5', 'PCI DSS'] }), 'C5, PCI DSS');
  assert.equal(observedLabel(item('sectorielles'), { value: [] }), 'Aucune trouvée');
  assert.equal(observedLabel(item('maison_mere_pays'), { value: 'aucune' }), 'Aucune (indépendant)');
  assert.equal(observedLabel(item('cloud_act'), null), null);
  assert.match(observedLabel(item('siege_pays'), { value: 'FR' }), /France|FR/);
});

test('fiche : toutes les données attendues, les manquantes « non renseignées »', () => {
  assert.equal(buildFactSections(null), null);
  const sections = buildFactSections({ juridique: { cloud_act: { value: 'non_expose', sources: [] } } });
  assert.equal(sections.length, 4);
  assert.equal(sections[0].filled, 1);
  const cloud = sections[0].items.find(i => i.key === 'cloud_act');
  assert.equal(cloud.observed, 'Non exposé');
  assert.equal(cloud.tone, 'good');
  const missing = sections[1].items[0];
  assert.equal(missing.observed, null);
  assert.equal(missing.tone, 'missing');
});

test('app sans serveur : « sur l\'appareil », aucun sous-traitant', () => {
  const item = (key) => FACT_SECTIONS.flatMap(s => s.items).find(i => i.key === key);
  assert.equal(factTone('hebergement', ['local']), 'good');
  assert.equal(factTone('sous_traitants', 'aucun'), 'good');
  assert.equal(observedLabel(item('hebergement'), { value: ['local'] }), "Sur l'appareil ou auto-hébergé");
});

test('Suisse et projets communautaires', () => {
  assert.equal(factTone('hebergement', ['adequat']), 'warn');
  assert.equal(factTone('hebergement', ['adequat', 'ue']), 'warn');
  assert.equal(factTone('siege_pays', 'communautaire'), 'neutral');
  assert.equal(factTone('base_legale', 'non_applicable'), 'neutral');
});

test('les 21 données sont rattachées à un seul critère chacune', async () => {
  const { CRITERION_FACTS } = await import('../../src/constants/assessmentFacts.js');
  const all = Object.values(CRITERION_FACTS).flat();
  const expected = FACT_SECTIONS.flatMap(s => s.items.map(i => `${s.key}.${i.key}`));
  assert.equal(all.length, 21);
  assert.deepEqual([...all].sort(), [...expected].sort());
});

test('données rangées par critère', async () => {
  const { buildCriterionFacts } = await import('../../src/utils/assessmentFacts.js');
  assert.equal(buildCriterionFacts(null), null);
  const byCrit = buildCriterionFacts({ juridique: { cloud_act: { value: 'expose', sources: [] } }, certifications: { hds: { value: 'oui', sources: [] } } });
  assert.equal(byCrit.gouvernance.length, 5);
  assert.equal(byCrit.gouvernance.find(r => r.key === 'cloud_act').tone, 'bad');
  assert.equal(byCrit.conformite.find(r => r.key === 'hds').observed, 'Oui');
  assert.equal(byCrit.localisation[0].tone, 'missing');
  assert.equal(byCrit.localisation.length, 3);
});

test('contrôle étranger « non » : favorable seulement pour une société européenne', async () => {
  const { factToneInContext } = await import('../../src/constants/assessmentFacts.js');
  const siege = (value) => ({ juridique: { siege_pays: { value } } });
  assert.equal(factToneInContext('controle_etranger', 'non', siege('FR')), 'good');
  assert.equal(factToneInContext('controle_etranger', 'non', siege('US')), 'neutral');
  assert.equal(factToneInContext('controle_etranger', 'non', {}), 'neutral');
  assert.equal(factToneInContext('controle_etranger', 'oui', siege('US')), 'bad');
  const { buildCriterionFacts } = await import('../../src/utils/assessmentFacts.js');
  const byCrit = buildCriterionFacts({ juridique: { siege_pays: { value: 'US' }, controle_etranger: { value: 'non' } } });
  assert.equal(byCrit.gouvernance.find(r => r.key === 'controle_etranger').tone, 'neutral');
});

test('code source : ligne en tête du critère contrôle, depuis la fiche de l\'app', async () => {
  const { buildCriterionFacts } = await import('../../src/utils/assessmentFacts.js');
  const facts = { technique: { infrastructure: { value: ['americaine'] } } };
  const open = buildCriterionFacts(facts, { isOpenSource: true, license: 'MPL-2.0' }).controle;
  assert.equal(open.length, 3);
  assert.equal(open[0].key, 'code_source');
  assert.equal(open[0].tone, 'good');
  assert.equal(open[0].observed, 'Open source');
  assert.equal(open[0].detail, 'Licence : MPL-2.0');
  // isOpenSource à false = valeur par défaut en base : non renseigné, pas « propriétaire ».
  const closed = buildCriterionFacts(facts, { isOpenSource: false, license: null }).controle[0];
  assert.equal(closed.tone, 'missing');
  assert.equal(closed.observed, null);
  assert.equal(buildCriterionFacts(facts).controle[0].tone, 'missing');
  // Les données de l'app seules ne suffisent pas à afficher la fiche.
  assert.equal(buildCriterionFacts({}, { isOpenSource: true }), null);
});

test('libellés de la ligne code source dans toutes les langues', async () => {
  for (const lang of ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt']) {
    const { facts } = (await import(`../../src/i18n/locales/${lang}/index.js`)).default.assessment;
    assert.ok(facts.items.code_source && facts.values.open_source && facts.values.proprietaire && facts.license, lang);
  }
});

test('code source : propriétaire seulement si une licence le confirme', async () => {
  const { codeSourceRow } = await import('../../src/utils/assessmentFacts.js');
  const closed = codeSourceRow({ isOpenSource: false, license: 'Propriétaire' });
  assert.equal(closed.tone, 'bad');
  assert.equal(closed.observed, 'Propriétaire');
  assert.equal(closed.detail, null);
  assert.equal(codeSourceRow({ isOpenSource: false, license: 'Propriétaire (basé sur OpenStack)' }).detail, 'Licence : Propriétaire (basé sur OpenStack)');
  assert.equal(codeSourceRow({ isOpenSource: false, license: null }).tone, 'missing');
  assert.equal(codeSourceRow({ isOpenSource: false, license: '  ' }).tone, 'missing');
});

test('localisation : les deux « transferts » ne font qu\'un point', async () => {
  const { buildCriterionFacts } = await import('../../src/utils/assessmentFacts.js');
  const loc = (facts) => buildCriterionFacts(facts).localisation;
  const tr = (rows) => rows.filter(r => r.key.startsWith('transferts'));
  // Suisse (pays adéquat) : transfert à surveiller, pas rouge.
  let rows = loc({ technique: { hebergement: { value: ['adequat'] }, transferts_internationaux: { value: 'non' } }, rgpd: { transferts_hors_ue: { value: 'oui', sources: [{ url: 'https://a' }] } } });
  assert.equal(rows.length, 3);
  assert.equal(tr(rows).length, 1);
  assert.equal(tr(rows)[0].tone, 'warn');
  assert.equal(tr(rows)[0].observed, 'Oui');
  assert.equal(rows[2].key, 'transferts_hors_ue');
  // Hébergement déjà hors UE : rouge.
  rows = loc({ technique: { hebergement: { value: ['ue', 'hors_ue'] }, transferts_internationaux: { value: 'oui', sources: [{ url: 'https://a' }] } }, rgpd: { transferts_hors_ue: { value: 'oui', sources: [{ url: 'https://a' }] } } });
  assert.equal(tr(rows)[0].tone, 'bad');
  assert.equal(tr(rows)[0].sources.length, 1);
  // Non + inconnu : non ; rien : non renseigné.
  rows = loc({ technique: { hebergement: { value: ['fr'] }, transferts_internationaux: { value: 'non' } }, rgpd: { transferts_hors_ue: { value: 'inconnu' } } });
  assert.equal(tr(rows)[0].tone, 'good');
  rows = loc({ technique: { hebergement: { value: ['fr'] } } });
  assert.equal(tr(rows)[0].tone, 'missing');
});

test('certifications inconnues : neutres (gris), pas à surveiller', () => {
  for (const k of ['secnumcloud', 'iso27001', 'hds', 'soc2', 'sectorielles']) assert.equal(factTone(k, 'inconnu'), 'neutral', k);
  assert.equal(factTone('dpo', 'inconnu'), 'unknown');
});

test('durée de conservation non chiffrée : à surveiller (orange), pas défavorable', () => {
  assert.equal(factTone('duree_conservation', 'non_precisee'), 'warn');
  assert.equal(factTone('duree_conservation', 'precisee'), 'good');
  assert.equal(factTone('politique_confidentialite', 'absente'), 'bad');
});

test('donnée lue sur le site de l\'éditeur seulement : grise, avec mention', async () => {
  const { buildCriterionFacts } = await import('../../src/utils/assessmentFacts.js');
  const facts = { rgpd: {
    dpo: { value: 'oui', scope: 'site' },
    base_legale: { value: 'oui' },
    politique_confidentialite: { value: 'inconnu', scope: 'site' },
  } };
  const c = buildCriterionFacts(facts);
  const dpo = c.conformite.find(r => r.key === 'dpo');
  assert.equal(dpo.tone, 'neutral');
  assert.equal(dpo.siteOnly, true);
  assert.equal(c.conformite.find(r => r.key === 'base_legale').tone, 'good');
  assert.equal(c.transparence.find(r => r.key === 'politique_confidentialite').tone, 'unknown');
  for (const lang of ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt']) {
    const loc = (await import(`../../src/i18n/locales/${lang}/index.js`)).default.assessment;
    assert.ok(loc.facts.siteOnly, lang);
  }
});
