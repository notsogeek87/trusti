import { APP_CRITERION_FACTS, CRITERION_FACTS, FACT_SECTIONS, FACT_UNKNOWN, factTone, factToneInContext } from '../constants/assessmentFacts.js';
import { getLanguage, t } from '../i18n/index.js';

/** Nom d'un pays dans la langue de l'interface (code ISO -> « France »), ou le code si inconnu. */
export function countryName(code) {
  try {
    return new Intl.DisplayNames([getLanguage()], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

const valueLabel = (item, v) => (item.type === 'country' && !(item.values || []).includes(v) && v !== FACT_UNKNOWN
  ? countryName(v)
  : t(`assessment.facts.values.${v}`));

/** Donnée attendue : valeurs possibles, ex. « France / UE / Hors UE / Inconnu ». */
export function expectedLabel(item) {
  const parts = [];
  if (item.type === 'country') parts.push(t('assessment.facts.expected.country'));
  if (item.type === 'list') parts.push(t('assessment.facts.expected.list'));
  for (const v of item.values || []) parts.push(t(`assessment.facts.values.${v}`));
  parts.push(t(`assessment.facts.values.${FACT_UNKNOWN}`));
  return parts.join(' / ');
}

/** Valeur observée, en texte : « France, UE », « Aucune certification trouvée »... ; null si non renseignée. */
export function observedLabel(item, fact) {
  if (!fact) return null;
  const { value } = fact;
  if (Array.isArray(value)) {
    if (value.length === 0) return t('assessment.facts.noneFound');
    return item.type === 'list' ? value.join(', ') : value.map(v => valueLabel(item, v)).join(', ');
  }
  return valueLabel(item, value);
}

/** Une donnée attendue avec sa valeur observée (ou non renseignée), sa lecture et ses sources. */
function factRow(item, fact, facts = null) {
  return {
    key: item.key,
    expected: expectedLabel(item),
    observed: observedLabel(item, fact),
    tone: facts ? factToneInContext(item.key, fact?.value, facts) : factTone(item.key, fact?.value),
    countries: (fact?.countries || []).map(countryName),
    detail: fact?.detail || null,
    sources: fact?.sources || [],
  };
}

/**
 * Ligne « Code source » depuis la fiche de l'app (isOpenSource, license). Seul « open source »
 * est une valeur observée : isOpenSource à false n'est pas fiable (valeur par défaut en base).
 * @param {{isOpenSource?: boolean, license?: string|null, website?: string|null}|null} app
 */
export function codeSourceRow(app) {
  const open = app?.isOpenSource === true;
  return {
    key: 'code_source',
    expected: [t('assessment.facts.values.open_source'), t('assessment.facts.values.proprietaire'), t(`assessment.facts.values.${FACT_UNKNOWN}`)].join(' / '),
    observed: open ? t('assessment.facts.values.open_source') : null,
    tone: open ? 'good' : 'missing',
    countries: [],
    detail: open && app.license ? t('assessment.facts.license', { license: app.license }) : null,
    sources: [],
  };
}

const APP_ROW_BUILDERS = { code_source: codeSourceRow };

const ITEM_BY_KEY = Object.fromEntries(FACT_SECTIONS.flatMap(s => s.items.map(i => [`${s.key}.${i.key}`, i])));

/**
 * Données de la fiche factuelle rangées par critère (CRITERION_FACTS), pour les afficher sous
 * la justification de chaque critère, précédées des données de la fiche de l'app (APP_CRITERION_FACTS).
 * @param {object|null} facts  assessment.facts
 * @param {object|null} [app]  fiche de l'app (isOpenSource, license)
 * @returns {Object<string, object[]>|null}  null si aucune donnée observée dans la fiche factuelle
 */
export function buildCriterionFacts(facts, app = null) {
  if (!facts) return null;
  let observed = 0;
  const out = {};
  for (const [criterion, keys] of Object.entries(CRITERION_FACTS)) {
    out[criterion] = keys.map(k => {
      const [section, item] = k.split('.');
      const row = factRow(ITEM_BY_KEY[k], facts[section]?.[item] || null, facts);
      if (row.observed !== null) observed += 1;
      return row;
    });
    const appRows = (APP_CRITERION_FACTS[criterion] || []).map(k => APP_ROW_BUILDERS[k](app));
    if (appRows.length) out[criterion] = [...appRows, ...out[criterion]];
  }
  return observed ? out : null;
}

/**
 * Sections de la fiche factuelle prêtes à afficher : toutes les données attendues, dans l'ordre,
 * avec la valeur observée (ou non renseignée), sa lecture (tone) et ses sources.
 * @param {object|null} facts  assessment.facts (server/assessment.js : formatFacts)
 * @returns {Array<{key: string, filled: number, items: object[]}>|null}  null si aucune donnée observée
 */
export function buildFactSections(facts) {
  if (!facts) return null;
  const sections = FACT_SECTIONS.map(section => {
    const items = section.items.map(item => factRow(item, facts[section.key]?.[item.key] || null));
    return { key: section.key, filled: items.filter(i => i.observed !== null).length, items };
  });
  return sections.some(s => s.filled > 0) ? sections : null;
}
