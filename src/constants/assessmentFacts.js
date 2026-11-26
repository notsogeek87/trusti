/**
 * Fiche factuelle d'une évaluation TrustiScore : données attendues, par section.
 *
 * Copie de `trustiscore_pipeline/facts.json` du dépôt trustillm (source de vérité, qui produit les
 * valeurs observées de la colonne `app_assessments.facts`) : toute donnée ajoutée là-bas s'ajoute ici,
 * avec ses libellés dans src/i18n/locales/<langue>/assessment.js (assessment.facts.*).
 *
 * Types : `enum` (une valeur), `multi` (plusieurs valeurs), `country` (code pays ISO, ou une valeur
 * listée), `list` (noms libres). La valeur `inconnu` (cherchée, pas trouvée) est toujours possible.
 */

export const FACT_UNKNOWN = 'inconnu';

export const FACT_SECTIONS = [
  {
    key: 'juridique',
    items: [
      { key: 'siege_pays', type: 'country', values: ['communautaire'] },
      { key: 'maison_mere_pays', type: 'country', values: ['aucune'] },
      { key: 'droit_applicable', type: 'multi', values: ['fr', 'ue', 'us', 'autre'] },
      { key: 'cloud_act', type: 'enum', values: ['expose', 'non_expose'] },
      { key: 'controle_etranger', type: 'enum', values: ['oui', 'non'] },
    ],
  },
  {
    key: 'technique',
    items: [
      { key: 'hebergement', type: 'multi', values: ['fr', 'ue', 'adequat', 'hors_ue', 'local'] },
      { key: 'sauvegardes', type: 'multi', values: ['fr', 'ue', 'adequat', 'hors_ue', 'local'] },
      { key: 'infrastructure', type: 'multi', values: ['europeenne', 'americaine', 'autre', 'local'] },
      { key: 'sous_traitants', type: 'enum', values: ['identifies', 'non_identifies', 'aucun'] },
      { key: 'transferts_internationaux', type: 'enum', values: ['oui', 'non'] },
    ],
  },
  {
    key: 'rgpd',
    items: [
      { key: 'politique_confidentialite', type: 'enum', values: ['accessible', 'absente'] },
      { key: 'dpo', type: 'enum', values: ['oui', 'non', 'non_applicable'] },
      { key: 'transferts_hors_ue', type: 'enum', values: ['oui', 'non'] },
      { key: 'base_legale', type: 'enum', values: ['oui', 'non', 'non_applicable'] },
      { key: 'duree_conservation', type: 'enum', values: ['precisee', 'non_precisee', 'non_applicable'] },
      { key: 'suppression_donnees', type: 'enum', values: ['possible', 'non_documentee', 'non_applicable'] },
    ],
  },
  {
    key: 'certifications',
    items: [
      { key: 'secnumcloud', type: 'enum', values: ['oui', 'en_cours', 'non'] },
      { key: 'iso27001', type: 'enum', values: ['oui', 'non'] },
      { key: 'hds', type: 'enum', values: ['oui', 'non', 'non_applicable'] },
      { key: 'soc2', type: 'enum', values: ['oui', 'non'] },
      { key: 'sectorielles', type: 'list' },
    ],
  },
];

// Union européenne et Espace économique européen : droit européen applicable.
export const EEA_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU',
  'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'IS', 'LI', 'NO',
]);
// Hors UE, avec une décision d'adéquation de la Commission européenne (hors États-Unis, soumis au CLOUD Act).
export const ADEQUACY_COUNTRIES = new Set([
  'AD', 'AR', 'CA', 'CH', 'FO', 'GB', 'GG', 'IL', 'IM', 'JE', 'JP', 'KR', 'NZ', 'UY',
]);

// Lecture de la valeur observée : favorable (good), défavorable (bad), à surveiller (warn), neutre.
const BY_VALUE = {
  cloud_act: { expose: 'bad', non_expose: 'good' },
  controle_etranger: { oui: 'bad', non: 'good' },
  sous_traitants: { identifies: 'good', non_identifies: 'bad', aucun: 'good' },
  transferts_internationaux: { oui: 'bad', non: 'good' },
  politique_confidentialite: { accessible: 'good', absente: 'bad' },
  dpo: { oui: 'good', non: 'bad' },
  transferts_hors_ue: { oui: 'bad', non: 'good' },
  base_legale: { oui: 'good', non: 'bad' },
  duree_conservation: { precisee: 'good', non_precisee: 'bad' },
  suppression_donnees: { possible: 'good', non_documentee: 'bad' },
  secnumcloud: { oui: 'good' },
  iso27001: { oui: 'good' },
  hds: { oui: 'good' },
  soc2: { oui: 'good' },
};

/**
 * @param {string} itemKey  clé de la donnée (ex. 'cloud_act')
 * @param {*} value  valeur observée (undefined/null : non renseignée)
 * @returns {'good'|'bad'|'warn'|'neutral'|'unknown'|'missing'}
 */
export function factTone(itemKey, value) {
  if (value === undefined || value === null) return 'missing';
  if (value === FACT_UNKNOWN) return 'unknown';
  if (itemKey === 'siege_pays' || itemKey === 'maison_mere_pays') {
    if (value === 'aucune' || value === 'communautaire') return 'neutral';
    if (EEA_COUNTRIES.has(value)) return 'good';
    return ADEQUACY_COUNTRIES.has(value) ? 'warn' : 'bad';
  }
  if (Array.isArray(value)) {
    if (itemKey === 'sectorielles') return value.length ? 'good' : 'neutral';
    if (itemKey === 'droit_applicable') return value.includes('us') ? 'bad' : (value.includes('autre') ? 'neutral' : 'good');
    if (itemKey === 'infrastructure') return value.includes('americaine') ? 'bad' : (value.includes('autre') ? 'neutral' : 'good');
    if (value.includes('hors_ue')) return 'bad'; // hébergement, sauvegardes
    return value.includes('adequat') ? 'warn' : 'good';
  }
  return BY_VALUE[itemKey]?.[value] || 'neutral';
}
