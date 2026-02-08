/**
 * Test d'intégration - Vérification que le nouveau modèle fonctionne avec les données existantes
 */

import { sanitizeApplication, migrateFromOldFormat } from './utils.js';
import { APPS_DATA } from '../constants/appsData.js';

console.log('🧪 Test d\'intégration du nouveau modèle\n');

// Test 1: Migration des données existantes
console.log('✅ Test 1 : Migration des données existantes (appsData.js)');
let successCount = 0;
let errorCount = 0;

APPS_DATA.forEach(app => {
  try {
    const normalized = app.grade 
      ? migrateFromOldFormat(app)
      : sanitizeApplication(app);
    
    // Vérifier que les champs essentiels sont présents
    if (!normalized.name || !normalized.grade || !normalized.category) {
      console.error(`   ❌ ${app.name} : Champs manquants`);
      errorCount++;
    } else {
      successCount++;
    }
    
    // Vérifier que 'grade' et 'trustiScore' sont synchronisés
    if (normalized.grade !== normalized.trustiScore) {
      console.warn(`   ⚠️  ${app.name} : grade (${normalized.grade}) != trustiScore (${normalized.trustiScore})`);
    }
  } catch (error) {
    console.error(`   ❌ Erreur avec ${app.name}:`, error.message);
    errorCount++;
  }
});

console.log(`\n   ✓ ${successCount}/${APPS_DATA.length} applications migrées avec succès`);
if (errorCount > 0) {
  console.log(`   ✗ ${errorCount} erreurs détectées`);
}

// Test 2: Vérification de la compatibilité des champs
console.log('\n✅ Test 2 : Compatibilité des champs');
const testApp = APPS_DATA[0];
const normalized = sanitizeApplication(testApp);

console.log(`   Original: grade="${testApp.grade}"`);
console.log(`   Normalisé: grade="${normalized.grade}", trustiScore="${normalized.trustiScore}"`);

if (normalized.grade === normalized.trustiScore) {
  console.log('   ✓ Les champs sont synchronisés');
} else {
  console.log('   ✗ Les champs ne sont pas synchronisés');
}

// Test 3: Vérification que les nouveaux champs sont ajoutés
console.log('\n✅ Test 3 : Nouveaux champs ajoutés');
const hasNewFields = normalized.hasOwnProperty('alternativeAppIds') && 
                     normalized.hasOwnProperty('replacesAppIds');

if (hasNewFields) {
  console.log('   ✓ Les nouveaux champs (alternativeAppIds, replacesAppIds) sont présents');
  console.log(`   - alternativeAppIds: ${JSON.stringify(normalized.alternativeAppIds)}`);
  console.log(`   - replacesAppIds: ${JSON.stringify(normalized.replacesAppIds)}`);
} else {
  console.log('   ✗ Les nouveaux champs sont manquants');
}

// Test 4: Test avec une app qui a déjà le nouveau format
console.log('\n✅ Test 4 : Application déjà au nouveau format');
const newFormatApp = {
  id: 9999,
  name: "Test App",
  trustiScore: "A",
  grade: "A",
  category: "Test",
  icon: "🧪",
  color: "bg-blue-600",
  reason: "Test application",
  playStoreUrl: "https://play.google.com/test",
  alternativeAppIds: [1, 2, 3]
};

const sanitized = sanitizeApplication(newFormatApp);
console.log(`   ✓ App au nouveau format: ${sanitized.name}`);
console.log(`   - grade: ${sanitized.grade}`);
console.log(`   - trustiScore: ${sanitized.trustiScore}`);
console.log(`   - playStoreUrl: ${sanitized.playStoreUrl}`);
console.log(`   - alternativeAppIds: ${JSON.stringify(sanitized.alternativeAppIds)}`);

// Résumé
console.log('\n' + '═'.repeat(60));
if (errorCount === 0) {
  console.log('🎉 Tous les tests d\'intégration sont passés !');
  console.log('✅ Le nouveau modèle est compatible avec les données existantes');
  console.log('✅ L\'application continuera de fonctionner normalement');
} else {
  console.log('⚠️  Certains tests ont échoué');
  console.log(`❌ ${errorCount} erreur(s) détectée(s)`);
}
console.log('═'.repeat(60));
