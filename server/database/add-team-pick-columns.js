/**
 * Migration : colonnes « choix de l'équipe » (is_team_pick, team_pick_reason)
 * et index garantissant un seul choix par catégorie.
 * Idempotente. Usage : npm run db:add-team-pick
 *
 * Désigner un choix (retire d'abord l'éventuel choix précédent de la catégorie) :
 *   UPDATE applications SET is_team_pick = FALSE, team_pick_reason = NULL
 *     WHERE category = '<catégorie>' AND is_team_pick;
 *   UPDATE applications SET is_team_pick = TRUE, team_pick_reason = '<raison>'
 *     WHERE id = '<id>';
 */

import { neon } from '@neondatabase/serverless';

// Charger .env en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv peut ne pas être installé en production
  }
}

const sql = neon(process.env.DATABASE_URL);

async function addTeamPickColumns() {
  console.log('🚀 Migration: colonnes « choix de l\'équipe »...');
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_team_pick BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS team_pick_reason TEXT`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_team_pick_per_category
    ON applications(category) WHERE is_team_pick
  `;
  console.log('✅ Colonnes et index en place');
}

addTeamPickColumns().catch((error) => {
  console.error('❌ Erreur de migration:', error);
  process.exit(1);
});
