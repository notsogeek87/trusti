/**
 * Migration : table de rate-limiting OTP persistant (remplace les Map en mémoire).
 * Usage: node server/database/add-otp-attempts-table.js
 */
import { neon } from '@neondatabase/serverless';

if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv peut ne pas être installé en production
  }
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🚀 Migration: création de la table otp_attempts...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS otp_attempts (
      email TEXT PRIMARY KEY,
      failed_count INTEGER NOT NULL DEFAULT 0,
      locked_until BIGINT NOT NULL DEFAULT 0,
      updated_at BIGINT NOT NULL DEFAULT 0
    )
  `;

  console.log('✅ Table otp_attempts prête.');
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur migration otp_attempts:', error);
    process.exit(1);
  });
