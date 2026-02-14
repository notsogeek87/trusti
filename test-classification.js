/**
 * Test de la nouvelle classification par trustiScore
 */
import dbService from './server/database/service-json.js';

console.log('\n═══════════════════════════════════════');
console.log('🧪 TEST: Classification par TrustiScore');
console.log('═══════════════════════════════════════\n');

// Récupérer les Trusti Apps (A, B, C)
const trustiApps = dbService.getAppsByType('trusti');
console.log('🌟 TRUSTI APPS (scores A, B, C):');
console.log('   → Applications recommandées\n');
trustiApps.forEach(app => {
  console.log(`   ${app.trustiScore} - ${app.name}`);
});

console.log(`\n   Total: ${trustiApps.length} apps\n`);

// Récupérer les Star Apps (D, E)
const starApps = dbService.getAppsByType('star');
console.log('⚠️  STAR APPS (scores D, E):');
console.log('   → Applications à éviter\n');
starApps.forEach(app => {
  console.log(`   ${app.trustiScore} - ${app.name}`);
});

console.log(`\n   Total: ${starApps.length} apps\n`);

// Statistiques
console.log('═══════════════════════════════════════');
console.log('📊 RÉSUMÉ');
console.log('═══════════════════════════════════════');
console.log(`   Trusti Apps (A/B/C): ${trustiApps.length}`);
console.log(`   Star Apps (D/E):     ${starApps.length}`);
console.log(`   Total:               ${trustiApps.length + starApps.length}`);
console.log('═══════════════════════════════════════\n');

console.log('✅ Classification automatique basée sur trustiScore');
console.log('   Plus besoin du champ appType !\n');
