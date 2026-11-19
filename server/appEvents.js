/**
 * Événements des apps (table `app_events`) : fuite de données, rachat, changement de
 * politique, passage en open source… Un événement peut être négatif, neutre ou positif.
 *
 * Cycle de vie : la veille (workflow n8n) PROPOSE un événement (status = 'proposed') ;
 * il n'est visible du public qu'une fois PUBLIÉ après validation humaine.
 *
 * Fonctions pures, sans accès base : testables seules (tests/server/appEvents.test.js).
 * Voir docs/guides/notifications.md.
 */

export const EVENT_TYPES = [
  'incident',            // fuite de données, faille, sanction CNIL / RGPD
  'acquisition',         // rachat, fusion
  'policy_change',       // CGU, politique de confidentialité, publicité
  'jurisdiction_change', // changement de juridiction ou d'hébergement
  'open_source',         // passage en open source
  'closed_source',       // retour en code fermé
  'audit',               // audit de sécurité publié
  'shutdown',            // fermeture du service
  'other',
];
export const EVENT_IMPACTS = ['negative', 'neutral', 'positive'];
export const EVENT_SEVERITIES = ['low', 'medium', 'high'];
export const EVENT_STATUSES = ['proposed', 'published', 'rejected'];

const DAY_MS = 24 * 60 * 60 * 1000;
const toDay = (value) => (value ? String(value).slice(0, 10) : null);
const isoDay = (date) => date.toISOString().slice(0, 10);

/** Ligne SQL -> objet de l'API (le statut et l'auteur de la proposition restent internes). */
export function formatEvent(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    appId: String(row.app_id),
    appName: row.app_name || row.name || String(row.app_id),
    type: EVENT_TYPES.includes(row.type) ? row.type : 'other',
    impact: EVENT_IMPACTS.includes(row.impact) ? row.impact : 'neutral',
    severity: EVENT_SEVERITIES.includes(row.severity) ? row.severity : 'medium',
    title: row.title || '',
    summary: row.summary || null,
    sourceUrl: row.source_url || null,
    date: toDay(row.event_date),
    publishedAt: toDay(row.published_at),
  };
}

/** Ligne SQL -> objet pour la revue (proposition en attente) : ajoute statut et auteur. */
export function formatEventForReview(row) {
  const event = formatEvent(row);
  if (!event) return null;
  return { ...event, status: row.status, proposedBy: row.proposed_by || null, createdAt: toDay(row.created_at) };
}

const cleanText = (value, max) => {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : null;
};

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isValidDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && isoDay(parsed) === value;
}

/**
 * Valide une proposition d'événement (POST /api/app-events, réservé à la veille).
 * Accepte les noms snake_case (app_id, source_url, event_date) ou camelCase.
 * @returns {{ ok: true, value: object } | { ok: false, error: string }}
 */
export function validateEventProposal(body, now = new Date()) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Corps JSON attendu' };
  const appId = cleanText(body.app_id ?? body.appId, 100);
  const type = cleanText(body.type, 40);
  const impact = cleanText(body.impact, 20);
  const severity = cleanText(body.severity, 20) || 'medium';
  const title = cleanText(body.title, 200);
  const summary = cleanText(body.summary, 1000);
  const sourceUrl = cleanText(body.source_url ?? body.sourceUrl, 500);
  const eventDate = cleanText(body.event_date ?? body.eventDate ?? body.date, 10);
  const proposedBy = cleanText(body.proposed_by ?? body.proposedBy, 100);

  if (!appId) return { ok: false, error: 'app_id est requis' };
  if (!EVENT_TYPES.includes(type)) return { ok: false, error: `type doit valoir : ${EVENT_TYPES.join(', ')}` };
  if (!EVENT_IMPACTS.includes(impact)) return { ok: false, error: `impact doit valoir : ${EVENT_IMPACTS.join(', ')}` };
  if (!EVENT_SEVERITIES.includes(severity)) return { ok: false, error: `severity doit valoir : ${EVENT_SEVERITIES.join(', ')}` };
  if (!title || title.length < 3) return { ok: false, error: 'title est requis (3 caractères au moins)' };
  if (!sourceUrl || !isHttpsUrl(sourceUrl)) return { ok: false, error: 'source_url doit être une adresse https' };
  if (!eventDate || !isValidDay(eventDate)) return { ok: false, error: 'event_date doit être une date AAAA-MM-JJ' };
  // Un jour de marge pour les fuseaux horaires ; au-delà, c'est une erreur de saisie.
  if (eventDate > isoDay(new Date(now.getTime() + DAY_MS))) return { ok: false, error: 'event_date est dans le futur' };

  return { ok: true, value: { appId, type, impact, severity, title, summary, sourceUrl, eventDate, proposedBy } };
}

/**
 * Valide un changement de statut (PATCH /api/app-events) : publication ou rejet.
 * @returns {{ ok: true, value: { id: number, status: string } } | { ok: false, error: string }}
 */
export function validateStatusChange(body) {
  const id = Number(body?.id);
  const status = cleanText(body?.status, 20);
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'id doit être un entier positif' };
  if (!EVENT_STATUSES.includes(status)) return { ok: false, error: `status doit valoir : ${EVENT_STATUSES.join(', ')}` };
  return { ok: true, value: { id, status } };
}
