import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function cleanupRelationsTable() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🗑️  NETTOYAGE DE LA TABLE app_relations');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Vérifier l'état actuel
  const count = await sql`SELECT COUNT(*) as count FROM app_relations`;
  console.log(`📊 Relations actuellement en table: ${count[0].count}\n`);
  
  if (count[0].count === 0) {
    console.log('✅ La table est déjà vide.\n');
    return;
  }
  
  // Afficher quelques exemples
  console.log('📋 Exemples de relations à supprimer:');
  const samples = await sql`
    SELECT ar.relation_type, a1.name as app_name, a2.name as related_name
    FROM app_relations ar
    JOIN applications a1 ON ar.app_id = a1.id
    JOIN applications a2 ON ar.related_app_id = a2.id
    LIMIT 5
  `;
  
  samples.forEach(rel => {
    console.log(`   • ${rel.app_name} → ${rel.related_name} (${rel.relation_type})`);
  });
  
  console.log('\n⚠️  Ces relations ne sont PAS utilisées par le code.');
  console.log('💡 Le système utilise les relations automatiques (catégorie + score).\n');
  
  console.log('🗑️  Suppression de toutes les relations...\n');
  
  // Supprimer toutes les relations
  await sql`DELETE FROM app_relations`;
  
  console.log('✅ Table app_relations vidée avec succès !\n');
  
  // Vérifier
  const afterCount = await sql`SELECT COUNT(*) as count FROM app_relations`;
  console.log(`📊 Relations restantes: ${afterCount[0].count}\n`);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ NETTOYAGE TERMINÉ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n💡 NOTE: La table app_relations est conservée pour usage futur.');
  console.log('   Elle pourrait servir pour des relations manuelles spéciales.\n');
  console.log('🎯 Le système de relations automatiques fonctionne parfaitement !');
  console.log('   Les relations sont calculées dynamiquement via:');
  console.log('   - Même catégorie');
  console.log('   - Score meilleur (A > B > C > D > E)\n');
}

cleanupRelationsTable().catch(console.error);
