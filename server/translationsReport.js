/**
 * Rapport de couverture des traductions du contenu en base (table `content_translations`).
 *
 * Fonctions pures, testables sans base : on leur passe les lignes du catalogue français
 * et les lignes de traduction, elles disent ce qui manque, ce qui est périmé (le français
 * a changé depuis : `source_hash` différent) et ce qui est orphelin (fiche supprimée).
 * L'empreinte et la forme des champs sont exactement celles de server/contentTranslations.js,
 * que l'API utilise pour décider d'afficher ou non une traduction.
 *
 * Utilisé par scripts/translations-report.js.
 */
import { CONTENT_LANGUAGES, sourceHash } from './contentTranslations.js';

const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';

/** Critères d'une évaluation : objet { clé: { rationale } } (base) ou liste [{ key, rationale }] (API). */
function criteriaEntries(criteria) {
  if (Array.isArray(criteria)) return criteria.filter(c => c && c.key).map(c => [c.key, c]);
  if (criteria && typeof criteria === 'object') return Object.entries(criteria);
  return [];
}

/** Texte d'une note : chaîne, ou objet { text, level } (le niveau reste celui du français). */
const noteText = (n) => (n && typeof n === 'object' ? n.text : n);

/**
 * Tout ce qui doit exister en anglais et en allemand.
 * @param {{ apps?: object[], assessments?: object[], guides?: object[] }} catalogue
 *   apps : { id, reason, description, team_pick_reason }
 *   assessments : { app_id, criteria }
 *   guides : { app_id, direction, summary, steps, notes, direct_export }
 * @returns {{ entity: string, entityId: string, field: string, hash: string, kind: 'text'|'list', length?: number }[]}
 */
export function expectedTranslations({ apps = [], assessments = [], guides = [] } = {}) {
  const out = [];
  const add = (entity, entityId, field, fr) => {
    if (Array.isArray(fr)) {
      if (fr.length) out.push({ entity, entityId: String(entityId), field, hash: sourceHash(fr), kind: 'list', length: fr.length });
    } else if (nonEmpty(fr)) {
      out.push({ entity, entityId: String(entityId), field, hash: sourceHash(fr), kind: 'text' });
    }
  };

  for (const a of apps) {
    add('application', a.id, 'reason', a.reason);
    add('application', a.id, 'description', a.description);
    add('application', a.id, 'teamPickReason', a.team_pick_reason ?? a.teamPickReason);
  }
  for (const s of assessments) {
    for (const [key, c] of criteriaEntries(s.criteria)) add('assessment', s.app_id, `rationale.${key}`, c?.rationale);
  }
  for (const g of guides) {
    const id = `${g.app_id}:${g.direction}`;
    add('migration_guide', id, 'summary', g.summary);
    add('migration_guide', id, 'steps', Array.isArray(g.steps) ? g.steps : []);
    add('migration_guide', id, 'notes', (Array.isArray(g.notes) ? g.notes : []).map(noteText).filter(nonEmpty));
    // Export direct : seule la phrase est stockée, sous `<id alternative>:import`.
    if (g.direction === 'import') add('migration_guide', id, 'directExport', g.direct_export);
  }
  return out;
}

const keyOf = (entity, entityId, field, lang) => `${entity}|${entityId}|${field}|${lang}`;

/** Parse la valeur d'une ligne (jsonb renvoyé tel quel ou en chaîne JSON). */
function valueOf(row) {
  const v = row.value;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
}

/** Famille d'un champ pour le rapport : `rationale.controle` et `rationale.localisation` → `rationale.*`. */
export const fieldFamily = (field) => (field.startsWith('rationale.') ? 'rationale.*' : field);

/**
 * Compare l'attendu aux lignes de `content_translations`.
 * status : 'ok' | 'missing' | 'stale' (empreinte différente) | 'invalid' (liste de longueur
 * différente ou valeur vide : l'API l'ignorerait et afficherait le français).
 * @returns {{ rows: object[], summary: object[], orphans: object[], complete: boolean }}
 */
export function compareTranslations(expected, translations, langs = CONTENT_LANGUAGES) {
  const byKey = new Map();
  for (const r of translations || []) byKey.set(keyOf(r.entity, String(r.entity_id), r.field, r.lang), r);

  const rows = [];
  const expectedKeys = new Set();
  for (const e of expected) {
    for (const lang of langs) {
      const k = keyOf(e.entity, e.entityId, e.field, lang);
      expectedKeys.add(k);
      const t = byKey.get(k);
      let status = 'ok';
      if (!t) status = 'missing';
      else if (t.source_hash !== e.hash) status = 'stale';
      else {
        const v = valueOf(t);
        const valid = e.kind === 'list'
          ? Array.isArray(v) && v.length === e.length && v.every(nonEmpty)
          : nonEmpty(v);
        if (!valid) status = 'invalid';
      }
      rows.push({ entity: e.entity, entityId: e.entityId, field: e.field, lang, status });
    }
  }

  const groups = new Map();
  for (const r of rows) {
    const g = `${r.entity}|${fieldFamily(r.field)}|${r.lang}`;
    if (!groups.has(g)) groups.set(g, { entity: r.entity, field: fieldFamily(r.field), lang: r.lang, expected: 0, ok: 0, missing: 0, stale: 0, invalid: 0 });
    const s = groups.get(g);
    s.expected += 1;
    s[r.status] += 1;
  }
  const summary = [...groups.values()].sort((a, b) =>
    a.entity.localeCompare(b.entity) || a.field.localeCompare(b.field) || a.lang.localeCompare(b.lang));

  const orphans = [];
  for (const r of translations || []) {
    if (!langs.includes(r.lang)) continue;
    if (!expectedKeys.has(keyOf(r.entity, String(r.entity_id), r.field, r.lang))) {
      orphans.push({ entity: r.entity, entityId: String(r.entity_id), field: r.field, lang: r.lang });
    }
  }

  return { rows, summary, orphans, complete: rows.every(r => r.status === 'ok') };
}
