import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkCategories() {
  console.log('🔍 Vérification des catégories...\n');
  
  // Vérifier Google Photos
  const googlePhotos = await sql`
    SELECT id, name, category, trusti_score
    FROM applications 
    WHERE name ILIKE '%Google Photos%'
  `;
  
  console.log('📱 Google Photos:');
  if (googlePhotos.length > 0) {
    googlePhotos.forEach(app => {
      console.log(`   ID: ${app.id}`);
      console.log(`   Nom: ${app.name}`);
      console.log(`   Catégorie: "${app.category}"`);
      console.log(`   Score: ${app.trusti_score}\n`);
    });
  } else {
    console.log('   ❌ Non trouvé\n');
  }
  
  // Vérifier Ente Photos
  const entePhotos = await sql`
    SELECT id, name, category, trusti_score
    FROM applications 
    WHERE name ILIKE '%Ente%'
  `;
  
  console.log('📱 Ente Photos:');
  if (entePhotos.length > 0) {
    entePhotos.forEach(app => {
      console.log(`   ID: ${app.id}`);
      console.log(`   Nom: ${app.name}`);
      console.log(`   Catégorie: "${app.category}"`);
      console.log(`   Score: ${app.trusti_score}\n`);
    });
  } else {
    console.log('   ❌ Non trouvé\n');
  }
  
  // Vérifier si les catégories sont identiques
  if (googlePhotos.length > 0 && entePhotos.length > 0) {
    const googleCategory = googlePhotos[0].category;
    const enteCategory = entePhotos[0].category;
    
    if (googleCategory === enteCategory) {
      console.log(`✅ Les deux apps ont la même catégorie: "${googleCategory}"`);
    } else {
      console.log(`⚠️  Les catégories sont différentes:`);
      console.log(`   Google Photos: "${googleCategory}"`);
      console.log(`   Ente Photos: "${enteCategory}"`);
      console.log(`\n💡 Pour corriger, exécutez: node server/database/fix-photo-categories.js`);
    }
  }
  
  // Lister toutes les catégories uniques
  console.log('\n📊 Toutes les catégories en base:');
  const categories = await sql`
    SELECT DISTINCT category, COUNT(*) as count
    FROM applications
    GROUP BY category
    ORDER BY count DESC
  `;
  
  categories.forEach(cat => {
    console.log(`   - "${cat.category}" (${cat.count} apps)`);
  });
}

checkCategories().catch(console.error);
