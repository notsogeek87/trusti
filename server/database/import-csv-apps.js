/**
 * Script d'importation d'applications depuis un CSV
 * Enrichit automatiquement avec les données du Play Store
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gplay from 'google-play-scraper';
import { getAllApps, createApp } from './service-json.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des catégories basé sur les mots-clés
const CATEGORY_MAPPING = {
  'mail': 'Email',
  'email': 'Email',
  'vpn': 'Sécurité',
  'messenger': 'Messagerie',
  'message': 'Messagerie',
  'chat': 'Communication',
  'signal': 'Messagerie',
  'telegram': 'Messagerie',
  'whatsapp': 'Messagerie',
  'cloud': 'Stockage Cloud',
  'drive': 'Stockage Cloud',
  'storage': 'Stockage Cloud',
  'password': 'Sécurité',
  'keepass': 'Sécurité',
  'bitwarden': 'Sécurité',
  'browser': 'Navigation',
  'firefox': 'Navigation',
  'brave': 'Navigation',
  'office': 'Bureautique',
  'document': 'Bureautique',
  'libreoffice': 'Bureautique',
  'collabora': 'Bureautique',
  'music': 'Musique',
  'spotify': 'Musique',
  'deezer': 'Musique',
  'video': 'Vidéo',
  'vlc': 'Multimédia',
  'player': 'Multimédia',
  'netflix': 'Vidéo',
  'maps': 'Cartographie',
  'navigation': 'Cartographie',
  'waze': 'Cartographie',
  'food': 'Shopping',
  'shopping': 'Shopping',
  'amazon': 'Shopping',
  'vinted': 'Shopping',
  'leboncoin': 'Shopping',
  'bank': 'Finance',
  'banking': 'Finance',
  'finance': 'Finance',
  'paypal': 'Finance',
  'revolut': 'Finance',
  'n26': 'Finance',
  'lydia': 'Finance',
  'qonto': 'Finance',
  'health': 'Santé',
  'santé': 'Santé',
  'doctolib': 'Santé',
  'alan': 'Santé',
  'fitness': 'Sport',
  'sport': 'Sport',
  'strava': 'Sport',
  'nike': 'Sport',
  'game': 'Jeux',
  'play': 'Jeux',
  'minecraft': 'Jeux',
  'pokemon': 'Jeux',
  'fortnite': 'Jeux',
  'social': 'Réseaux sociaux',
  'facebook': 'Réseaux sociaux',
  'instagram': 'Réseaux sociaux',
  'twitter': 'Réseaux sociaux',
  'tiktok': 'Réseaux sociaux',
  'linkedin': 'Réseaux sociaux',
  'mastodon': 'Réseaux sociaux',
  'reddit': 'Réseaux sociaux',
  'dating': 'Réseaux sociaux',
  'tinder': 'Réseaux sociaux',
  'bumble': 'Réseaux sociaux',
  'meet': 'Communication',
  'zoom': 'Communication',
  'teams': 'Communication',
  'jitsi': 'Communication',
  'note': 'Productivité',
  'notes': 'Productivité',
  'standard notes': 'Productivité',
  'podcast': 'Multimédia',
  'antennapod': 'Multimédia',
  'ride': 'Transport',
  'uber': 'Transport',
  'blablacar': 'Transport',
  'delivery': 'Shopping',
  'deliveroo': 'Shopping',
  'uber eats': 'Shopping',
  'food delivery': 'Shopping',
  'meditation': 'Santé',
  'headspace': 'Santé',
  'calm': 'Santé',
  'learn': 'Éducation',
  'duolingo': 'Éducation',
  'search': 'Navigation',
  'ecosia': 'Navigation',
  'duckduckgo': 'Navigation',
  'yuka': 'Shopping',
  'crypto': 'Sécurité',
  'cryptomator': 'Sécurité',
  'fdroid': 'Utilitaires',
  'store': 'Utilitaires',
  'travel': 'Transport',
  'booking': 'Transport',
  'airbnb': 'Transport',
  'tripadvisor': 'Transport'
};

/**
 * Normaliser le nom d'une app pour la recherche
 */
function normalizeAppName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Déterminer la catégorie d'une app basée sur son nom
 */
function guessCategory(appName, playstoreCategory = null) {
  const normalized = normalizeAppName(appName);
  
  // Vérifier les mots-clés
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }
  
  // Utiliser la catégorie Play Store si disponible
  if (playstoreCategory) {
    const categoryMap = {
      'COMMUNICATION': 'Communication',
      'SOCIAL': 'Réseaux sociaux',
      'PRODUCTIVITY': 'Productivité',
      'TOOLS': 'Utilitaires',
      'FINANCE': 'Finance',
      'HEALTH_AND_FITNESS': 'Sport',
      'SHOPPING': 'Shopping',
      'TRAVEL_AND_LOCAL': 'Transport',
      'MUSIC_AND_AUDIO': 'Musique',
      'VIDEO_PLAYERS': 'Vidéo',
      'PHOTOGRAPHY': 'Photo',
      'GAME': 'Jeux',
      'EDUCATION': 'Éducation',
      'BUSINESS': 'Productivité',
      'MAPS_AND_NAVIGATION': 'Cartographie',
      'FOOD_AND_DRINK': 'Shopping'
    };
    
    return categoryMap[playstoreCategory] || 'Application';
  }
  
  return 'Application';
}

/**
 * Générer une raison basée sur la note
 */
function generateReason(grade) {
  const reasons = {
    'A': 'Application exemplaire en matière de confidentialité, transparence et gouvernance. Recommandée par Trusti.',
    'B': 'Bonne application avec quelques points d\'attention sur la confidentialité ou la localisation des données.',
    'C': 'Application correcte mais avec des compromis notables sur la vie privée ou la juridiction.',
    'D': 'Application présentant des risques significatifs pour la vie privée. Utilisez avec précaution.',
    'E': 'Application déconseillée en raison de pratiques problématiques concernant les données personnelles.'
  };
  
  return reasons[grade] || reasons['C'];
}

/**
 * Chercher une app sur le Play Store
 */
async function searchPlayStore(appName) {
  try {
    console.log(`  🔍 Recherche sur Play Store: "${appName}"`);
    
    // Recherche exacte
    const results = await gplay.search({
      term: appName,
      num: 5,
      lang: 'fr',
      country: 'fr'
    });
    
    if (results.length === 0) {
      console.log(`  ⚠️  Aucun résultat trouvé`);
      return null;
    }
    
    // Prendre le premier résultat (généralement le plus pertinent)
    const bestMatch = results[0];
    
    // Récupérer les détails complets de l'app
    const appDetails = await gplay.app({ 
      appId: bestMatch.appId,
      lang: 'fr',
      country: 'fr'
    });
    
    console.log(`  ✅ Trouvé: ${appDetails.title} (${appDetails.appId})`);
    
    return {
      packageId: appDetails.appId,
      icon: appDetails.icon,
      playStoreUrl: `https://play.google.com/store/apps/details?id=${appDetails.appId}`,
      developer: appDetails.developer,
      category: appDetails.genre,
      description: appDetails.summary || appDetails.description?.substring(0, 200),
      website: appDetails.developerWebsite
    };
    
  } catch (error) {
    console.log(`  ❌ Erreur de recherche: ${error.message}`);
    return null;
  }
}

/**
 * Parser le CSV
 */
function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Sauter la ligne d'en-tête
  const dataLines = lines.slice(1);
  
  const apps = [];
  for (const line of dataLines) {
    // Parser simplement en séparant par virgule
    // Prendre la première colonne et la dernière
    const cols = line.split(',');
    if (cols.length < 2) continue;
    
    const name = cols[0].trim();
    const grade = cols[cols.length - 1].trim();
    
    // Vérifier que la note est valide
    if (!['A', 'B', 'C', 'D', 'E'].includes(grade)) continue;
    
    apps.push({ name, grade });
  }
  
  return apps;
}

/**
 * Vérifier si une app existe déjà en BDD
 */
function appExists(existingApps, appName) {
  const normalized = normalizeAppName(appName);
  return existingApps.some(app => 
    normalizeAppName(app.name) === normalized
  );
}

/**
 * Créer l'ID d'une app
 */
function createAppId(appName) {
  return appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Générer une couleur basée sur la note
 */
function getColorForGrade(grade) {
  const colors = {
    'A': 'bg-green-600',
    'B': 'bg-blue-600',
    'C': 'bg-yellow-600',
    'D': 'bg-orange-600',
    'E': 'bg-red-600'
  };
  return colors[grade] || 'bg-gray-600';
}

/**
 * Importer les applications
 */
async function importApps(csvPath) {
  console.log('🚀 Importation d\'applications depuis CSV\n');
  console.log('━'.repeat(60));
  
  // Récupérer les apps existantes
  console.log('\n📚 Chargement des apps existantes...');
  const existingApps = getAllApps();
  console.log(`   ${existingApps.length} apps en BDD`);
  
  // Parser le CSV
  console.log('\n📄 Lecture du CSV...');
  const csvApps = parseCSV(csvPath);
  console.log(`   ${csvApps.length} apps dans le CSV`);
  
  // Filtrer les apps à ajouter
  const newApps = csvApps.filter(app => !appExists(existingApps, app.name));
  console.log(`   ${newApps.length} nouvelles apps à ajouter\n`);
  
  if (newApps.length === 0) {
    console.log('✅ Aucune nouvelle app à ajouter !');
    return;
  }
  
  // Traiter chaque nouvelle app
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < newApps.length; i++) {
    const { name, grade } = newApps[i];
    
    console.log(`\n[${i + 1}/${newApps.length}] ${name} (Note: ${grade})`);
    console.log('─'.repeat(60));
    
    try {
      // Chercher sur le Play Store
      const playStoreData = await searchPlayStore(name);
      
      // Préparer les données de l'app
      const appData = {
        id: createAppId(name),
        name: name,
        trustiScore: grade,
        grade: grade,
        category: playStoreData ? guessCategory(name, playStoreData.category) : guessCategory(name),
        icon: playStoreData?.icon || '📱',
        color: getColorForGrade(grade),
        reason: generateReason(grade),
        playStoreUrl: playStoreData?.playStoreUrl || null,
        developer: playStoreData?.developer || null,
        description: playStoreData?.description || null,
        website: playStoreData?.website || null,
        appType: 'regular'
      };
      
      // Insérer en BDD
      createApp(appData);
      successCount++;
      
      console.log(`  ✅ Ajouté avec succès`);
      console.log(`     Catégorie: ${appData.category}`);
      console.log(`     Icône: ${playStoreData ? '✓ Play Store' : '📱 Par défaut'}`);
      
      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`);
      failCount++;
    }
  }
  
  // Résumé
  console.log('\n' + '━'.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('━'.repeat(60));
  console.log(`✅ Apps ajoutées: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  console.log(`📚 Total en BDD: ${existingApps.length + successCount}`);
  console.log('━'.repeat(60));
  console.log('\n✨ Import terminé !\n');
}

// Lancer l'import
const CSV_PATH = process.argv[2] || path.join(__dirname, '../../tableau_notes_apps.csv');

if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ Fichier CSV non trouvé: ${CSV_PATH}`);
  console.log('\nUtilisation: node import-csv-apps.js [chemin-vers-csv]');
  process.exit(1);
}

importApps(CSV_PATH).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
