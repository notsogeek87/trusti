/**
 * Script de migration pour ajouter la colonne "popularity" à la table applications
 * Usage: node server/database/add-popularity-column.js
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

async function addPopularityColumn() {
  console.log('🚀 Migration: Ajout de la colonne popularity...\n');

  try {
    // Vérifier si la colonne existe déjà
    console.log('🔍 Vérification si la colonne popularity existe déjà...');
    
    try {
      // Essayer de faire une requête avec la colonne popularity
      await sql`SELECT popularity FROM applications LIMIT 1`;
      console.log('✅ La colonne popularity existe déjà !');
      console.log('');
    } catch (error) {
      // La colonne n'existe pas, on l'ajoute
      console.log('➕ Ajout de la colonne popularity...');
      await sql`
        ALTER TABLE applications 
        ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 9999
      `;
      console.log('✅ Colonne popularity ajoutée avec succès !');
      console.log('');
    }

    // Créer l'index si nécessaire
    console.log('📊 Création de l\'index sur popularity...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_app_popularity ON applications(popularity)
    `;
    console.log('✅ Index créé avec succès !');
    console.log('');

    // Mettre à jour les valeurs de popularité pour les apps connues
    console.log('🔄 Mise à jour des valeurs de popularité...');
    let updatedCount = 0;
    
    for (let i = 0; i < POPULAR_APPS.length; i++) {
      const appName = POPULAR_APPS[i];
      const popularity = i; // Le rang (0 = le plus populaire)
      
      const result = await sql`
        UPDATE applications 
        SET popularity = ${popularity}
        WHERE name = ${appName}
      `;
      
      if (result.count > 0) {
        console.log(`  ✓ ${appName}: rang ${popularity}`);
        updatedCount++;
      }
    }

    console.log('');
    console.log(`✅ ${updatedCount} applications mises à jour avec leur rang de popularité !`);
    console.log('');

    // Afficher quelques statistiques
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE popularity < 9999) as popular_apps,
        COUNT(*) FILTER (WHERE popularity = 9999) as other_apps,
        COUNT(*) as total
      FROM applications
    `;

    console.log('📊 Statistiques:');
    console.log(`  - Apps populaires (rang défini): ${stats[0].popular_apps}`);
    console.log(`  - Autres apps (rang = 9999): ${stats[0].other_apps}`);
    console.log(`  - Total: ${stats[0].total}`);
    console.log('');

    console.log('🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration
addPopularityColumn();
