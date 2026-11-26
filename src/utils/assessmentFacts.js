import { FACT_SECTIONS, FACT_UNKNOWN, factTone } from '../constants/assessmentFacts.js';
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

/**
 * Sections de la fiche factuelle prêtes à afficher : toutes les données attendues, dans l'ordre,
 * avec la valeur observée (ou non renseignée), sa lecture (tone) et ses sources.
 * @param {object|null} facts  assessment.facts (server/assessment.js : formatFacts)
 * @returns {Array<{key: string, filled: number, items: object[]}>|null}  null si aucune donnée observée
 */
export function buildFactSections(facts) {
  if (!facts) return null;
  const sections = FACT_SECTIONS.map(section => {
    const items = section.items.map(item => {
      const fact = facts[section.key]?.[item.key] || null;
      return {
        key: item.key,
        expected: expectedLabel(item),
        observed: observedLabel(item, fact),
        tone: factTone(item.key, fact?.value),
        countries: (fact?.countries || []).map(countryName),
        detail: fact?.detail || null,
        sources: fact?.sources || [],
      };
    });
    return { key: section.key, filled: items.filter(i => i.observed !== null).length, items };
  });
  return sections.some(s => s.filled > 0) ? sections : null;
}
