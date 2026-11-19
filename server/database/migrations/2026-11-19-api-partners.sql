-- Partenaires de l'API en lecture /api/v1 (voir server/publicApi/ et docs/guides/api-partenaires.md).
-- Une ligne par partenaire ; seule l'empreinte SHA-256 de la clé est stockée.
-- Idempotent : peut être rejoué sans risque.
CREATE TABLE IF NOT EXISTS api_partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  key_hash TEXT NOT NULL UNIQUE,
  rate_per_minute INTEGER NOT NULL DEFAULT 60 CHECK (rate_per_minute BETWEEN 1 AND 6000),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP
);
