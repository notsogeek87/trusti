/**
 * Crée la table app_migration_guides (guides de migration par app, voir
 * server/migrationGuides.js et docs/guides/migration-guidee.md). Idempotent.
 *
 *   npm run db:add-migration-guides
 *
 * Les textes se modifient ensuite directement en base (UPDATE), sans republier l'app.
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS app_migration_guides (
    app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('export', 'import')),
    summary TEXT NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    direct_from TEXT[] NOT NULL DEFAULT '{}',
    direct_export TEXT,
    source_url TEXT NOT NULL CHECK (source_url LIKE 'https://%'),
    checked_at DATE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (app_id, direction)
  )
`;
console.log('Table app_migration_guides prête.');
