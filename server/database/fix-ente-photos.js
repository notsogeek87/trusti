import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixEntePhotos() {
  console.log('🔧 Correction d\'Ente Photos...\n');
  
  // Vérifier l'état actuel
  const before = await sql`
    SELECT id, name, trusti_score, grade, category
    FROM applications 
    WHERE name = 'Ente Photos'
  `;
  
  if (before.length === 0) {
    console.log('❌ Ente Photos non trouvé en base');
    return;
  }
  
  console.log('📱 État AVANT:');
  console.log(`   ID: ${before[0].id}`);
  console.log(`   Nom: ${before[0].name}`);
  console.log(`   Score: ${before[0].trusti_score}`);
  console.log(`   Grade: ${before[0].grade}`);
  console.log(`   Catégorie: ${before[0].category}\n`);
  
  // Corriger le score et le grade
  await sql`
    UPDATE applications
    SET trusti_score = 'A',
        grade = 'A'
    WHERE name = 'Ente Photos'
  `;
  
  console.log('✅ Score corrigé de D → A\n');
  
  // Vérifier l'état après
  const after = await sql`
    SELECT id, name, trusti_score, grade, category
    FROM applications 
    WHERE name = 'Ente Photos'
  `;
  
  console.log('📱 État APRÈS:');
  console.log(`   ID: ${after[0].id}`);
  console.log(`   Nom: ${after[0].name}`);
  console.log(`   Score: ${after[0].trusti_score}`);
  console.log(`   Grade: ${after[0].grade}`);
  console.log(`   Catégorie: ${after[0].category}\n`);
  
  // Vérifier les relations automatiques
  console.log('🔗 Relations automatiques détectées:');
  
  const googlePhotos = await sql`
    SELECT id, name, trusti_score
    FROM applications 
    WHERE name = 'Google Photos'
  `;
  
  if (googlePhotos.length > 0) {
    console.log(`   ✅ Google Photos (Score ${googlePhotos[0].trusti_score}) → Ente Photos (Score A)`);
    console.log(`      Ente Photos apparaîtra comme alternative de Google Photos\n`);
  }
  
  console.log('🎉 Correction terminée !');
  console.log('💡 Rechargez votre application pour voir la relation.');
}

fixEntePhotos().catch(console.error);
