/**
 * Migration: Ajouter la colonne show_in_awards
 * 
 * Ce script ajoute le champ show_in_awards à la table applications
 * Par défaut, toutes les apps A existantes seront affichées dans Awards
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addShowInAwardsColumn() {
  try {
    console.log('🔄 Migration: Ajout de la colonne show_in_awards...');
    
    // Vérifier si la colonne existe déjà
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name = 'show_in_awards'
    `;
    
    if (columns.length > 0) {
      console.log('✅ La colonne show_in_awards existe déjà');
      return;
    }
    
    // Ajouter la colonne (par défaut 1 = afficher dans Awards)
    await sql`
      ALTER TABLE applications 
      ADD COLUMN show_in_awards INTEGER DEFAULT 1
    `;
    
    console.log('✅ Colonne show_in_awards ajoutée avec succès');
    
    // Statistiques
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN grade = 'A' AND show_in_awards = 1 THEN 1 ELSE 0 END) as grade_a_in_awards
      FROM applications
    `;
    
    console.log(`\n📊 Statistiques:`);
    console.log(`   Total d'apps: ${stats[0].total}`);
    console.log(`   Apps A dans Awards: ${stats[0].grade_a_in_awards}`);
    console.log('\n✨ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration
addShowInAwardsColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
