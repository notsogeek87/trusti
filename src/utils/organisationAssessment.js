/**
 * Calculs de l'évaluation du parc applicatif d'une organisation
 * (page « ?organisation »). Fonctions pures, sans React ni réseau :
 * testées dans tests/technical/organisationAssessment.test.js.
 */
import { GRADES } from '../constants/grades.js';
import { PRO_FAMILIES, OTHER_FAMILY, CRITICALITY_LEVELS, DEFAULT_CRITICALITY } from '../constants/proFamilies.js';
import { pickRecommendedAlternative, isStrictlyBetterGrade } from './alternatives.js';
import { sanitizeAuditAnswers } from './auditChecklist.js';

const GRADE_POINTS = { A: 4, B: 3, C: 2, D: 1, E: 0 };
const WEAK_GRADES = new Set(['D', 'E']);

/** Poids d'un niveau de criticité (importante par défaut). */
export function criticalityWeight(level) {
  const found = CRITICALITY_LEVELS.find(l => l.id === level)
    || CRITICALITY_LEVELS.find(l => l.id === DEFAULT_CRITICALITY);
  return found.weight;
}

/** Famille d'une catégorie du catalogue. */
export function familyForCategory(category) {
  return PRO_FAMILIES.find(f => f.categories.includes(category)) || OTHER_FAMILY;
}

/**
 * Regroupe les apps par famille, dans l'ordre de PRO_FAMILIES, familles vides
 * exclues ; les apps de chaque famille sont triées par popularité puis nom.
 * @returns {Array<{family: object, apps: object[]}>}
 */
export function groupAppsByFamily(apps) {
  const byId = new Map();
  for (const app of apps || []) {
    const family = familyForCategory(app.category);
    if (!byId.has(family.id)) byId.set(family.id, { family, apps: [] });
    byId.get(family.id).apps.push(app);
  }
  const order = [...PRO_FAMILIES, OTHER_FAMILY].map(f => f.id);
  return order
    .filter(id => byId.has(id))
    .map(id => {
      const group = byId.get(id);
      group.apps.sort((a, b) => (a.popularity ?? 9999) - (b.popularity ?? 9999) || String(a.name).localeCompare(String(b.name), 'fr'));
      return group;
    });
}

/** Clé d'éditeur pour regrouper « Microsoft » et « Microsoft Corporation ». */
export function editorKey(developer) {
  if (!developer) return null;
  const first = String(developer)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)[0];
  return first || null;
}

/** Note globale à partir d'une moyenne de points (0 à 4). */
function gradeFromAverage(average) {
  const rounded = Math.round(average);
  return GRADES[GRADES.length - 1 - rounded];
}

/**
 * Synthèse de l'évaluation.
 * @param {object[]} apps apps sélectionnées (avec grade, developer, isEuropean)
 * @param {Object<string,string>} criticality id -> niveau de criticité
 */
export function computeOrganisationSummary(apps, criticality = {}) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let weightedPoints = 0;
  let totalWeight = 0;
  let rawPoints = 0;
  const scored = [];

  for (const app of apps || []) {
    if (counts[app.grade] === undefined) continue;
    const weight = criticalityWeight(criticality[app.id]);
    counts[app.grade] += 1;
    weightedPoints += GRADE_POINTS[app.grade] * weight;
    rawPoints += GRADE_POINTS[app.grade];
    totalWeight += weight;
    scored.push(app);
  }

  const total = scored.length;
  if (total === 0) {
    return { total: 0, counts, overallGrade: null, rawGrade: null, weakShare: 0, criticalWeak: [], topEditor: null, europeanShare: null, europeanKnown: 0 };
  }

  const weak = scored.filter(a => WEAK_GRADES.has(a.grade));
  const criticalWeak = weak.filter(a => (criticality[a.id] || DEFAULT_CRITICALITY) === 'vitale');

  // Dépendance à un éditeur : part des outils du premier éditeur (au moins 2 outils).
  const editors = new Map();
  for (const app of scored) {
    const key = editorKey(app.developer);
    if (!key) continue;
    const entry = editors.get(key) || { name: app.developer, count: 0 };
    entry.count += 1;
    editors.set(key, entry);
  }
  let topEditor = null;
  for (const entry of editors.values()) {
    if (entry.count >= 2 && (!topEditor || entry.count > topEditor.count)) topEditor = entry;
  }
  if (topEditor) topEditor = { ...topEditor, share: topEditor.count / total };

  // Part d'éditeurs européens, seulement parmi les fiches renseignées.
  const known = scored.filter(a => typeof a.isEuropean === 'boolean');
  const europeanShare = known.length > 0 ? known.filter(a => a.isEuropean).length / known.length : null;

  return {
    total,
    counts,
    overallGrade: gradeFromAverage(weightedPoints / totalWeight),
    rawGrade: gradeFromAverage(rawPoints / total),
    weakShare: weak.length / total,
    criticalWeak,
    topEditor,
    europeanShare,
    europeanKnown: known.length,
  };
}

/**
 * Plan d'action : pour chaque app notée C, D ou E, l'alternative mieux notée
 * recommandée parmi le catalogue pro, triée par priorité (criticité, puis
 * note la plus faible). Les alternatives choisies une par une
 * (curatedAlternativeIds) passent avant la règle « mieux notée dans la même
 * catégorie » (alternativeAppIds).
 */
export function buildActionPlan(selectedApps, catalog, criticality = {}) {
  const byId = new Map((catalog || []).map(a => [String(a.id), a]));
  const better = (ids, app) => (ids || [])
    .map(id => byId.get(String(id)))
    .filter(alt => alt && isStrictlyBetterGrade(alt.grade, app.grade));
  const plan = [];
  for (const app of selectedApps || []) {
    if (!['C', 'D', 'E'].includes(app.grade)) continue;
    const curated = better(app.curatedAlternativeIds, app);
    const candidates = curated.length > 0 ? curated : better(app.alternativeAppIds, app);
    plan.push({
      app,
      criticality: criticality[app.id] || DEFAULT_CRITICALITY,
      alternative: pickRecommendedAlternative(candidates) || null,
    });
  }
  return plan.sort((a, b) => {
    const w = criticalityWeight(b.criticality) - criticalityWeight(a.criticality);
    if (w !== 0) return w;
    return GRADE_POINTS[a.app.grade] - GRADE_POINTS[b.app.grade];
  });
}

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Export CSV (séparateur « ; », lisible par un tableur français). */
export function toCsv(selectedApps, criticality = {}, plan = []) {
  const alternativeOf = new Map(plan.map(p => [p.app.id, p.alternative]));
  const header = ['Outil', 'Éditeur', 'Catégorie', 'Famille', 'Note TrustiScore', 'Criticité', 'Alternative proposée', 'Note de l\'alternative'];
  const rows = (selectedApps || []).map(app => {
    const level = CRITICALITY_LEVELS.find(l => l.id === (criticality[app.id] || DEFAULT_CRITICALITY));
    const alt = alternativeOf.get(app.id);
    return [app.name, app.developer, app.category, familyForCategory(app.category).label, app.grade, level.label, alt?.name, alt?.grade];
  });
  return [header, ...rows].map(r => r.map(csvCell).join(';')).join('\n');
}

export const ORGANISATION_EXPORT_FORMAT = 'trusti-organisation';

/**
 * Fichier d'export JSON (rechargeable avec parseOrganisationImport).
 * Version 2 : ajoute le profil, le nom et les réponses au questionnaire d'audit
 * (champs facultatifs : un fichier version 1 se relit toujours).
 */
export function buildOrganisationExport(selectedIds, criticality, summary, extra = {}) {
  return {
    format: ORGANISATION_EXPORT_FORMAT,
    version: 2,
    exportedAt: new Date().toISOString(),
    selection: selectedIds.map(id => ({ id, criticality: criticality[id] || DEFAULT_CRITICALITY })),
    summary: summary ? { total: summary.total, overallGrade: summary.overallGrade, counts: summary.counts } : null,
    profile: extra.profile || null,
    orgName: extra.orgName || '',
    audit: sanitizeAuditAnswers(extra.audit),
  };
}

/**
 * Lit un fichier exporté. Ne garde que les ids connus du catalogue et les
 * niveaux de criticité valides.
 * @returns {{ids: string[], criticality: Object<string,string>, profile: string|null, orgName: string, audit: Object<string,string>}|null}
 *   null si le fichier n'est pas reconnu
 */
export function parseOrganisationImport(data, knownIds) {
  if (!data || data.format !== ORGANISATION_EXPORT_FORMAT || !Array.isArray(data.selection)) return null;
  const known = new Set((knownIds || []).map(String));
  const levels = new Set(CRITICALITY_LEVELS.map(l => l.id));
  const ids = [];
  const criticality = {};
  for (const item of data.selection) {
    const id = item && String(item.id);
    if (!id || !known.has(id) || ids.includes(id)) continue;
    ids.push(id);
    if (levels.has(item.criticality)) criticality[id] = item.criticality;
  }
  return {
    ids,
    criticality,
    profile: typeof data.profile === 'string' ? data.profile : null,
    orgName: typeof data.orgName === 'string' ? data.orgName.slice(0, 120) : '',
    audit: sanitizeAuditAnswers(data.audit),
  };
}
