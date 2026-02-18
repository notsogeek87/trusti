import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function showTopApps() {
  console.log('📊 Top 20 apps par popularité:\n');
  
  const apps = await sql`
    SELECT name, popularity 
    FROM applications 
    WHERE popularity < 9999
    ORDER BY popularity ASC 
    LIMIT 20
  `;
  
  apps.forEach((app, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${app.name.padEnd(40, ' ')} (rang ${app.popularity})`);
  });
  
  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN popularity < 9999 THEN 1 END) as with_rank,
      COUNT(CASE WHEN popularity = 9999 THEN 1 END) as without_rank
    FROM applications
  `;
  
  console.log(`\n📈 Statistiques:`);
  console.log(`   Total apps: ${stats[0].total}`);
  console.log(`   Avec rang de popularité: ${stats[0].with_rank}`);
  console.log(`   Sans rang (9999): ${stats[0].without_rank}`);
}

showTopApps().catch(console.error);
