import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixInfomaniakCategory() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔧 CORRECTION DE LA CATÉGORIE INFOMANIAK');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Vérifier l'état actuel
  const before = await sql`
    SELECT id, name, category, trusti_score, website
    FROM applications 
    WHERE name = 'Infomaniak'
  `;
  
  if (before.length === 0) {
    console.log('❌ Infomaniak non trouvé en base\n');
    return;
  }
  
  console.log('📱 État AVANT:');
  console.log(`   Nom: ${before[0].name}`);
  console.log(`   Catégorie: "${before[0].category}"`);
  console.log(`   Score: ${before[0].trusti_score}`);
  console.log(`   Website: ${before[0].website || 'N/A'}\n`);
  
  console.log('❓ Analyse: Infomaniak propose plusieurs services:');
  console.log('   • Email (kMail)');
  console.log('   • Stockage Cloud (kDrive)');
  console.log('   • Suite bureautique');
  console.log('   • Hébergement web\n');
  
  console.log('💡 Catégorie choisie: "Productivité" (englobe email + stockage)\n');
  
  // Corriger la catégorie
  await sql`
    UPDATE applications
    SET category = 'Productivité'
    WHERE name = 'Infomaniak'
  `;
  
  console.log('✅ Catégorie mise à jour !\n');
  
  // Vérifier l'état après
  const after = await sql`
    SELECT id, name, category, trusti_score
    FROM applications 
    WHERE name = 'Infomaniak'
  `;
  
  console.log('📱 État APRÈS:');
  console.log(`   Nom: ${after[0].name}`);
  console.log(`   Catégorie: "${after[0].category}"`);
  console.log(`   Score: ${after[0].trusti_score}\n`);
  
  // Vérifier si cela résout la relation avec Google Maps
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 Impact sur les relations');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const googleMaps = await sql`
    SELECT id, name, category, trusti_score
    FROM applications 
    WHERE name = 'Google Maps'
  `;
  
  if (googleMaps.length > 0) {
    console.log(`Google Maps: catégorie "${googleMaps[0].category}"`);
    console.log(`Infomaniak: catégorie "${after[0].category}"\n`);
    
    if (googleMaps[0].category === after[0].category) {
      console.log('✅ Même catégorie ! Relation automatique active.');
    } else {
      console.log('⚠️  Catégories différentes.');
      console.log('💡 Google Maps (Navigation GPS) et Infomaniak (Productivité)');
      console.log('   ne sont pas des alternatives directes.\n');
      console.log('❓ La relation manuelle Google Maps → Infomaniak est-elle pertinente ?');
      console.log('   Peut-être une confusion avec Infomaniak Maps ?');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ CORRECTION TERMINÉE');
  console.log('═══════════════════════════════════════════════════════════\n');
}

fixInfomaniakCategory().catch(console.error);
