// Route API - Événements des apps (fuite, rachat, changement de politique, open source…)
// Voir server/appEvents.js et docs/guides/notifications.md.
//
// Lecture publique (événements PUBLIÉS uniquement) :
//   GET /api/app-events?since=AAAA-MM-JJ  événements publiés depuis cette date, tout le catalogue
//                                         (90 jours par défaut, 365 au plus). Même réponse pour
//                                         tous : l'appareil garde ceux de ses apps, en local.
//   GET /api/app-events?app=:id           événements publiés d'une app (fiche)
//
// Réservé à la veille et à la validation (en-tête x-api-key) :
//   GET   /api/app-events?status=proposed  propositions en attente
//   POST  /api/app-events                  { app_id, type, impact, severity?, title, summary?,
//                                            source_url, event_date, proposed_by? } -> proposition
//   PATCH /api/app-events                  { id, status: 'published' | 'rejected' | 'proposed' }
import dbService from '../server/database/service-postgres.js';
import { isAuthorizedAdminRequest } from '../server/adminToken.js';
import { parseSince } from '../server/gradeChanges.js';
import { validateEventProposal, validateStatusChange } from '../server/appEvents.js';

function readBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  return body;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const isAdmin = isAuthorizedAdminRequest(req);
  const { since, app, status } = req.query || {};

  try {
    if (req.method === 'GET') {
      if (status !== undefined) {
        // Liste interne : jamais mise en cache (ni CDN ni navigateur).
        res.setHeader('Cache-Control', 'no-store');
        if (!isAdmin) return res.status(401).json({ success: false, error: 'Unauthorized' });
        if (status !== 'proposed') return res.status(400).json({ success: false, error: 'status=proposed attendu' });
        const events = await dbService.getProposedEvents();
        return res.status(200).json({ success: true, events });
      }

      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
      if (app !== undefined) {
        const id = String(app).trim().slice(0, 100);
        if (!id) return res.status(400).json({ success: false, error: 'app est requis' });
        const events = await dbService.getEventsForApp(id);
        return res.status(200).json({ success: true, events });
      }

      const day = parseSince(since);
      if (!day) return res.status(400).json({ success: false, error: 'since doit être une date AAAA-MM-JJ' });
      const events = await dbService.getEventsSince(day);
      return res.status(200).json({ success: true, since: day, events });
    }

    res.setHeader('Cache-Control', 'no-store');
    if (!isAdmin) return res.status(401).json({ success: false, error: 'Unauthorized' });

    if (req.method === 'POST') {
      const check = validateEventProposal(readBody(req));
      if (!check.ok) return res.status(400).json({ success: false, error: check.error });
      const saved = await dbService.proposeAppEvent(check.value);
      if (saved.unknownApp) return res.status(404).json({ success: false, error: 'App inconnue' });
      if (saved.duplicate) return res.status(200).json({ success: true, duplicate: true });
      return res.status(201).json({ success: true, id: saved.id });
    }

    if (req.method === 'PATCH') {
      const check = validateStatusChange(readBody(req));
      if (!check.ok) return res.status(400).json({ success: false, error: check.error });
      const event = await dbService.setAppEventStatus(check.value.id, check.value.status);
      if (!event) return res.status(404).json({ success: false, error: 'Événement introuvable' });
      return res.status(200).json({ success: true, event });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('app-events error:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne' });
  }
}
