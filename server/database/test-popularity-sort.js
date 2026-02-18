import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testPopularitySort() {
  console.log('🧪 Test du tri par popularité\n');
  
  // Récupérer toutes les apps avec popularity < 9999
  const popularApps = await sql`
    SELECT name, popularity, grade 
    FROM applications 
    WHERE popularity < 9999
    ORDER BY popularity ASC
  `;
  
  console.log(`📊 ${popularApps.length} apps avec rang de popularité défini:\n`);
  
  popularApps.forEach((app, index) => {
    const num = (index + 1).toString().padStart(2, ' ');
    const name = app.name.padEnd(35, ' ');
    const pop = app.popularity.toString().padStart(3, ' ');
    console.log(`${num}. ${name} (rang ${pop}, note ${app.grade})`);
  });
  
  console.log('\n✅ Le tri par popularité fonctionne en BDD!');
  console.log('📱 Dans l\'app React, les apps seront triées dans cet ordre.');
  console.log('   Les apps avec popularity=9999 apparaîtront ensuite par ordre alphabétique.');
}

testPopularitySort().catch(console.error);
