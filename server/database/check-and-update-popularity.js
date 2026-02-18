/**
 * Script pour vérifier et mettre à jour les rangs de popularité
 * Usage: node server/database/check-and-update-popularity.js
 */

import { neon } from '@neondatabase/serverless';

// Charger .env en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv peut ne pas être installé en production
  }
}

// Initialiser la connexion Neon
const sql = neon(process.env.DATABASE_URL);

// Liste des apps populaires (ordre de téléchargement)
const POPULAR_APPS = [
  'WhatsApp Messenger', 'YouTube', 'Instagram', 'Facebook', 'TikTok', 'Snapchat',
  'Telegram', 'Google Chrome', 'Messenger', 'Google Maps', 'Gmail', 'Google Photos',
  'PUBG Mobile', 'Free Fire', 'Roblox', 'Spotify', 'Netflix', 'Amazon Shopping',
  'Flipkart', 'Shopee', 'Candy Crush Saga', 'Subway Surfers', 'Clash of Clans',
  'Clash Royale', 'Duolingo', 'Google Play Games', 'Phone by Google', 'Google Messages',
  'Google Drive', 'Google Play services', 'MyJio', 'PhonePe', 'Truecaller', 'MX Player',
  'Hotstar', 'ShareChat', 'Ulike', 'Zalo', 'OLX', 'Lazada', 'PicsArt', 'CapCut',
  'Kuaishou', 'Meitu', 'UC Browser', 'SHAREit', 'XRecorder', 'InShot', 'VN Video Editor', 'KineMaster'
];

async function checkAndUpdatePopularity() {
  console.log('🔍 Récupération des noms d\'apps depuis la BDD...\n');

  try {
    // Récupérer tous les noms d'apps
    const allApps = await sql`
      SELECT id, name, popularity FROM applications
      ORDER BY name ASC
    `;

    console.log(`📦 ${allApps.length} applications trouvées dans la BDD\n`);

    // Chercher les correspondances
    const matches = [];
    const partialMatches = [];

    for (let i = 0; i < POPULAR_APPS.length; i++) {
      const popularName = POPULAR_APPS[i];
      const rank = i;

      // Recherche exacte
      const exactMatch = allApps.find(app => app.name === popularName);
      if (exactMatch) {
        matches.push({ app: exactMatch, popularName, rank, type: 'exact' });
        continue;
      }

      // Recherche partielle plus intelligente
      const partialMatch = allApps.find(app => {
        const appNameLower = app.name.toLowerCase();
        const popularNameLower = popularName.toLowerCase();
        
        // Ignorer les matchs trop courts qui causent des faux positifs
        if (popularNameLower.length < 4 && appNameLower !== popularNameLower) {
          return false;
        }
        
        // Cas spéciaux
        if (popularNameLower === 'whatsapp messenger' && appNameLower.startsWith('whatsapp')) return true;
        if (popularNameLower === 'youtube' && appNameLower === 'youtube') return true;
        if (popularNameLower === 'google chrome' && appNameLower === 'google chrome') return true;
        if (popularNameLower === 'gmail' && appNameLower === 'gmail') return true;
        if (popularNameLower === 'google play games' && appNameLower.includes('google play games')) return true;
        if (popularNameLower === 'google messages' && appNameLower.includes('google messages')) return true;
        if (popularNameLower === 'google play services' && appNameLower.includes('google play services')) return true;
        
        // Match général: le nom de la BDD commence par le nom populaire OU contient le nom exact
        const words = popularNameLower.split(' ');
        const mainWord = words[0];
        
        // Pour éviter les faux positifs, on ne matche que si:
        // 1. Le nom BDD commence par le nom populaire (ex: "Flipkart..." commence par "Flipkart")
        // 2. OU le nom populaire est inclus entre espaces/début/fin dans le nom BDD
        const startsWithPopular = appNameLower.startsWith(popularNameLower);
        const containsExactName = appNameLower.includes(popularNameLower);
        const isMainWordMatch = mainWord.length > 3 && appNameLower.startsWith(mainWord) && !['google', 'phone', 'video'].includes(mainWord);
        
        return startsWithPopular || (containsExactName && words.length > 1) || isMainWordMatch;
      });

      if (partialMatch) {
        partialMatches.push({ app: partialMatch, popularName, rank, type: 'partial' });
      }
    }

    console.log(`✅ ${matches.length} correspondances exactes trouvées`);
    console.log(`⚠️  ${partialMatches.length} correspondances partielles trouvées\n`);

    // Afficher les correspondances exactes
    if (matches.length > 0) {
      console.log('📋 Correspondances EXACTES :');
      matches.forEach(m => {
        console.log(`  ${m.rank}. ${m.app.name} (actuellement: ${m.app.popularity})`);
      });
      console.log('');
    }

    // Afficher les correspondances partielles
    if (partialMatches.length > 0) {
      console.log('📋 Correspondances PARTIELLES à vérifier :');
      partialMatches.forEach(m => {
        console.log(`  ${m.rank}. "${m.popularName}" → "${m.app.name}" (actuellement: ${m.app.popularity})`);
      });
      console.log('');
    }

    // Apps populaires non trouvées
    const foundNames = [...matches, ...partialMatches].map(m => m.popularName);
    const notFound = POPULAR_APPS.filter(name => !foundNames.includes(name));
    
    if (notFound.length > 0) {
      console.log(`❌ ${notFound.length} apps populaires NON trouvées dans la BDD :`);
      notFound.slice(0, 10).forEach(name => console.log(`  - ${name}`));
      if (notFound.length > 10) {
        console.log(`  ... et ${notFound.length - 10} autres`);
      }
      console.log('');
    }

    // Mettre à jour les rangs
    console.log('🔄 Mise à jour des rangs de popularité...\n');

    let updateCount = 0;
    const allMatches = [...matches, ...partialMatches];

    for (const match of allMatches) {
      // Mettre à jour seulement si le rang a changé
      if (match.app.popularity !== match.rank) {
        const result = await sql`
          UPDATE applications 
          SET popularity = ${match.rank}
          WHERE id = ${match.app.id}
        `;
        
        if (result.count > 0) {
          console.log(`  ✓ ${match.app.name}: ${match.app.popularity} → ${match.rank}`);
          updateCount++;
        }
      } else {
        console.log(`  ○ ${match.app.name}: déjà au rang ${match.rank}`);
      }
    }

    console.log('');
    console.log(`✅ ${updateCount} applications mises à jour avec succès !`);
    console.log('');

    // Statistiques finales
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE popularity < 9999) as popular_apps,
        COUNT(*) FILTER (WHERE popularity = 9999) as other_apps,
        COUNT(*) as total
      FROM applications
    `;

    console.log('📊 Statistiques finales:');
    console.log(`  - Apps populaires (rang défini): ${stats[0].popular_apps}`);
    console.log(`  - Autres apps (rang = 9999): ${stats[0].other_apps}`);
    console.log(`  - Total: ${stats[0].total}`);
    console.log('');

    // Montrer le top 10
    const top10 = await sql`
      SELECT name, popularity 
      FROM applications 
      WHERE popularity < 9999
      ORDER BY popularity ASC
      LIMIT 10
    `;

    if (top10.length > 0) {
      console.log('🏆 Top 10 des apps les plus populaires :');
      top10.forEach((app, idx) => {
        console.log(`  ${idx + 1}. ${app.name} (rang: ${app.popularity})`);
      });
    }

    console.log('');
    console.log('🎉 Terminé !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

// Exécuter le script
checkAndUpdatePopularity();
