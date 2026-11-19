/**
 * API partenaires (/api/v1) : contrat de réponse et validation des paramètres.
 *
 * Fonctions pures (sans base ni réseau), testées dans tests/server/publicApi.test.js.
 * Le format public est volontairement séparé du format interne de /api/apps :
 * l'interface peut évoluer sans casser les partenaires. Tout changement qui
 * retire ou renomme un champ ici exige une /api/v2.
 */

/** Licence des données servies par l'API. Changer ces trois valeurs suffit. */
export const DATA_LICENSE = {
  license: 'CC-BY-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/deed.fr',
  attribution: 'Source : TrustiScore (https://trusti-score.eu)',
};

export const API_VERSION = '1.0.0';
export const PUBLIC_SITE_URL = 'https://app.trusti-score.eu';
export const GRADES = ['A', 'B', 'C', 'D', 'E'];
export const DEFAULT_PER_PAGE = 50;
export const MAX_PER_PAGE = 100;

const bool = (v) => v === true || v === 1 || v === '1' || v === 't' || v === 'true';
const textOrNull = (v) => (typeof v === 'string' && v.trim() ? v : null);
const day = (v) => (v ? String(v).slice(0, 10) : null);

/** Date ISO (AAAA-MM-JJTHH:MM:SSZ) depuis un horodatage Postgres sans fuseau (stocké en UTC). */
function isoTimestamp(v) {
  if (!v) return null;
  const s = String(v).trim().replace(' ', 'T');
  const d = new Date(/[zZ]|[+-]\d{2}(:?\d{2})?$/.test(s) ? s : `${s}Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Ligne brute (applications + résumé d'évaluation) -> app publique.
 * Les champs internes (couleur, popularité, choix de l'équipe, permissions...) ne sortent pas.
 */
export function toPublicApp(row) {
  if (!row) return null;
  const grade = GRADES.includes(row.trusti_score) ? row.trusti_score : null;
  return {
    id: String(row.id),
    name: row.name,
    grade,
    category: textOrNull(row.category),
    developer: textOrNull(row.developer),
    jurisdiction: textOrNull(row.jurisdiction),
    isEuropean: bool(row.is_european),
    isOpenSource: bool(row.is_open_source),
    license: textOrNull(row.license),
    website: textOrNull(row.website),
    icon: typeof row.icon === 'string' && /^https:\/\//.test(row.icon) ? row.icon : null,
    gradeReason: textOrNull(row.reason),
    description: textOrNull(row.description),
    links: {
      playStore: textOrNull(row.play_store_url),
      appStore: textOrNull(row.apple_store_url),
      fDroid: textOrNull(row.f_droid_url),
      github: textOrNull(row.github_url),
      other: textOrNull(row.other_store_url),
    },
    assessment: row.assessed_at
      ? { score: row.score ?? null, provisional: bool(row.provisional), assessedAt: day(row.assessed_at) }
      : null,
    trustiUrl: `${PUBLIC_SITE_URL}/?app=${encodeURIComponent(String(row.id))}`,
    updatedAt: isoTimestamp(row.updated_at),
  };
}

/**
 * Évaluation (format de server/assessment.js) + historique -> évaluation publique.
 * Détail complet : critères, points, niveau, confiance, justification, sources.
 */
export function toPublicAssessment(assessment, gradeHistory = null) {
  if (!assessment) return null;
  return {
    appId: String(assessment.appId),
    grade: assessment.grade,
    score: assessment.score,
    scoreRange: assessment.scoreRange,
    computedGrade: assessment.computedGrade,
    overridden: assessment.overridden,
    provisional: assessment.provisional,
    hasUnverifiedSources: assessment.hasUnverifiedSources,
    assessedAt: assessment.assessedAt,
    summary: assessment.summary,
    criteria: (assessment.criteria || []).map(c => ({
      key: c.key,
      name: c.name,
      weight: c.weight,
      points: c.points,
      level: c.levelTitle,
      levelDescription: c.levelDescription,
      confidence: c.confidence,
      rationale: c.rationale,
      provisional: c.provisional,
      sources: (c.sources || []).map(s => ({ kind: s.kind, url: s.url, quote: s.quote, toConfirm: s.toConfirm })),
    })),
    gradeHistory: gradeHistory
      ? { firstAssessedAt: gradeHistory.firstAssessedAt, changes: gradeHistory.changes }
      : null,
  };
}

/** Erreur de paramètre (400). */
export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.code = 'bad_request';
  }
}

function positiveInt(raw, name, fallback) {
  if (raw === undefined || raw === '') return fallback;
  const s = String(raw);
  if (!/^\d+$/.test(s) || Number(s) < 1) throw new BadRequest(`${name} doit être un entier ≥ 1`);
  return Number(s);
}

function isoDate(raw, name) {
  if (raw === undefined || raw === '') return null;
  const s = String(raw);
  const d = new Date(`${s}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
    throw new BadRequest(`${name} doit être une date AAAA-MM-JJ`);
  }
  return s;
}

/**
 * Paramètres de GET /api/v1/apps -> filtres validés.
 * @throws {BadRequest}
 */
export function parseListQuery(query = {}) {
  const page = positiveInt(query.page, 'page', 1);
  const perPage = positiveInt(query.per_page, 'per_page', DEFAULT_PER_PAGE);
  if (perPage > MAX_PER_PAGE) throw new BadRequest(`per_page vaut au plus ${MAX_PER_PAGE}`);

  let grades = null;
  if (query.grade !== undefined && query.grade !== '') {
    grades = [...new Set(String(query.grade).split(',').map(g => g.trim().toUpperCase()).filter(Boolean))];
    if (grades.some(g => !GRADES.includes(g))) throw new BadRequest('grade accepte A, B, C, D, E (séparés par des virgules)');
  }

  const category = query.category !== undefined ? String(query.category).trim().slice(0, 100) || null : null;
  const q = query.q !== undefined ? String(query.q).trim().slice(0, 100) || null : null;
  if (q !== null && q.length < 2) throw new BadRequest('q doit faire au moins 2 caractères');

  return {
    page,
    perPage,
    grades,
    category,
    q,
    updatedSince: isoDate(query.updated_since, 'updated_since'),
    limit: perPage,
    offset: (page - 1) * perPage,
  };
}

/** Enveloppe commune : { data, meta } avec licence et attribution. */
export function envelope(data, extraMeta = {}) {
  return { data, meta: { apiVersion: API_VERSION, ...DATA_LICENSE, ...extraMeta } };
}

export function paginationMeta({ page, perPage }, total) {
  return { pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) } };
}

export function errorBody(code, message) {
  return { error: { code, message } };
}
