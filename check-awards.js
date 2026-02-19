/**
 * Script de vérification: Compter les apps avec show_in_awards = 1
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkAwards() {
  try {
    console.log('🔍 Vérification de show_in_awards dans la DB...\n');
    
    // Compter les apps avec show_in_awards = 1
    const totalAwards = await sql`
      SELECT COUNT(*) as count
      FROM applications
      WHERE show_in_awards = 1
    `;
    console.log(`Apps avec show_in_awards = 1: ${totalAwards[0].count}`);
    
    // Compter les apps avec show_in_awards = 0
    const totalNotAwards = await sql`
      SELECT COUNT(*) as count
      FROM applications
      WHERE show_in_awards = 0
    `;
    console.log(`Apps avec show_in_awards = 0: ${totalNotAwards[0].count}`);
    
    // Compter toutes les apps
    const totalApps = await sql`
      SELECT COUNT(*) as count
      FROM applications
    `;
    console.log(`Total apps: ${totalApps[0].count}\n`);
    
    // Afficher quelques exemples
    const examples = await sql`
      SELECT id, name, grade, show_in_awards
      FROM applications
      WHERE show_in_awards = 1
      LIMIT 10
    `;
    console.log('📋 Exemples d\'apps avec show_in_awards = 1:');
    console.table(examples);
    
    // Vérifier le type de la colonne
    const columnInfo = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'applications'
      AND column_name = 'show_in_awards'
    `;
    console.log('\n🔍 Infos sur la colonne show_in_awards:');
    console.table(columnInfo);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

checkAwards();
