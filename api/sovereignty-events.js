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
        const rows = await sql`SELECT *, event_date::text AS event_date, published_at::text AS published_at FROM sovereignty_events WHERE status = 'proposed' ORDER BY created_at LIMIT 200`;
        return res.status(200).json({ success: true, events: rows.map(row => format(row, true)) });
      }
      const day = parseSince(since);
      if (!day) return fail(400, 'since doit être une date AAAA-MM-JJ');
      const rows = await sql`SELECT *, event_date::text AS event_date, published_at::text AS published_at FROM sovereignty_events WHERE status = 'published' AND published_at >= ${day}::date ORDER BY published_at DESC, id DESC LIMIT 500`;
      return res.status(200).json({ success: true, since: day, events: rows.map(row => format(row)) });
    }
    if (!admin) return fail(401, 'Unauthorized');
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return fail(400, 'Corps JSON attendu'); } }
    if (req.method === 'POST') {
      if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'Corps JSON attendu');
      const check = validateEventProposal({ ...body, app_id: 'general' });
      if (!check.ok) return fail(400, check.error);
      const e = check.value;
      const rows = await sql`INSERT INTO sovereignty_events (type, impact, severity, title, summary, source_url, event_date, proposed_by) VALUES (${e.type}, ${e.impact}, ${e.severity}, ${e.title}, ${e.summary}, ${e.sourceUrl}, ${e.eventDate}::date, ${e.proposedBy}) ON CONFLICT (source_url) DO NOTHING RETURNING id`;
      return rows.length ? res.status(201).json({ success: true, id: String(rows[0].id) }) : res.status(200).json({ success: true, duplicate: true });
    }
    if (req.method === 'PATCH') {
      const check = validateStatusChange(body);
      if (!check.ok) return fail(400, check.error);
      const { id, status } = check.value;
      const rows = await sql`UPDATE sovereignty_events SET status = ${status}, published_at = CASE WHEN ${status} = 'published' THEN COALESCE(published_at, now()) ELSE published_at END WHERE id = ${id} RETURNING *, event_date::text AS event_date, published_at::text AS published_at`;
      return rows.length ? res.status(200).json({ success: true, event: format(rows[0], true) }) : fail(404, 'Événement introuvable');
    }
    return fail(405, 'Method not allowed');
  } catch (error) {
    console.error('sovereignty-events error:', error);
    return fail(500, 'Erreur interne');
  }
}
