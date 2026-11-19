/**
 * Événements des apps (table app_events, voir server/appEvents.js).
 * Table absente (migration pas encore appliquée) : lectures vides, sans erreur.
 */
import { formatEvent, formatEventForReview } from '../../appEvents.js';
import { sql } from './client.js';

const MISSING_TABLE = '42P01';
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Événements publiés depuis `since` (AAAA-MM-JJ, inclus, date de publication) pour tout
 * le catalogue. Public et identique pour tous : l'appareil garde ceux de ses apps, en local.
 */
export async function getEventsSince(since) {
  try {
    const rows = await sql`
      SELECT e.id, e.app_id, a.name AS app_name, e.type, e.impact, e.severity, e.title, e.summary,
             e.source_url, e.event_date::text AS event_date, e.published_at::text AS published_at
      FROM app_events e
      JOIN applications a ON a.id = e.app_id
      WHERE e.status = 'published' AND e.published_at >= ${since}::date
      ORDER BY e.published_at DESC, e.id DESC
      LIMIT 500
    `;
    return rows.map(formatEvent);
  } catch (error) {
    if (error?.code === MISSING_TABLE) return [];
    console.error('Error getting app events:', error);
    throw error;
  }
}

/** Événements publiés d'une app (fiche), du plus récent au plus ancien. */
export async function getEventsForApp(id) {
  try {
    const rows = await sql`
      SELECT e.id, e.app_id, a.name AS app_name, e.type, e.impact, e.severity, e.title, e.summary,
             e.source_url, e.event_date::text AS event_date, e.published_at::text AS published_at
      FROM app_events e
      JOIN applications a ON a.id = e.app_id
      WHERE e.app_id = ${String(id)} AND e.status = 'published'
      ORDER BY e.event_date DESC, e.id DESC
      LIMIT 20
    `;
    return rows.map(formatEvent);
  } catch (error) {
    if (error?.code === MISSING_TABLE) return [];
    console.error('Error getting app events for app:', error);
    throw error;
  }
}

/** Propositions en attente de validation (revue), les plus anciennes d'abord. */
export async function getProposedEvents() {
  const rows = await sql`
    SELECT e.id, e.app_id, a.name AS app_name, e.type, e.impact, e.severity, e.title, e.summary,
           e.source_url, e.event_date::text AS event_date, e.published_at::text AS published_at,
           e.status, e.proposed_by, e.created_at::text AS created_at
    FROM app_events e
    JOIN applications a ON a.id = e.app_id
    WHERE e.status = 'proposed'
    ORDER BY e.created_at ASC
    LIMIT 200
  `;
  return rows.map(formatEventForReview);
}

/**
 * Enregistre une proposition (valeurs déjà validées par validateEventProposal).
 * @returns {Promise<{ id: string|null, duplicate: boolean, unknownApp: boolean }>}
 */
export async function proposeAppEvent(e) {
  try {
    const rows = await sql`
      INSERT INTO app_events (app_id, type, impact, severity, title, summary, source_url, event_date, proposed_by)
      VALUES (${e.appId}, ${e.type}, ${e.impact}, ${e.severity}, ${e.title}, ${e.summary},
              ${e.sourceUrl}, ${e.eventDate}::date, ${e.proposedBy})
      ON CONFLICT (app_id, source_url) DO NOTHING
      RETURNING id
    `;
    if (rows.length === 0) return { id: null, duplicate: true, unknownApp: false };
    return { id: String(rows[0].id), duplicate: false, unknownApp: false };
  } catch (error) {
    if (error?.code === FOREIGN_KEY_VIOLATION) return { id: null, duplicate: false, unknownApp: true };
    throw error;
  }
}

/**
 * Publie ou rejette un événement. La date de publication est fixée à la première
 * publication (c'est elle que les téléphones comparent pour savoir quoi notifier).
 * @returns {Promise<object|null>} l'événement mis à jour, ou null s'il n'existe pas
 */
export async function setAppEventStatus(id, status) {
  const rows = await sql`
    UPDATE app_events
    SET status = ${status},
        published_at = CASE WHEN ${status} = 'published' THEN COALESCE(published_at, now()) ELSE published_at END
    WHERE id = ${id}
    RETURNING id, app_id, type, impact, severity, title, summary, source_url,
              event_date::text AS event_date, published_at::text AS published_at,
              status, proposed_by, created_at::text AS created_at
  `;
  return rows[0] ? formatEventForReview(rows[0]) : null;
}
