/**
 * Connexion Neon (PostgreSQL), partagée par tous les modules de server/database/postgres.
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


export const sql = neon(process.env.DATABASE_URL);
