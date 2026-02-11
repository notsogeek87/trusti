/**
 * Script pour initialiser la base de données PostgreSQL Neon
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { initDatabase } from './service-postgres.js';

console.log('🚀 Initialisation de la base de données PostgreSQL/Neon...\n');

initDatabase()
  .then(() => {
    console.log('\n✨ Base de données initialisée avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur lors de l\'initialisation:', error);
    process.exit(1);
  });
