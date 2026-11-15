/**
 * Traductions du contenu en base (table `content_translations`, voir
 * server/database/migrations/2026-11-15-content-translations.sql).
 *
 * Le français reste la source dans les tables d'origine. Pour `?lang=en|de`, l'API
 * superpose les traductions trouvées ; tout champ sans traduction, ou dont la
 * traduction est périmée (le français a changé depuis : `source_hash` différent),
 * reste en français. Si la table n'existe pas encore, tout reste en français.
 *
 * Les fonctions `apply*` sont pures (testables sans base) : elles reçoivent un index
 * Map<"entity|entityId|field", { value, sourceHash }>.
 */
import { createHash } from 'node:crypto';

export const CONTENT_LANGUAGES = ['en', 'de'];

/** 'en' / 'de' si demandé et pris en charge, sinon null (= français, rien à faire). */
export function normalizeContentLang(raw) {
  const lang = String(raw || '').trim().toLowerCase().slice(0, 2);
  return CONTENT_LANGUAGES.includes(lang) ? lang : null;
}

/** Empreinte du texte français traduit : md5 de la chaîne, ou du JSON pour une liste. */
export function sourceHash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  return createHash('md5').update(text).digest('hex');
}

const keyOf = (entity, entityId, field) => `${entity}|${entityId}|${field}`;

export function indexTranslations(rows) {
  const index = new Map();
  for (const r of rows || []) {
    if (!r) continue;
    let value = r.value;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { /* chaîne brute */ }
    }
    index.set(keyOf(r.entity, String(r.entity_id), r.field), { value, sourceHash: r.source_hash });
  }
  return index;
}

/** Valeur traduite si elle existe, est à jour et a le bon type ; sinon le français. */
function pick(index, entity, entityId, field, frValue) {
  if (frValue === null || frValue === undefined || frValue === '') return frValue;
  const t = index.get(keyOf(entity, String(entityId), field));
  if (!t || t.sourceHash !== sourceHash(frValue)) return frValue;
  if (typeof frValue === 'string') return typeof t.value === 'string' && t.value.trim() ? t.value : frValue;
  if (Array.isArray(frValue)) {
    return Array.isArray(t.value) && t.value.length === frValue.length && t.value.every(v => typeof v === 'string')
      ? t.value
      : frValue;
  }
  return frValue;
}

export function applyAppTranslations(app, index) {
  if (!app || app.id === undefined || app.id === null) return app;
  const out = { ...app };
  for (const field of ['reason', 'description', 'teamPickReason']) {
    if (field in out) out[field] = pick(index, 'application', app.id, field, out[field]);
  }
  return out;
}

export function applyAssessmentTranslations(assessment, index) {
  if (!assessment || assessment.appId === undefined) return assessment;
  const id = assessment.appId;
  return {
    ...assessment,
    summary: pick(index, 'assessment', id, 'summary', assessment.summary),
    criteria: Array.isArray(assessment.criteria)
      ? assessment.criteria.map(c => ({ ...c, rationale: pick(index, 'assessment', id, `rationale.${c.key}`, c.rationale) }))
      : assessment.criteria,
  };
}

/** Une section de guide (summary, steps, notes) ; les notes gardent leur niveau français. */
function applySection(section, index, entityId) {
  if (!section) return section;
  const frNotes = Array.isArray(section.notes) ? section.notes.map(n => n.text) : [];
  const notes = pick(index, 'migration_guide', entityId, 'notes', frNotes);
  return {
    ...section,
    summary: pick(index, 'migration_guide', entityId, 'summary', section.summary),
    steps: pick(index, 'migration_guide', entityId, 'steps', section.steps),
    notes: Array.isArray(section.notes) ? section.notes.map((n, i) => ({ ...n, text: notes[i] })) : section.notes,
  };
}

/**
 * Guide fromId -> toId. Export direct (`direct_export` de l'alternative) : seule la
 * phrase est stockée, sous `${toId}:import` / `directExport`.
 */
export function applyGuideTranslations(guide, index, fromId, toId) {
  if (!guide) return guide;
  const exportId = `${fromId}:export`;
  const importId = `${toId}:import`;
  let exp = guide.export;
  if (exp && exp.steps?.length === 0 && exp.notes?.length === 0 && exp.source === null
    && index.has(keyOf('migration_guide', importId, 'directExport'))) {
    exp = { ...exp, summary: pick(index, 'migration_guide', importId, 'directExport', exp.summary) };
  } else {
    exp = applySection(exp, index, exportId);
  }
  return { ...guide, export: exp, import: applySection(guide.import, index, importId) };
}

/** Ids des entités présentes dans une réponse de /api/apps. */
export function collectEntityIds(body, query = {}) {
  const ids = { application: new Set(), assessment: new Set(), migration_guide: new Set() };
  const addApp = (a) => { if (a && a.id !== undefined && a.id !== null) ids.application.add(String(a.id)); };
  if (Array.isArray(body?.apps)) body.apps.forEach(addApp);
  if (body?.app) addApp(body.app);
  if (Array.isArray(body?.alternatives)) body.alternatives.forEach(addApp);
  if (body?.assessment?.appId !== undefined) ids.assessment.add(String(body.assessment.appId));
  if (body?.guide && query.migration_guide_from && query.migration_guide_to) {
    ids.migration_guide.add(`${query.migration_guide_from}:export`);
    ids.migration_guide.add(`${query.migration_guide_to}:import`);
  }
  return ids;
}

/** Applique un index à une réponse de /api/apps (forme { apps, app, alternatives, assessment, guide }). */
export function applyToApiBody(body, index, query = {}) {
  if (!body || typeof body !== 'object' || index.size === 0) return body;
  const out = { ...body };
  if (Array.isArray(out.apps)) out.apps = out.apps.map(a => applyAppTranslations(a, index));
  if (out.app) out.app = applyAppTranslations(out.app, index);
  if (Array.isArray(out.alternatives)) out.alternatives = out.alternatives.map(a => applyAppTranslations(a, index));
  if (out.assessment) out.assessment = applyAssessmentTranslations(out.assessment, index);
  if (out.guide && query.migration_guide_from && query.migration_guide_to) {
    out.guide = applyGuideTranslations(out.guide, index, query.migration_guide_from, query.migration_guide_to);
  }
  return out;
}

let tableMissing = false;

/**
 * Lit les traductions utiles en une requête et les superpose à la réponse.
 * Toute erreur (table absente, base indisponible) laisse la réponse en français.
 */
export async function translateApiBody(body, lang, query = {}, loadSql = async () => (await import('./database/sql.js')).default) {
  if (!lang || tableMissing || !body || body.success === false) return body;
  const ids = collectEntityIds(body, query);
  const total = ids.application.size + ids.assessment.size + ids.migration_guide.size;
  if (total === 0) return body;
  try {
    const sql = await loadSql();
    const rows = await sql`
      SELECT entity, entity_id, field, value, source_hash
      FROM content_translations
      WHERE lang = ${lang}
        AND ((entity = 'application' AND entity_id = ANY(${[...ids.application]}))
          OR (entity = 'assessment' AND entity_id = ANY(${[...ids.assessment]}))
          OR (entity = 'migration_guide' AND entity_id = ANY(${[...ids.migration_guide]})))`;
    return applyToApiBody(body, indexTranslations(rows), query);
  } catch (error) {
    if (/content_translations/.test(String(error?.message)) && /exist/.test(String(error?.message))) tableMissing = true;
    else console.warn('[contentTranslations] traductions ignorées :', error?.message);
    return body;
  }
}
