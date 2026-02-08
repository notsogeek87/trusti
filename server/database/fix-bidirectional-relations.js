/**
 * Script pour réparer les relations bidirectionnelles
 * Ajoute automatiquement les relations inverses manquantes
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixBidirectionalRelations() {
  console.log('\n═══════════════════════════════════════');
  console.log('🔧 RÉPARATION DES RELATIONS BIDIRECTIONNELLES');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Récupérer toutes les relations existantes
    const relations = await sql`
      SELECT app_id, related_app_id, relation_type
      FROM app_relations
      ORDER BY app_id
    `;
    
    console.log(`📊 Relations existantes: ${relations.length}\n`);
    
    let addedCount = 0;
    
    for (const rel of relations) {
      // Déterminer le type inverse
      const inverseType = rel.relation_type === 'alternative' ? 'replaces' : 'alternative';
      
      // Vérifier si la relation inverse existe
      const inverse = await sql`
        SELECT * FROM app_relations
        WHERE app_id = ${rel.related_app_id}
          AND related_app_id = ${rel.app_id}
          AND relation_type = ${inverseType}
      `;
      
      if (inverse.length === 0) {
        // Ajouter la relation inverse
        await sql`
          INSERT INTO app_relations (app_id, related_app_id, relation_type)
          VALUES (${rel.related_app_id}, ${rel.app_id}, ${inverseType})
          ON CONFLICT (app_id, related_app_id, relation_type) DO NOTHING
        `;
        
        // Récupérer les noms des apps pour affichage
        const app1 = await sql`SELECT name FROM applications WHERE id = ${rel.app_id}`;
        const app2 = await sql`SELECT name FROM applications WHERE id = ${rel.related_app_id}`;
        
        console.log(`✅ Ajout relation inverse: ${app2[0]?.name} → ${app1[0]?.name} (${inverseType})`);
        addedCount++;
      }
    }
    
    // Afficher les statistiques finales
    const finalRelations = await sql`SELECT COUNT(*) as count FROM app_relations`;
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');
    console.log(`Relations ajoutées: ${addedCount}`);
    console.log(`Total de relations: ${finalRelations[0].count}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

fixBidirectionalRelations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
