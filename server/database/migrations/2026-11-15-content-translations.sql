-- Traductions du contenu en base (EN, DE) : descriptions des apps, justifications des notes,
-- guides de migration. Le français reste dans les tables d'origine ; cette table ne contient
-- que les traductions. Sans ligne pour une langue, l'API renvoie le texte français (repli).
--
-- Voir docs/guides/traduction.md (section « Contenu en base ») et server/contentTranslations.js.
--
-- entity / entity_id / field :
--   application      <id de l'app>            reason | description | teamPickReason
--   assessment       <app_id>                 summary | rationale.<critère>  (ex. rationale.gouvernance)
--   migration_guide  <app_id>:<direction>     summary | steps | notes | directExport
-- value : texte (chaîne JSON) ou liste (steps, notes) au même format que la colonne d'origine.
-- source_hash : md5 du texte français traduit ; s'il ne correspond plus, la traduction est
-- périmée (le français a changé) et l'API retombe sur le français.
--
-- Idempotent. Aucune donnée existante n'est modifiée.

CREATE TABLE IF NOT EXISTS content_translations (
  entity       TEXT NOT NULL CHECK (entity IN ('application', 'assessment', 'migration_guide')),
  entity_id    TEXT NOT NULL,
  field        TEXT NOT NULL,
  lang         TEXT NOT NULL CHECK (lang IN ('en', 'de')),
  value        JSONB NOT NULL,
  source_hash  TEXT NOT NULL,
  translated_by TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entity, entity_id, field, lang)
);

CREATE INDEX IF NOT EXISTS content_translations_lookup
  ON content_translations (entity, lang, entity_id);
