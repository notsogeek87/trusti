import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testRelation() {
  console.log('🔗 Test de la relation Google Photos ↔ Ente Photos\n');
  
  // Récupérer Google Photos
  const googlePhotos = await sql`
    SELECT id, name, category, trusti_score
    FROM applications 
    WHERE name = 'Google Photos'
  `;
  
  if (googlePhotos.length === 0) {
    console.log('❌ Google Photos non trouvé');
    return;
  }
  
  const googleId = googlePhotos[0].id;
  const googleCategory = googlePhotos[0].category;
  const googleScore = googlePhotos[0].trusti_score;
  
  console.log('📱 Google Photos:');
  console.log(`   ID: ${googleId}`);
  console.log(`   Catégorie: "${googleCategory}"`);
  console.log(`   Score: ${googleScore}\n`);
  
  // Récupérer toutes les apps de la même catégorie avec un meilleur score
  const alternatives = await sql`
    SELECT id, name, trusti_score
    FROM applications
    WHERE category = ${googleCategory}
    AND id != ${googleId}
    ORDER BY trusti_score ASC
  `;
  
  console.log('✨ Alternatives trouvées (même catégorie, meilleur score):');
  
  const scoreOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
  const googleScoreValue = scoreOrder[googleScore];
  
  let foundEnte = false;
  alternatives.forEach(app => {
    const appScoreValue = scoreOrder[app.trusti_score];
    if (appScoreValue < googleScoreValue) {
      const isEnte = app.name === 'Ente Photos' ? ' 🎯' : '';
      console.log(`   - ${app.name} (Score ${app.trusti_score})${isEnte}`);
      if (app.name === 'Ente Photos') {
        foundEnte = true;
      }
    }
  });
  
  if (foundEnte) {
    console.log('\n✅ La relation fonctionne ! Ente Photos apparaît comme alternative de Google Photos.');
  } else {
    console.log('\n⚠️  Ente Photos n\'apparaît pas dans les alternatives.');
  }
}

testRelation().catch(console.error);
