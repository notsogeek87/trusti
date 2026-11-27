/**
 * Filtres avancés du catalogue : « profils » d'apps lus dans la fiche factuelle (app_assessments.facts).
 *
 * Fonctions pures, partagées par le serveur (calcul de l'index, server/database/postgres/app-insights.js)
 * et le front (lecture du lien ?f=, filtrage). Un profil ne dit jamais « conforme au RGPD » : il liste
 * des faits observés (DPO, suppression possible…), avec la même lecture que les points de couleur de la
 * fiche (factTone).
 *
 * Résultat d'un profil pour une app :
 * - 'match'   : toutes les données exigées sont favorables (vertes) ;
 * - 'unknown' : aucune n'est défavorable, mais certaines ne sont pas vérifiées (inconnu, non renseigné,
 *               ou lu seulement sur le site de l'éditeur) : affichée si « inclure les non vérifiées » ;
 * - 'no'      : au moins une donnée est défavorable.
 */
import { factTone } from '../constants/assessmentFacts.js';

export const PROFILE_MATCH = 'match';
export const PROFILE_UNKNOWN = 'unknown';
export const PROFILE_NO = 'no';

/** Paramètre d'URL des profils choisis (ex. ?f=hors_cloud_act,open_source). */
export const PROFILES_PARAM = 'f';
/** Paramètre d'URL « inclure les données non vérifiées » (?fu=1). */
export const PROFILES_UNKNOWN_PARAM = 'fu';

// Valeurs « non applicable » : la donnée ne s'applique pas à l'app (ex. pas de DPO exigé) → favorable.
const NOT_APPLICABLE = 'non_applicable';

/**
 * Lecture d'une donnée de la fiche pour un filtre : 'good' | 'bad' | 'unknown'.
 * Une donnée lue seulement sur le site de l'éditeur (scope 'site') n'est pas vérifiée pour l'app.
 */
export function factStatus(facts, path) {
  const [section, key] = path.split('.');
  const fact = facts?.[section]?.[key];
  const value = fact?.value;
  if (value === NOT_APPLICABLE) return 'good';
  const tone = factTone(key, value);
  // « À surveiller » (ex. hébergement dans un pays adéquat, hors UE) : ne répond pas au filtre.
  if (tone === 'bad' || tone === 'warn') return 'bad';
  if (tone === 'good') return fact?.scope === 'site' ? 'unknown' : 'good';
  return 'unknown';
}

/** Les deux « transferts » de la fiche disent la même chose (voir MERGED_CRITERION_FACTS) : un seul « oui » suffit. */
function transfersStatus(facts) {
  const a = factStatus(facts, 'rgpd.transferts_hors_ue');
  const b = factStatus(facts, 'technique.transferts_internationaux');
  if (a === 'bad' || b === 'bad') return 'bad';
  return a === 'good' || b === 'good' ? 'good' : 'unknown';
}

/** Combine des lectures : une défavorable → 'no', toutes favorables → 'match', sinon 'unknown'. */
function allOf(statuses) {
  if (statuses.includes('bad')) return PROFILE_NO;
  return statuses.every(s => s === 'good') ? PROFILE_MATCH : PROFILE_UNKNOWN;
}

/**
 * Profils proposés, dans l'ordre d'affichage. `icon` : nom d'icône Lucide (voir ProfileFilterOptions).
 * `evaluate(facts, app)` → PROFILE_MATCH | PROFILE_UNKNOWN | PROFILE_NO.
 */
export const APP_PROFILES = [
  {
    key: 'hors_cloud_act',
    icon: 'Scale',
    evaluate: (facts) => allOf([factStatus(facts, 'juridique.cloud_act')]),
  },
  {
    key: 'donnees_europe',
    icon: 'MapPin',
    // Hébergement en France, dans l'UE/EEE ou sur l'appareil, sans transfert hors UE connu. Les sauvegardes
    // ne sont presque jamais publiées : seule une sauvegarde hors UE exclut l'app.
    evaluate: (facts) => {
      if (factStatus(facts, 'technique.sauvegardes') === 'bad') return PROFILE_NO;
      const transfers = transfersStatus(facts);
      if (transfers === 'bad') return PROFILE_NO;
      return allOf([factStatus(facts, 'technique.hebergement')]);
    },
  },
  {
    key: 'vie_privee',
    icon: 'Lock',
    // Faits RGPD observés (pas une conformité) : DPO, base légale, suppression des données possible,
    // sans transfert hors UE connu.
    evaluate: (facts) => {
      if (transfersStatus(facts) === 'bad') return PROFILE_NO;
      return allOf(['rgpd.dpo', 'rgpd.base_legale', 'rgpd.suppression_donnees'].map(p => factStatus(facts, p)));
    },
  },
  {
    key: 'open_source',
    icon: 'Code2',
    // is_open_source vaut FALSE par défaut en base : « faux » veut souvent dire « non renseigné ».
    evaluate: (_facts, app) => (app?.isOpenSource ? PROFILE_MATCH : PROFILE_NO),
  },
  {
    key: 'certifiee',
    icon: 'BadgeCheck',
    // Au moins une certification trouvée. « Inconnu » est la norme ici (rarement publiées) : pas de cas
    // « non vérifié », sans quoi presque tout le catalogue remonterait.
    evaluate: (facts) => {
      const certified = ['certifications.secnumcloud', 'certifications.iso27001', 'certifications.hds', 'certifications.soc2', 'certifications.sectorielles']
        .some(p => factStatus(facts, p) === 'good');
      return certified ? PROFILE_MATCH : PROFILE_NO;
    },
  },
];

export const PROFILE_KEYS = APP_PROFILES.map(p => p.key);
const PROFILES_BY_KEY = new Map(APP_PROFILES.map(p => [p.key, p]));

/**
 * Index des profils pour tout le catalogue : pour chaque profil, les IDs des apps qui y répondent
 * (match) et de celles dont des données ne sont pas vérifiées (unknown).
 * @param {Array<{id: string|number, isOpenSource?: boolean, facts?: object|null}>} rows
 * @returns {Record<string, {match: string[], unknown: string[]}>}
 */
export function buildProfileIndex(rows) {
  const index = Object.fromEntries(PROFILE_KEYS.map(k => [k, { match: [], unknown: [] }]));
  for (const row of rows) {
    const id = String(row.id);
    for (const profile of APP_PROFILES) {
      const result = profile.evaluate(row.facts || null, row);
      if (result === PROFILE_MATCH) index[profile.key].match.push(id);
      else if (result === PROFILE_UNKNOWN) index[profile.key].unknown.push(id);
    }
  }
  return index;
}

/**
 * Profils choisis lus dans l'URL (clés inconnues ignorées, sans doublon, dans l'ordre d'affichage).
 * @param {string} search ex. window.location.search
 * @returns {{profiles: string[], includeUnknown: boolean}}
 */
export function parseProfilesParams(search = '') {
  const params = new URLSearchParams(search);
  const wanted = new Set((params.get(PROFILES_PARAM) || '').split(',').map(s => s.trim()).filter(Boolean));
  return {
    profiles: PROFILE_KEYS.filter(k => wanted.has(k)),
    includeUnknown: params.get(PROFILES_UNKNOWN_PARAM) === '1',
  };
}

/**
 * Applique les profils choisis aux paramètres d'une URL (les retire s'il n'y en a aucun).
 * @param {URLSearchParams} params modifié en place
 * @param {{profiles: string[], includeUnknown: boolean}} selection
 */
export function writeProfilesParams(params, { profiles, includeUnknown }) {
  const keys = PROFILE_KEYS.filter(k => profiles.includes(k));
  if (keys.length === 0) {
    params.delete(PROFILES_PARAM);
    params.delete(PROFILES_UNKNOWN_PARAM);
    return params;
  }
  params.set(PROFILES_PARAM, keys.join(','));
  if (includeUnknown) params.set(PROFILES_UNKNOWN_PARAM, '1');
  else params.delete(PROFILES_UNKNOWN_PARAM);
  return params;
}

/**
 * IDs des apps qui répondent à TOUS les profils choisis, ou null sans profil choisi (pas de filtre).
 * @param {Record<string, {match: string[], unknown: string[]}>|null} index voir buildProfileIndex
 * @param {string[]} profiles
 * @param {boolean} includeUnknown
 * @returns {Set<string>|null}
 */
export function matchingAppIds(index, profiles, includeUnknown) {
  const keys = profiles.filter(k => PROFILES_BY_KEY.has(k));
  if (keys.length === 0) return null;
  if (!index) return new Set();
  let result = null;
  for (const key of keys) {
    const entry = index[key] || { match: [], unknown: [] };
    const ids = new Set(includeUnknown ? [...entry.match, ...entry.unknown] : entry.match);
    result = result ? new Set([...result].filter(id => ids.has(id))) : ids;
  }
  return result;
}

/**
 * Lien partageable vers le catalogue filtré (ex. https://app.trusti-score.eu/?f=open_source).
 * @param {string} baseUrl voir getShareBaseUrl (utils/appShareLink.js)
 * @param {{profiles: string[], includeUnknown: boolean}} selection
 */
export function buildProfilesShareUrl(baseUrl, selection) {
  const qs = writeProfilesParams(new URLSearchParams(), selection).toString();
  return qs ? `${baseUrl}?${qs.replace(/%2C/g, ',')}` : baseUrl;
}
