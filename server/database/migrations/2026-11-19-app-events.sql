-- Événements des apps (voir server/appEvents.js et docs/guides/notifications.md) :
-- fuite de données, rachat, changement de politique, passage en open source…
--
-- La veille (workflow n8n) insère des propositions (status = 'proposed') via
-- POST /api/app-events ; seul un événement validé (status = 'published') est
-- servi par l'API publique et notifié sur les téléphones.
--
-- Idempotent : peut être rejoué sans risque. À appliquer après validation de David.
-- Retour arrière : DROP TABLE app_events;
CREATE TABLE IF NOT EXISTS app_events (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'incident', 'acquisition', 'policy_change', 'jurisdiction_change',
    'open_source', 'closed_source', 'audit', 'shutdown', 'other'
  )),
  impact TEXT NOT NULL CHECK (impact IN ('negative', 'neutral', 'positive')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'published', 'rejected')),
  published_at TIMESTAMP,
  proposed_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  -- Une même source n'est proposée qu'une fois par app (la veille peut repasser dessus).
  UNIQUE (app_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_app_events_published
  ON app_events (published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_app_events_app
  ON app_events (app_id, event_date DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_app_events_proposed
  ON app_events (created_at) WHERE status = 'proposed';
