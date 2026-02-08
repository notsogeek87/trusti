/**
 * Test pour vérifier les relations d'une app spécifique
 */
import dbService from './server/database/service-postgres.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAppRelations() {
  console.log('\n═══════════════════════════════════════');
  console.log('🧪 TEST DES RELATIONS D\'APP');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Récupérer toutes les apps
    const allApps = await dbService.getAllApps();
    
    // Trouver des exemples de Star Apps (D/E)
    const starApps = allApps.filter(app => app.trustiScore === 'D' || app.trustiScore === 'E');
    
    // Trouver des exemples de Trusti Apps (A/B/C)
    const trustiApps = allApps.filter(app => ['A', 'B', 'C'].includes(app.trustiScore));
    
    console.log(`📊 Total apps: ${allApps.length}`);
    console.log(`   Star Apps (D/E): ${starApps.length}`);
    console.log(`   Trusti Apps (A/B/C): ${trustiApps.length}\n`);
    
    // Tester quelques Star Apps
    console.log('🔍 Test Star Apps → Alternatives (Trusti Apps):\n');
    for (let i = 0; i < Math.min(3, starApps.length); i++) {
      const app = starApps[i];
      console.log(`${i + 1}. ${app.name} (${app.trustiScore})`);
      console.log(`   Alternatives: ${app.alternativeAppIds?.length || 0}`);
      if (app.alternativeAppIds && app.alternativeAppIds.length > 0) {
        for (const altId of app.alternativeAppIds) {
          const alt = allApps.find(a => a.id === altId);
          if (alt) {
            console.log(`   → ${alt.name} (${alt.trustiScore})`);
          }
        }
      }
      console.log('');
    }
    
    // Tester quelques Trusti Apps
    console.log('🔍 Test Trusti Apps → Remplace (Star Apps):\n');
    for (let i = 0; i < Math.min(3, trustiApps.length); i++) {
      const app = trustiApps[i];
      console.log(`${i + 1}. ${app.name} (${app.trustiScore})`);
      console.log(`   Remplace: ${app.replacesAppIds?.length || 0}`);
      if (app.replacesAppIds && app.replacesAppIds.length > 0) {
        for (const repId of app.replacesAppIds) {
          const rep = allApps.find(a => a.id === repId);
          if (rep) {
            console.log(`   → ${rep.name} (${rep.trustiScore})`);
          }
        }
      }
      console.log('');
    }
    
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

testAppRelations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
