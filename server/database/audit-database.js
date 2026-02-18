import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function auditDatabase() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUDIT COMPLET DE LA BASE DE DONNÉES');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // 1. Nombre total d'applications
  const totalApps = await sql`SELECT COUNT(*) as count FROM applications`;
  console.log(`📱 Total d'applications: ${totalApps[0].count}`);
  
  // 2. Répartition par score
  console.log('\n🎯 Répartition par score:');
  const byScore = await sql`
    SELECT trusti_score, COUNT(*) as count
    FROM applications
    GROUP BY trusti_score
    ORDER BY trusti_score ASC
  `;
  byScore.forEach(row => {
    const emoji = { 'A': '🟢', 'B': '🟢', 'C': '🟡', 'D': '🟠', 'E': '🔴' }[row.trusti_score] || '⚪';
    console.log(`   ${emoji} Score ${row.trusti_score}: ${row.count} apps`);
  });
  
  // 3. TrustiApps vs StarApps
  console.log('\n📂 Type d\'applications:');
  const trustiApps = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE trusti_score IN ('A', 'B', 'C')
  `;
  const starApps = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE trusti_score IN ('D', 'E')
  `;
  console.log(`   🌟 TrustiApps (A/B/C): ${trustiApps[0].count}`);
  console.log(`   ⭐ StarApps (D/E): ${starApps[0].count}`);
  
  // 4. Nombre de catégories
  console.log('\n📚 Catégories:');
  const categories = await sql`
    SELECT COUNT(DISTINCT category) as count FROM applications
  `;
  console.log(`   Total de catégories uniques: ${categories[0].count}`);
  
  // Top 10 catégories
  const topCategories = await sql`
    SELECT category, COUNT(*) as count
    FROM applications
    GROUP BY category
    ORDER BY count DESC
    LIMIT 10
  `;
  console.log('\n   Top 10 catégories:');
  topCategories.forEach((cat, idx) => {
    console.log(`   ${(idx + 1).toString().padStart(2)}. ${cat.category.padEnd(30)} (${cat.count} apps)`);
  });
  
  // 5. Relations
  console.log('\n🔗 Relations entre applications:');
  const relations = await sql`SELECT COUNT(*) as count FROM app_relations`;
  console.log(`   Total de relations: ${relations[0].count}`);
  
  const byType = await sql`
    SELECT relation_type, COUNT(*) as count
    FROM app_relations
    GROUP BY relation_type
  `;
  byType.forEach(row => {
    const emoji = row.relation_type === 'alternative' ? '🔄' : '🔀';
    console.log(`   ${emoji} Type "${row.relation_type}": ${row.count}`);
  });
  
  // 6. Apps avec popularité
  console.log('\n📈 Popularité:');
  const withRank = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE popularity < 9999
  `;
  console.log(`   Apps avec rang de popularité: ${withRank[0].count}`);
  
  // 7. Apps open source
  console.log('\n💚 Open Source:');
  const openSource = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE is_open_source = true
  `;
  console.log(`   Apps open source: ${openSource[0].count}`);
  
  // 8. Apps européennes
  console.log('\n🇪🇺 Hébergement européen:');
  const european = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE is_european = true
  `;
  console.log(`   Apps européennes: ${european[0].count}`);
  
  // 9. Structure de la table applications
  console.log('\n📋 Colonnes de la table "applications":');
  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'applications'
    ORDER BY ordinal_position
  `;
  columns.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
    console.log(`   - ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
  });
  
  // 10. Exemples d'apps par score
  console.log('\n🎯 Exemples d\'applications:');
  
  for (const score of ['A', 'B', 'C', 'D', 'E']) {
    const examples = await sql`
      SELECT name, category
      FROM applications
      WHERE trusti_score = ${score}
      LIMIT 3
    `;
    
    if (examples.length > 0) {
      console.log(`\n   Score ${score}:`);
      examples.forEach(app => {
        console.log(`   • ${app.name} (${app.category})`);
      });
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Audit terminé');
  console.log('═══════════════════════════════════════════════════════════\n');
}

auditDatabase().catch(console.error);
