/**
 * Script de reclassification des applications avec des catégories plus précises
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des applications vers leurs nouvelles catégories
const APP_CATEGORIES = {
  // Email
  'gmail': 'Email',
  'proton-mail': 'Email',
  'protonmail': 'Email',
  'tutanota': 'Email',
  'infomaniak': 'Email',
  'outlook': 'Email',
  
  // Messagerie
  'signal': 'Messagerie',
  'telegram': 'Messagerie',
  'whatsapp': 'Messagerie',
  'threema': 'Messagerie',
  'element': 'Messagerie',
  'discord': 'Messagerie',
  'snapchat': 'Messagerie',
  
  // Visioconférence
  'jitsi': 'Visioconférence',
  'jitsi-meet': 'Visioconférence',
  'zoom': 'Visioconférence',
  'microsoft-teams': 'Visioconférence',
  'teams': 'Visioconférence',
  
  // Réseaux sociaux
  'mastodon': 'Réseaux sociaux',
  'pixelfed': 'Réseaux sociaux',
  'facebook': 'Réseaux sociaux',
  'instagram': 'Réseaux sociaux',
  'twitter': 'Réseaux sociaux',
  'x': 'Réseaux sociaux',
  'tiktok': 'Réseaux sociaux',
  'linkedin': 'Réseaux sociaux',
  'reddit': 'Réseaux sociaux',
  'pinterest': 'Réseaux sociaux',
  
  // Rencontres
  'tinder': 'Rencontres',
  'bumble': 'Rencontres',
  'grindr': 'Rencontres',
  'okcupid': 'Rencontres',
  'hinge': 'Rencontres',
  
  // Navigateurs Web
  'brave': 'Navigateurs Web',
  'brave-browser': 'Navigateurs Web',
  'firefox': 'Navigateurs Web',
  
  // Moteurs de Recherche
  'duckduckgo': 'Moteurs de Recherche',
  'startpage': 'Moteurs de Recherche',
  'ecosia': 'Moteurs de Recherche',
  'google': 'Moteurs de Recherche',
  'google.com': 'Moteurs de Recherche',
  
  // VPN
  'proton-vpn': 'VPN',
  'protonvpn': 'VPN',
  
  // Gestionnaires de Mots de Passe
  'bitwarden': 'Gestionnaires de Mots de Passe',
  'keepassdx': 'Gestionnaires de Mots de Passe',
  'google-password': 'Gestionnaires de Mots de Passe',
  
  // Chiffrement & Sécurité
  'cryptomator': 'Chiffrement & Sécurité',
  
  // Stockage Cloud
  'nextcloud': 'Stockage Cloud',
  'kdrive': 'Stockage Cloud',
  'pcloud': 'Stockage Cloud',
  'onedrive': 'Stockage Cloud',
  'icloud': 'Stockage Cloud',
  'google-drive': 'Stockage Cloud',
  'dropbox': 'Stockage Cloud',
  
  // Prise de Notes
  'simplenote': 'Prise de Notes',
  'standard-notes': 'Prise de Notes',
  'google-keep': 'Prise de Notes',
  
  // Productivité
  'tasks.org': 'Productivité',
  'google-tasks': 'Productivité',
  'payfit': 'Productivité',
  
  // Bureautique
  'libreoffice-viewer': 'Bureautique',
  'collabora-office': 'Bureautique',
  
  // Streaming Musical
  'spotify': 'Streaming Musical',
  'deezer': 'Streaming Musical',
  'apple-music': 'Streaming Musical',
  'youtube-music': 'Streaming Musical',
  'shazam': 'Streaming Musical',
  
  // Streaming Vidéo
  'netflix': 'Streaming Vidéo',
  'youtube': 'Streaming Vidéo',
  'libretube': 'Streaming Vidéo',
  
  // Podcasts
  'antennapod': 'Podcasts',
  
  // Lecteurs Multimédia
  'vlc': 'Lecteurs Multimédia',
  
  // Photo & Vidéo
  'ente-photos': 'Photo & Vidéo',
  'google-photos': 'Photo & Vidéo',
  
  // Banque & Finance
  'lydia': 'Banque & Finance',
  'n26': 'Banque & Finance',
  'qonto': 'Banque & Finance',
  'revolut': 'Banque & Finance',
  'paypal': 'Banque & Finance',
  
  // Paiement Mobile
  'apple-pay': 'Paiement Mobile',
  'google-wallet': 'Paiement Mobile',
  'curve-pay': 'Paiement Mobile',
  
  // Transport & Mobilité
  'blablacar': 'Transport & Mobilité',
  'uber': 'Transport & Mobilité',
  'lyft': 'Transport & Mobilité',
  
  // Livraison de Repas
  'uber-eats': 'Livraison de Repas',
  'deliveroo': 'Livraison de Repas',
  'doordash': 'Livraison de Repas',
  'grubhub': 'Livraison de Repas',
  
  // Voyages & Hébergement
  'airbnb': 'Voyages & Hébergement',
  'booking': 'Voyages & Hébergement',
  'booking.com': 'Voyages & Hébergement',
  'tripadvisor': 'Voyages & Hébergement',
  
  // E-commerce
  'amazon': 'E-commerce',
  'amazon-shopping': 'E-commerce',
  
  // Petites Annonces
  'leboncoin': 'Petites Annonces',
  'vinted': 'Petites Annonces',
  
  // Anti-gaspillage
  'too-good-to-go': 'Anti-gaspillage',
  'yuka': 'Anti-gaspillage',
  
  // Santé & Médical
  'alan': 'Santé & Médical',
  'doctolib': 'Santé & Médical',
  
  // Méditation & Bien-être
  'headspace': 'Méditation & Bien-être',
  'calm': 'Méditation & Bien-être',
  
  // Sport & Fitness
  'strava': 'Sport & Fitness',
  'myfitnesspal': 'Sport & Fitness',
  'nike-run-club': 'Sport & Fitness',
  'fitbit': 'Sport & Fitness',
  'peloton': 'Sport & Fitness',
  
  // Navigation GPS
  'roole-maps': 'Navigation GPS',
  'osmand': 'Navigation GPS',
  'organic-maps': 'Navigation GPS',
  'waze': 'Navigation GPS',
  'google-maps': 'Navigation GPS',
  
  // IA
  'chatgpt': 'IA',
  'lumo-ai': 'IA',
  
  // Jeux
  'candy-crush': 'Jeux',
  'among-us': 'Jeux',
  'minecraft': 'Jeux',
  'fortnite': 'Jeux',
  'pokemon-go': 'Jeux',
  'clash-of-clans': 'Jeux',
  'pubg-mobile': 'Jeux',
  
  // Éducation
  'duolingo': 'Éducation',
  
  // Utilitaires
  'f-droid': 'Utilitaires',
  
  // Agrégateurs RSS
  'inoreader': 'Agrégateurs RSS',
  'feedly': 'Agrégateurs RSS',
};

// Fonction pour normaliser les IDs
function normalizeId(id) {
  return String(id).toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Fonction pour détecter la catégorie d'une application
function detectCategory(app) {
  const normalizedId = normalizeId(app.id);
  const normalizedName = normalizeId(app.name);
  
  // Recherche exacte par ID
  if (APP_CATEGORIES[normalizedId]) {
    return APP_CATEGORIES[normalizedId];
  }
  
  // Recherche par nom
  if (APP_CATEGORIES[normalizedName]) {
    return APP_CATEGORIES[normalizedName];
  }
  
  // Recherche par correspondance partielle
  for (const [key, category] of Object.entries(APP_CATEGORIES)) {
    if (normalizedId.includes(key) || normalizedName.includes(key)) {
      return category;
    }
  }
  
  // Si aucune catégorie trouvée, on conserve l'ancienne ou on met "Autre"
  return app.category === 'Application' ? 'Autre' : app.category;
}

// Script principal
async function reclassifyApps() {
  try {
    console.log('🔄 Début de la reclassification...\n');
    
    const appsPath = path.join(__dirname, 'data', 'apps.json');
    const data = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
    
    let changed = 0;
    let unchanged = 0;
    const changes = [];
    
    data.applications.forEach((app) => {
      const oldCategory = app.category;
      const newCategory = detectCategory(app);
      
      if (oldCategory !== newCategory) {
        app.category = newCategory;
        changes.push({
          name: app.name,
          id: app.id,
          old: oldCategory,
          new: newCategory
        });
        changed++;
      } else {
        unchanged++;
      }
    });
    
    // Sauvegarde
    fs.writeFileSync(appsPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('✅ Reclassification terminée !');
    console.log(`📊 Statistiques:`);
    console.log(`   - Applications modifiées: ${changed}`);
    console.log(`   - Applications inchangées: ${unchanged}`);
    console.log(`   - Total: ${data.applications.length}\n`);
    
    if (changes.length > 0) {
      console.log('📋 Changements effectués:\n');
      changes.forEach((change) => {
        console.log(`   ${change.name} (${change.id})`);
        console.log(`      ${change.old} → ${change.new}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
reclassifyApps();
