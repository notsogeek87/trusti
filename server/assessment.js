/**
 * Mise en forme du détail d'évaluation TrustiScore d'une app, lu dans la table
 * `app_assessments` (alimentée depuis le dépôt trustillm, voir
 * migrations/001_app_assessments.sql dans ce dépôt).
 *
 * Fonctions pures, sans accès base : testables seules (tests/server/assessment.test.js).
 */

// Ordre d'affichage des critères (celui de la grille TrustiScore).
const CRITERIA_ORDER = ['controle', 'conformite', 'gouvernance', 'localisation', 'transparence'];

/** « Dép. fortes : dépendances fortes… » -> { title: 'Dép. fortes', description: 'dépendances fortes…' } */
function splitLevelLabel(label) {
  if (!label) return { title: null, description: null };
  const i = label.indexOf(' : ');
  if (i === -1) return { title: label, description: null };
  return { title: label.slice(0, i), description: label.slice(i + 3) };
}

function formatSource(s) {
  return {
    kind: s.kind,
    url: s.url || null,
    quote: s.quote || null,
    // Source « background » : connaissance générale non vérifiée -> à afficher « à confirmer ».
    toConfirm: Boolean(s.to_confirm) || s.kind === 'background',
  };
}

function formatCriterion(key, c) {
  const level = splitLevelLabel(c.level_label);
  return {
    key,
    name: c.name || key,
    weight: c.weight ?? null,
    points: c.points ?? null,
    levelTitle: level.title,
    levelDescription: level.description,
    confidence: c.confidence || null,
    rationale: c.rationale || null,
    provisional: Boolean(c.provisional),
    sources: (c.sources || []).map(formatSource),
  };
}

/**
 * @param {object|null} row ligne de app_assessments
 * @returns {object|null} détail prêt pour l'interface, ou null si l'app n'est pas évaluée
 */
export function formatAssessmentFromDB(row) {
  if (!row) return null;
  const raw = row.criteria && typeof row.criteria === 'object' ? row.criteria : {};
  const keys = [
    ...CRITERIA_ORDER.filter(k => k in raw),
    ...Object.keys(raw).filter(k => !CRITERIA_ORDER.includes(k)),
  ];
  return {
    appId: row.app_id,
    grade: row.grade,
    score: row.score ?? null,
    scoreRange: row.score_range || null,
    computedGrade: row.computed_grade || null,
    overridden: Boolean(row.overridden),
    provisional: Boolean(row.provisional),
    hasUnverifiedSources: Boolean(row.has_unverified_sources),
    assessedAt: row.assessed_at ? String(row.assessed_at).slice(0, 10) : null,
    summary: row.summary || null,
    criteria: keys.map(k => formatCriterion(k, raw[k])),
  };
}
