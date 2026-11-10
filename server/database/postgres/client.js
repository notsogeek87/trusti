/**
 * Connexion PostgreSQL, partagée par tous les modules de server/database/postgres.
 * Le choix du driver (Neon pour Vercel, pg pour Hyperfluid ou un Postgres classique)
 * est fait dans ../sql.js selon DATABASE_URL.
 */

// Charger .env en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv peut ne pas être installé en production
  }
}

export { default as sql } from '../sql.js';
