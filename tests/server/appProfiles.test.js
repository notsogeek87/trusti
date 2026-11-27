import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_PROFILES, PROFILE_KEYS, PROFILE_MATCH, PROFILE_UNKNOWN, PROFILE_NO,
  factStatus, buildProfileIndex, parseProfilesParams, writeProfilesParams, matchingAppIds, buildProfilesShareUrl,
} from '../../src/utils/appProfiles.js';

const v = (value, extra = {}) => ({ value, ...extra });
const profile = (key) => APP_PROFILES.find(p => p.key === key);

test('factStatus : lecture favorable / défavorable / non vérifiée', () => {
  const facts = {
    juridique: { cloud_act: v('non_expose') },
    rgpd: { dpo: v('non_applicable'), base_legale: v('inconnu') },
    technique: { hebergement: v(['adequat']), sauvegardes: v(['ue'], { scope: 'site' }) },
  };
  assert.equal(factStatus(facts, 'juridique.cloud_act'), 'good');
  assert.equal(factStatus(facts, 'rgpd.dpo'), 'good'); // non applicable : rien à exiger
  assert.equal(factStatus(facts, 'rgpd.base_legale'), 'unknown');
  assert.equal(factStatus(facts, 'rgpd.suppression_donnees'), 'unknown'); // non renseignée
  assert.equal(factStatus(facts, 'technique.hebergement'), 'bad'); // pays adéquat : hors UE
  assert.equal(factStatus(facts, 'technique.sauvegardes'), 'unknown'); // site de l'éditeur seulement
  assert.equal(factStatus(null, 'juridique.cloud_act'), 'unknown');
});

test('profil hors CLOUD Act', () => {
  const { evaluate } = profile('hors_cloud_act');
  assert.equal(evaluate({ juridique: { cloud_act: v('non_expose') } }), PROFILE_MATCH);
  assert.equal(evaluate({ juridique: { cloud_act: v('expose') } }), PROFILE_NO);
  assert.equal(evaluate({ juridique: { cloud_act: v('inconnu') } }), PROFILE_UNKNOWN);
  assert.equal(evaluate(null), PROFILE_UNKNOWN);
});

test('profil données dans l\'UE : un transfert ou une sauvegarde hors UE exclut l\'app', () => {
  const { evaluate } = profile('donnees_europe');
  const base = { technique: { hebergement: v(['fr', 'local']) } };
  assert.equal(evaluate(base), PROFILE_MATCH);
  assert.equal(evaluate({ technique: { hebergement: v(['ue', 'hors_ue']) } }), PROFILE_NO);
  assert.equal(evaluate({ technique: { ...base.technique, sauvegardes: v(['hors_ue']) } }), PROFILE_NO);
  assert.equal(evaluate({ ...base, rgpd: { transferts_hors_ue: v('oui') } }), PROFILE_NO);
  assert.equal(evaluate({ technique: { ...base.technique, transferts_internationaux: v('oui') } }), PROFILE_NO);
  assert.equal(evaluate({ technique: { hebergement: v('inconnu') } }), PROFILE_UNKNOWN);
});

test('profil vie privée : faits RGPD, pas une conformité', () => {
  const { evaluate } = profile('vie_privee');
  const ok = { rgpd: { dpo: v('oui'), base_legale: v('oui'), suppression_donnees: v('possible') } };
  assert.equal(evaluate(ok), PROFILE_MATCH);
  assert.equal(evaluate({ rgpd: { ...ok.rgpd, transferts_hors_ue: v('oui') } }), PROFILE_NO);
  assert.equal(evaluate({ rgpd: { ...ok.rgpd, dpo: v('non') } }), PROFILE_NO);
  assert.equal(evaluate({ rgpd: { ...ok.rgpd, base_legale: v('inconnu') } }), PROFILE_UNKNOWN);
});

test('profils open source et certifiée', () => {
  assert.equal(profile('open_source').evaluate(null, { isOpenSource: true }), PROFILE_MATCH);
  assert.equal(profile('open_source').evaluate(null, { isOpenSource: false }), PROFILE_NO);
  const { evaluate } = profile('certifiee');
  assert.equal(evaluate({ certifications: { iso27001: v('oui') } }), PROFILE_MATCH);
  assert.equal(evaluate({ certifications: { sectorielles: v(['PCI DSS']) } }), PROFILE_MATCH);
  assert.equal(evaluate({ certifications: { iso27001: v('inconnu'), secnumcloud: v('non') } }), PROFILE_NO);
});

test('buildProfileIndex et matchingAppIds : profils cumulés (ET), option non vérifiées', () => {
  const index = buildProfileIndex([
    { id: 1, isOpenSource: true, facts: { juridique: { cloud_act: v('non_expose') } } },
    { id: 2, isOpenSource: true, facts: { juridique: { cloud_act: v('inconnu') } } },
    { id: 3, isOpenSource: false, facts: { juridique: { cloud_act: v('non_expose') } } },
    { id: 4, isOpenSource: true, facts: { juridique: { cloud_act: v('expose') } } },
  ]);
  assert.deepEqual(Object.keys(index), PROFILE_KEYS);
  assert.deepEqual(index.hors_cloud_act, { match: ['1', '3'], unknown: ['2'] });
  assert.equal(matchingAppIds(index, [], false), null);
  assert.deepEqual([...matchingAppIds(index, ['hors_cloud_act', 'open_source'], false)], ['1']);
  assert.deepEqual([...matchingAppIds(index, ['hors_cloud_act', 'open_source'], true)].sort(), ['1', '2']);
  assert.deepEqual([...matchingAppIds(null, ['open_source'], false)], []); // index pas encore chargé
  assert.equal(matchingAppIds(index, ['inexistant'], false), null);
});

test('paramètres d\'URL ?f= et ?fu=', () => {
  assert.deepEqual(parseProfilesParams('?f=open_source,inexistant,hors_cloud_act,open_source&fu=1'), {
    profiles: ['hors_cloud_act', 'open_source'],
    includeUnknown: true,
  });
  assert.deepEqual(parseProfilesParams(''), { profiles: [], includeUnknown: false });

  const params = new URLSearchParams('app=signal&fu=1');
  writeProfilesParams(params, { profiles: ['open_source'], includeUnknown: false });
  assert.equal(params.toString(), 'app=signal&f=open_source');
  writeProfilesParams(params, { profiles: [], includeUnknown: true });
  assert.equal(params.toString(), 'app=signal');

  assert.equal(
    buildProfilesShareUrl('https://app.trusti-score.eu/', { profiles: ['vie_privee', 'hors_cloud_act'], includeUnknown: true }),
    'https://app.trusti-score.eu/?f=hors_cloud_act,vie_privee&fu=1'
  );
  assert.equal(buildProfilesShareUrl('https://x/', { profiles: [], includeUnknown: false }), 'https://x/');
});
