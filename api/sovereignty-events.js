import { sql } from '../server/database/postgres/client.js';
import { isAuthorizedAdminRequest } from '../server/adminToken.js';
import { parseSince } from '../server/gradeChanges.js';
import { validateEventProposal, validateStatusChange } from '../server/appEvents.js';

function format(row, internal = false) {
  const { id, type, impact, severity, title, summary, source_url, event_date, published_at, status, proposed_by } = row;
  return { id: String(id), type, impact, severity, title, summary, sourceUrl: source_url, date: event_date, publishedAt: published_at, ...(internal ? { status, proposedBy: proposed_by } : {}) };
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const admin = isAuthorizedAdminRequest(req);
  const { since, status } = req.query || {};
  const fail = (code, error) => res.status(code).json({ success: false, error });
  try {
    if (req.method === 'GET') {
      if (status !== undefined) {
        if (!admin) return fail(401, 'Unauthorized');
        if (status !== 'proposed') return fail(400, 'status=proposed attendu');
        const rows = await sql`SELECT id, type, impact, severity, title, summary, source_url,
                 event_date::text AS event_date, published_at::text AS published_at, status, proposed_by FROM sovereignty_events WHERE status = 'proposed' ORDER BY created_at LIMIT 200`;
        return res.status(200).json({ success: true, events: rows.map(row => format(row, true)) });
      }
      const day = parseSince(since);
      if (!day) return fail(400, 'since doit être une date AAAA-MM-JJ');
      const rows = await sql`SELECT id, type, impact, severity, title, summary, source_url,
                 event_date::text AS event_date, published_at::text AS published_at, status, proposed_by FROM sovereignty_events WHERE status = 'published' AND published_at >= ${day}::date ORDER BY sovereignty_events.published_at DESC, id DESC LIMIT 500`;
      return res.status(200).json({ success: true, since: day, events: rows.map(row => format(row)) });
    }
    if (!['POST', 'PATCH'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST, PATCH, OPTIONS');
      return fail(405, 'Method not allowed');
    }
    if (!admin) return fail(401, 'Unauthorized');
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return fail(400, 'Corps JSON attendu'); } }
    if (req.method === 'POST') {
      if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'Corps JSON attendu');
      const fields = ['type', 'impact', 'severity', 'title', 'summary', 'source_url', 'sourceUrl',
        'event_date', 'eventDate', 'date', 'proposed_by', 'proposedBy'];
      if (fields.some(field => body[field] != null && typeof body[field] !== 'string')) {
        return fail(400, 'Champs texte attendus');
      }
      const date = body.event_date ?? body.eventDate ?? body.date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return fail(400, 'event_date doit être une date AAAA-MM-JJ');
      const check = validateEventProposal(body, new Date(), { requireApp: false });
      if (!check.ok) return fail(400, check.error);
      const e = check.value;
      const rows = await sql`INSERT INTO sovereignty_events (type, impact, severity, title, summary, source_url, event_date, proposed_by) VALUES (${e.type}, ${e.impact}, ${e.severity}, ${e.title}, ${e.summary}, ${e.sourceUrl}, ${e.eventDate}::date, ${e.proposedBy}) ON CONFLICT (source_url) DO NOTHING RETURNING id`;
      return rows.length ? res.status(201).json({ success: true, id: String(rows[0].id) }) : res.status(200).json({ success: true, duplicate: true });
    }
    if (req.method === 'PATCH') {
      if (!['published', 'rejected'].includes(body?.status)) return fail(400, 'status=published ou rejected attendu');
      if (!['string', 'number'].includes(typeof body.id) || !/^[1-9]\d*$/.test(String(body.id)) || Number(body.id) > 2147483647) {
        return fail(400, 'id doit être un entier positif');
      }
      const check = validateStatusChange(body);
      if (!check.ok) return fail(400, check.error);
      const { id, status } = check.value;
      const rows = await sql`UPDATE sovereignty_events SET status = ${status}, published_at = CASE WHEN ${status} = 'published' THEN COALESCE(published_at, now()) ELSE published_at END WHERE id = ${id} RETURNING id, type, impact, severity, title, summary, source_url,
                  event_date::text AS event_date, published_at::text AS published_at, status, proposed_by`;
      return rows.length ? res.status(200).json({ success: true, event: format(rows[0], true) }) : fail(404, 'Événement introuvable');
    }
  } catch (error) {
    console.error('sovereignty-events error:', error);
    return fail(500, 'Erreur interne');
  }
}
