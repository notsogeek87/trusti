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
