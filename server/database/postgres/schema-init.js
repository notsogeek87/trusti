/**
 * Création des tables et index (initDatabase).
 */
import { sql } from './client.js';

/**
 * Créer les tables si elles n'existent pas
 */
export async function initDatabase() {
  try {
    // Table des applications
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trusti_score TEXT NOT NULL,
        grade TEXT NOT NULL,
        category TEXT DEFAULT 'Application',
        icon TEXT,
        color TEXT DEFAULT 'bg-slate-600',
        reason TEXT DEFAULT '',
        play_store_url TEXT,
        apple_store_url TEXT,
        github_url TEXT,
        other_store_url TEXT,
        website TEXT,
        description TEXT,
        developer TEXT,
        license TEXT,
        is_open_source BOOLEAN DEFAULT FALSE,
        is_european BOOLEAN DEFAULT FALSE,
        jurisdiction TEXT,
        app_type TEXT DEFAULT 'regular',
        privacy_features JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Table des relations entre applications
    await sql`
      CREATE TABLE IF NOT EXISTS app_relations (
        id SERIAL PRIMARY KEY,
        app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        related_app_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        UNIQUE(app_id, related_app_id, relation_type)
      )
    `;

    // Index pour améliorer les performances
    await sql`CREATE INDEX IF NOT EXISTS idx_app_type ON applications(app_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trusti_score ON applications(trusti_score)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_app_relations_app_id ON app_relations(app_id)`;

    // Migration: colonne show_in_onboarding (ajout idempotent)
    await sql`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS show_in_onboarding INTEGER DEFAULT 1
    `;

    // Migration: colonne f_droid_url (calculée une fois à l'écriture au lieu
    // d'être re-vérifiée par requête HTTP à chaque lecture)
    await sql`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS f_droid_url TEXT
    `;

    // Migration: « choix de l'équipe » (une seule app par catégorie)
    await sql`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS is_team_pick BOOLEAN DEFAULT FALSE
    `;
    await sql`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS team_pick_reason TEXT
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_team_pick_per_category
      ON applications(category) WHERE is_team_pick
    `;

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
