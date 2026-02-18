import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function compareRelations() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 COMPARAISON : Relations Manuelles vs Automatiques');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Relations manuelles définies dans add-relations.js
  const manualRelations = [
    { starApp: 'GMail', trustiApp: 'Proton Mail' },
    { starApp: 'Google Password', trustiApp: 'Bitwarden' },
    { starApp: 'Google Keep', trustiApp: 'SimpleNote' },
    { starApp: 'Google Tasks', trustiApp: 'Tasks.org' },
    { starApp: 'ChatGPT', trustiApp: 'Lumo AI' },
    { starApp: 'Google Photos', trustiApp: 'Ente Photos' },
    { starApp: 'Google Drive', trustiApp: 'KDrive' },
    { starApp: 'Google Drive', trustiApp: 'PCloud' },
    { starApp: 'Google.com', trustiApp: 'DuckDuckGo' },
    { starApp: 'Google.com', trustiApp: 'Startpage' },
    { starApp: 'Apple Pay', trustiApp: 'Curve Pay' },
    { starApp: 'Google Wallet', trustiApp: 'Curve Pay' },
    { starApp: 'Apple Music', trustiApp: 'Deezer' },
    { starApp: 'Youtube Music', trustiApp: 'Deezer' },
    { starApp: 'Youtube', trustiApp: 'Libretube' },
    { starApp: 'Whatsapp', trustiApp: 'Signal' },
    { starApp: 'Google Maps', trustiApp: 'Roole Maps' },
    { starApp: 'Google Maps', trustiApp: 'Infomaniak' }
  ];
  
  console.log('📋 Vérification des relations définies manuellement:\n');
  
  let sameCategory = 0;
  let differentCategory = 0;
  let notFound = 0;
  let autoMatchingDetails = [];
  
  for (const rel of manualRelations) {
    // Récupérer les infos des deux apps
    const starApp = await sql`
      SELECT id, name, category, trusti_score
      FROM applications 
      WHERE name = ${rel.starApp}
    `;
    
    const trustiApp = await sql`
      SELECT id, name, category, trusti_score
      FROM applications 
      WHERE name = ${rel.trustiApp}
    `;
    
    if (starApp.length === 0 || trustiApp.length === 0) {
      console.log(`❌ ${rel.starApp} → ${rel.trustiApp}`);
      console.log(`   Problème: ${starApp.length === 0 ? rel.starApp : rel.trustiApp} non trouvé en BDD\n`);
      notFound++;
      continue;
    }
    
    const star = starApp[0];
    const trusti = trustiApp[0];
    
    // Vérifier si même catégorie
    if (star.category === trusti.category) {
      console.log(`✅ ${rel.starApp} → ${rel.trustiApp}`);
      console.log(`   Catégorie: "${star.category}" (identique)`);
      console.log(`   Scores: ${star.trusti_score} → ${trusti.trusti_score}`);
      console.log(`   🤖 Relation AUTOMATIQUE détectée !\n`);
      sameCategory++;
      
      autoMatchingDetails.push({
        star: rel.starApp,
        trusti: rel.trustiApp,
        category: star.category,
        automatic: true
      });
    } else {
      console.log(`⚠️  ${rel.starApp} → ${rel.trustiApp}`);
      console.log(`   Catégories DIFFÉRENTES:`);
      console.log(`   • ${rel.starApp}: "${star.category}"`);
      console.log(`   • ${rel.trustiApp}: "${trusti.category}"`);
      console.log(`   Scores: ${star.trusti_score} → ${trusti.trusti_score}`);
      console.log(`   ⚡ Relation manuelle NÉCESSAIRE\n`);
      differentCategory++;
      
      autoMatchingDetails.push({
        star: rel.starApp,
        trusti: rel.trustiApp,
        starCategory: star.category,
        trustiCategory: trusti.category,
        automatic: false
      });
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Total de relations manuelles définies: ${manualRelations.length}`);
  console.log(`✅ Relations automatiques (même catégorie): ${sameCategory}`);
  console.log(`⚠️  Relations manuelles nécessaires (catégories différentes): ${differentCategory}`);
  console.log(`❌ Apps non trouvées: ${notFound}\n`);
  
  const percentAuto = ((sameCategory / (manualRelations.length - notFound)) * 100).toFixed(1);
  console.log(`📈 ${percentAuto}% des relations fonctionnent automatiquement\n`);
  
  if (differentCategory > 0) {
    console.log('⚡ Relations qui nécessitent vraiment un mapping manuel:');
    autoMatchingDetails.filter(r => !r.automatic).forEach(rel => {
      console.log(`   • ${rel.star} (${rel.starCategory}) → ${rel.trusti} (${rel.trustiCategory})`);
    });
    console.log('\n💡 Solution: Harmoniser les catégories en BDD');
  } else {
    console.log('🎉 TOUTES les relations manuelles sont redondantes !');
    console.log('💡 Le système automatique suffit si les catégories sont cohérentes.\n');
    console.log('🗑️  Fichier add-relations.js peut être supprimé');
  }
  
  // Vérifier si la table app_relations est utilisée
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 État de la table app_relations');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const relationsInDB = await sql`SELECT COUNT(*) as count FROM app_relations`;
  console.log(`Relations stockées en BDD: ${relationsInDB[0].count}`);
  
  if (relationsInDB[0].count > 0) {
    console.log('⚠️  ATTENTION: La table contient des relations mais...');
    console.log('❌ La fonction getAppRelations() ne les lit PAS !');
    console.log('💡 Le système utilise uniquement les relations automatiques\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

compareRelations().catch(console.error);
