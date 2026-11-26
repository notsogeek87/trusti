/**
 * Lectures de l'API partenaires (/api/v1, voir server/publicApi/).
 *
 * Renvoie des lignes brutes (colonnes de `applications` + résumé de
 * `app_assessments`) : la mise en forme publique est faite par
 * server/publicApi/format.js, qui ne laisse sortir que les champs du contrat.
 */
import { sql } from './client.js';
import { escapeLike } from './app-format.js';
import { formatAssessmentFromDB } from '../../assessment.js';

/**
 * Liste filtrée et paginée, triée par nom.
 * @param {{grades: string[]|null, category: string|null, q: string|null, updatedSince: string|null, limit: number, offset: number}} f
 * @returns {Promise<{rows: object[], total: number}>}
 */
export async function listPublicApps(f) {
  const grades = f.grades && f.grades.length ? f.grades : null;
  const category = f.category || null;
  const categoryPrefix = category ? `${escapeLike(category)} / %` : null;
  const pattern = f.q ? `%${escapeLike(f.q)}%` : null;
  const since = f.updatedSince || null;

  const [rows, count] = await Promise.all([
    sql`
      SELECT a.id, a.name, a.trusti_score, a.category, a.developer, a.jurisdiction,
             a.is_european, a.is_open_source, a.license, a.website, a.icon, a.reason,
             a.description, a.play_store_url, a.apple_store_url, a.f_droid_url,
             a.github_url, a.other_store_url, a.updated_at::text AS updated_at,
             s.score, s.provisional, s.assessed_at::text AS assessed_at
      FROM applications a
      LEFT JOIN app_assessments s ON s.app_id = a.id
      WHERE (${grades}::text[] IS NULL OR a.trusti_score = ANY(${grades}::text[]))
        AND (${category}::text IS NULL OR a.category = ${category}::text OR a.category LIKE ${categoryPrefix}::text)
        AND (${pattern}::text IS NULL OR a.name ILIKE ${pattern}::text)
        AND (${since}::date IS NULL OR GREATEST(a.updated_at, s.updated_at) >= ${since}::date)
      ORDER BY a.name ASC, a.id ASC
      LIMIT ${f.limit} OFFSET ${f.offset}
    `,
    sql`
      SELECT COUNT(*) AS count
      FROM applications a
      LEFT JOIN app_assessments s ON s.app_id = a.id
      WHERE (${grades}::text[] IS NULL OR a.trusti_score = ANY(${grades}::text[]))
        AND (${category}::text IS NULL OR a.category = ${category}::text OR a.category LIKE ${categoryPrefix}::text)
        AND (${pattern}::text IS NULL OR a.name ILIKE ${pattern}::text)
        AND (${since}::date IS NULL OR GREATEST(a.updated_at, s.updated_at) >= ${since}::date)
    `,
  ]);
  return { rows, total: parseInt(count[0].count, 10) };
}

/** Apps par ids (ordre : nom), mêmes colonnes que la liste. */
export async function getPublicAppsByIds(ids) {
  const list = (ids || []).map(String);
  if (list.length === 0) return [];
  return sql`
    SELECT a.id, a.name, a.trusti_score, a.category, a.developer, a.jurisdiction,
           a.is_european, a.is_open_source, a.license, a.website, a.icon, a.reason,
           a.description, a.play_store_url, a.apple_store_url, a.f_droid_url,
           a.github_url, a.other_store_url, a.updated_at::text AS updated_at,
           s.score, s.provisional, s.assessed_at::text AS assessed_at
    FROM applications a
    LEFT JOIN app_assessments s ON s.app_id = a.id
    WHERE a.id = ANY(${list}::text[])
    ORDER BY a.name ASC, a.id ASC
  `;
}

/** Catégories et nombre d'apps par catégorie. */
export async function getPublicCategories() {
  const rows = await sql`
    SELECT category, COUNT(*) AS count
    FROM applications
    WHERE category IS NOT NULL AND category <> ''
    GROUP BY category
    ORDER BY category ASC
  `;
  return rows.map(r => ({ name: r.category, count: parseInt(r.count, 10) }));
}

/** Toutes les évaluations détaillées, indexées par id d'app (export complet). */
export async function getAllAssessments() {
  const rows = await sql`
    SELECT app_id, grade, score, computed_grade, overridden, provisional,
           score_range, has_unverified_sources, summary, criteria,
           assessed_at::text AS assessed_at,
           to_jsonb(app_assessments) -> 'facts' AS facts
    FROM app_assessments
  `;
  const map = new Map();
  for (const row of rows) map.set(String(row.app_id), formatAssessmentFromDB(row));
  return map;
}
