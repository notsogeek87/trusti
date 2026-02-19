/**
 * Script de correction: Réinitialiser show_in_awards à 0 pour toutes les apps
 * Puis mettre à 1 uniquement les apps de grade A ou B
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixShowInAwards() {
  try {
    console.log('🔄 Correction de show_in_awards...');
    
    // 1. Mettre toutes les apps à 0
    const resetResult = await sql`
      UPDATE applications
      SET show_in_awards = 0
    `;
    console.log(`✅ Toutes les apps mises à show_in_awards = 0`);
    
    // 2. Mettre à 1 uniquement les apps de grade A ou B (les meilleures alternatives)
    const updateResult = await sql`
      UPDATE applications
      SET show_in_awards = 1
      WHERE grade IN ('A', 'B')
    `;
    console.log(`✅ Apps de grade A et B mises à show_in_awards = 1`);
    
    // 3. Afficher les statistiques
    const stats = await sql`
      SELECT 
        grade,
        COUNT(*) as total,
        SUM(CASE WHEN show_in_awards = 1 THEN 1 ELSE 0 END) as in_awards
      FROM applications
      GROUP BY grade
      ORDER BY grade
    `;
    
    console.log('\n📊 Statistiques par grade:');
    console.table(stats);
    
    const totalAwards = await sql`
      SELECT COUNT(*) as count
      FROM applications
      WHERE show_in_awards = 1
    `;
    
    console.log(`\n🏆 Total d'apps dans Awards: ${totalAwards[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

fixShowInAwards();
