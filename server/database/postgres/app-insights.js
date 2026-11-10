/**
 * Données associées aux apps : évaluations TrustiScore, historique des
 * notes, guides de migration, suggestions d'outils manquants.
 */
import { formatAssessmentFromDB } from '../../assessment.js';
import { collapseGradeChanges, buildGradeTimeline } from '../../gradeChanges.js';
import { buildTransferGuide } from '../../migrationGuides.js';
import { sql } from './client.js';

// Plafond de suggestions distinctes en attente : borne la table si un robot
// envoie des noms au hasard (une suggestion déjà connue est toujours acceptée).
export const MAX_PENDING_SUGGESTIONS = 2000;

/**
 * Enregistre une suggestion d'outil manquant (table tool_suggestions).
 * Une suggestion déjà reçue incrémente son compteur au lieu de créer une ligne.
 * @param {{nameKey: string, name: string, website: string|null, comment: string|null}} s valeurs validées
 * @returns {Promise<boolean>} false si le plafond de nouvelles suggestions est atteint
 */
export async function saveToolSuggestion(s) {
  const rows = await sql`
    INSERT INTO tool_suggestions (name_key, name, website, comment)
    SELECT ${s.nameKey}, ${s.name}, ${s.website}, ${s.comment}
    WHERE EXISTS (SELECT 1 FROM tool_suggestions WHERE name_key = ${s.nameKey})
       OR (SELECT COUNT(*) FROM tool_suggestions WHERE status = 'new') < ${MAX_PENDING_SUGGESTIONS}
    ON CONFLICT (name_key) DO UPDATE SET
      count = tool_suggestions.count + 1,
      last_at = now(),
      website = COALESCE(tool_suggestions.website, EXCLUDED.website),
      comment = COALESCE(tool_suggestions.comment, EXCLUDED.comment)
    RETURNING name_key
  `;
  return rows.length > 0;
}

/**
 * Détail d'évaluation TrustiScore d'une app (table app_assessments), ou null
 * si l'app n'a pas encore été évaluée ou si la table n'existe pas encore.
 */
export async function getAssessmentForApp(id) {
  try {
    const rows = await sql`
      SELECT app_id, grade, score, computed_grade, overridden, provisional,
             score_range, has_unverified_sources, summary, criteria,
             assessed_at::text AS assessed_at
      FROM app_assessments
      WHERE app_id = ${String(id)}
      LIMIT 1
    `;
    return formatAssessmentFromDB(rows[0]);
  } catch (error) {
    // 42P01 : table absente (base pas encore migrée) -> pas de détail, pas d'erreur.
    if (error?.code === '42P01') return null;
    console.error('Error getting assessment:', error);
    throw error;
  }
}

/**
 * Historique des notes d'une app (table app_assessment_history) : date de
 * première évaluation et changements de note. Vide si la table n'existe pas.
 */
export async function getGradeHistoryForApp(id) {
  try {
    const rows = await sql`
      SELECT grade, previous_grade, assessed_at::text AS assessed_at
      FROM app_assessment_history
      WHERE app_id = ${String(id)}
      ORDER BY assessed_at ASC
    `;
    return buildGradeTimeline(rows);
  } catch (error) {
    if (error?.code === '42P01') return buildGradeTimeline([]);
    console.error('Error getting grade history:', error);
    throw error;
  }
}

/**
 * Changements de note de tout le catalogue depuis `since` (AAAA-MM-JJ, inclus),
 * un changement net par app (voir collapseGradeChanges). Public et identique
 * pour tous : chaque appareil compare ensuite avec ses propres apps, en local.
 */
export async function getGradeChangesSince(since) {
  try {
    const rows = await sql`
      SELECT h.app_id, a.name, h.grade, h.previous_grade, h.assessed_at::text AS assessed_at
      FROM app_assessment_history h
      JOIN applications a ON a.id = h.app_id
      WHERE h.assessed_at >= ${since}::date
      ORDER BY h.assessed_at ASC
      LIMIT 5000
    `;
    return collapseGradeChanges(rows);
  } catch (error) {
    if (error?.code === '42P01') return [];
    console.error('Error getting grade changes:', error);
    throw error;
  }
}

/**
 * Guide de migration fromId -> toId (table app_migration_guides) : export depuis l'app
 * quittée, import dans l'alternative. Sections à null si aucun guide (ou table absente).
 */
export async function getMigrationGuide(fromId, toId) {
  try {
    const rows = await sql`
      SELECT app_id, direction, summary, steps, notes, direct_from, direct_export,
             source_url, checked_at::text AS checked_at, verified
      FROM app_migration_guides
      WHERE (app_id = ${String(fromId)} AND direction = 'export')
         OR (app_id = ${String(toId)} AND direction = 'import')
    `;
    return buildTransferGuide(rows, fromId, toId);
  } catch (error) {
    if (error?.code === '42P01') return buildTransferGuide([], fromId, toId);
    console.error('Error getting migration guide:', error);
    throw error;
  }
}
