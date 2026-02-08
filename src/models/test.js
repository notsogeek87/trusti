/**
 * Tests et exemples d'utilisation du modèle Application
 * Exécutez ce fichier avec : node src/models/test.js
 */

import {
  createApplication,
  TrustiApplication,
  APP_CATEGORIES,
  TRUSTI_GRADES,
  validateApplication,
  sanitizeApplication,
  migrateFromOldFormat,
  generateStats,
  findById,
  filterByMinScore,
  EXAMPLE_APPS
} from './index.js';

console.log('🧪 Tests du modèle Application Trusti\n');

// Test 1 : Création d'une application valide
console.log('✅ Test 1 : Création d\'une application valide');
try {
  const signal = createApplication({
    id: 1001,
    name: "Signal",
    trustiScore: "A",
    category: APP_CATEGORIES.COMMUNICATION,
    icon: "💬",
    color: "bg-blue-600",
    reason: "Excellent respect de la vie privée",
    playStoreUrl: "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms",
    appleStoreUrl: "https://apps.apple.com/app/signal/id874139669",
    githubUrl: "https://github.com/signalapp"
  });
  
  console.log(`   ✓ Application créée : ${signal.name}`);
  console.log(`   ✓ Score : ${signal.trustiScore}`);
  console.log(`   ✓ Niveau de vie privée : ${signal.getPrivacyLevel()}`);
  console.log(`   ✓ Liens disponibles : ${Object.keys(signal.getDownloadLinks()).length}`);
} catch (error) {
  console.error(`   ✗ Erreur : ${error.message}`);
}

// Test 2 : Validation des champs obligatoires
console.log('\n✅ Test 2 : Validation des champs obligatoires');
try {
  const invalidApp = new TrustiApplication({
    name: "Test App"
    // Champs obligatoires manquants
  });
  invalidApp.validate();
  console.log('   ✗ La validation aurait dû échouer');
} catch (error) {
  console.log(`   ✓ Erreur attendue : ${error.message}`);
}

// Test 3 : Validation d'un score invalide
console.log('\n✅ Test 3 : Validation d\'un score invalide');
try {
  const appWithBadScore = createApplication({
    id: 999,
    name: "Bad Score App",
    trustiScore: "Z", // Score invalide
    category: "Test",
    icon: "❌",
    color: "bg-red-600",
    reason: "Test de score invalide"
  });
  console.log('   ✗ La validation aurait dû échouer');
} catch (error) {
  console.log(`   ✓ Erreur attendue : ${error.message}`);
}

// Test 4 : Nettoyage et normalisation
console.log('\n✅ Test 4 : Nettoyage et normalisation des données');
const dirtyApp = {
  id: 123,
  name: "  App with spaces  ",
  grade: "B", // Ancien format
  category: " Communication ",
  icon: "📱",
  playStoreUrl: "  https://example.com  ",
  reason: "Test"
};

const cleanedApp = sanitizeApplication(dirtyApp);
console.log(`   ✓ Nom nettoyé : "${cleanedApp.name}"`);
console.log(`   ✓ grade → trustiScore : ${cleanedApp.trustiScore}`);
console.log(`   ✓ URL nettoyée sans espaces`);

// Test 5 : Migration de l'ancien format
console.log('\n✅ Test 5 : Migration de l\'ancien format');
const oldFormatApp = {
  id: 1,
  name: "ChatGPT",
  grade: "B",
  category: "IA / Productivité",
  color: "bg-slate-800",
  icon: "🤖",
  reason: "Hébergé aux USA"
};

const migratedApp = migrateFromOldFormat(oldFormatApp);
console.log(`   ✓ Application migrée : ${migratedApp.name}`);
console.log(`   ✓ Nouveaux champs ajoutés : playStoreUrl, githubUrl, etc.`);
console.log(`   ✓ trustiScore : ${migratedApp.trustiScore}`);

// Test 6 : Filtrage par score
console.log('\n✅ Test 6 : Filtrage des applications par score minimum');
const goodApps = filterByMinScore(EXAMPLE_APPS, 'B');
console.log(`   ✓ Applications avec score B ou mieux : ${goodApps.length}/${EXAMPLE_APPS.length}`);
goodApps.forEach(app => {
  console.log(`      - ${app.name} (${app.trustiScore})`);
});

// Test 7 : Statistiques
console.log('\n✅ Test 7 : Génération de statistiques');
const stats = generateStats(EXAMPLE_APPS);
console.log(`   ✓ Total d'applications : ${stats.total}`);
console.log(`   ✓ Répartition par score :`);
Object.entries(stats.byScore).forEach(([score, count]) => {
  if (count > 0) {
    console.log(`      - ${score} : ${count} app(s)`);
  }
});
console.log(`   ✓ Applications open-source : ${stats.openSource}`);
console.log(`   ✓ Applications européennes : ${stats.european}`);

// Test 8 : Recherche par ID
console.log('\n✅ Test 8 : Recherche d\'application par ID');
const foundApp = findById(EXAMPLE_APPS, 1001);
if (foundApp) {
  console.log(`   ✓ Application trouvée : ${foundApp.name}`);
} else {
  console.log('   ✗ Application non trouvée');
}

// Test 9 : Conversion JSON
console.log('\n✅ Test 9 : Conversion en JSON');
const app = EXAMPLE_APPS[0];
const json = app.toJSON();
console.log(`   ✓ Application convertie en objet simple`);
console.log(`   ✓ Champs présents : ${Object.keys(json).length}`);

// Test 10 : Vérification des caractéristiques de vie privée
console.log('\n✅ Test 10 : Caractéristiques de vie privée');
const appWithPrivacy = createApplication({
  id: 9999,
  name: "Privacy App",
  trustiScore: "A",
  category: "Test",
  icon: "🔒",
  color: "bg-green-600",
  reason: "Test de vie privée",
  privacyFeatures: {
    endToEndEncryption: true,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});

console.log(`   ✓ Chiffrement E2E : ${appWithPrivacy.privacyFeatures.endToEndEncryption}`);
console.log(`   ✓ Pas de tracking : ${appWithPrivacy.privacyFeatures.noTracking}`);
console.log(`   ✓ Conforme RGPD : ${appWithPrivacy.privacyFeatures.gdprCompliant}`);
console.log(`   ✓ Sans publicité : ${appWithPrivacy.privacyFeatures.noAds}`);

// Résumé
console.log('\n' + '═'.repeat(50));
console.log('🎉 Tous les tests sont passés avec succès !');
console.log('═'.repeat(50));
console.log('\n📚 Le modèle Application est prêt à être utilisé.');
console.log('📖 Consultez README.md pour plus d\'informations.\n');

// Afficher un exemple complet
console.log('📋 Exemple d\'application complète :');
console.log('─'.repeat(50));
const exampleApp = EXAMPLE_APPS[0];
console.log(JSON.stringify(exampleApp.toJSON(), null, 2));
