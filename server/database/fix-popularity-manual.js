/**
 * Script pour corriger manuellement les rangs de popularité incorrects
 * Usage: node server/database/fix-popularity-manual.js
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

async function fixPopularityRanks() {
  console.log('🔧 Correction manuelle des rangs de popularité...\n');

  try {
    // 1. Corriger WhatsApp : doit avoir le rang 0 (c'est "WhatsApp Messenger" dans POPULAR_APPS)
    console.log('1️⃣ Correction de WhatsApp...');
    const whatsappResult = await sql`
      UPDATE applications 
      SET popularity = 0
      WHERE name = 'Whatsapp'
    `;
    
    if (whatsappResult.count > 0) {
      console.log('   ✓ WhatsApp mis au rang 0');
    } else {
      console.log('   ⚠️  WhatsApp non trouvé');
    }

    // 2. Corriger Messenger : doit avoir le rang 8 (pas 0)
    console.log('\n2️⃣ Correction de Messenger...');
    const messengerResult = await sql`
      UPDATE applications 
      SET popularity = 8
      WHERE name = 'Messenger'
    `;
    
    if (messengerResult.count > 0) {
      console.log('   ✓ Messenger mis au rang 8');
    } else {
      console.log('   ⚠️  Messenger non trouvé');
    }

    // 3. Enlever le rang de Clash of Clans s'il a le rang 23 (qui devrait être pour Clash Royale)
    // Clash of Clans devrait être au rang 22
    console.log('\n3️⃣ Vérification de Clash of Clans...');
    const clashCheck = await sql`
      SELECT name, popularity FROM applications 
      WHERE name LIKE '%Clash%'
    `;
    
    console.log('   Apps "Clash" trouvées:');
    clashCheck.forEach(app => {
      console.log(`   - ${app.name}: rang ${app.popularity}`);
    });

    // Si Clash of Clans a le mauvais rang, le corriger
    const clashOfClans = clashCheck.find(a => a.name.includes('Clash of Clans'));
    if (clashOfClans && clashOfClans.popularity === 23) {
      await sql`
        UPDATE applications 
        SET popularity = 22
        WHERE name = ${clashOfClans.name}
      `;
      console.log('   ✓ Clash of Clans corrigé au rang 22');
    }

    // 4. Vérifier Google Chrome
    console.log('\n4️⃣ Vérification de Google Chrome...');
    const chromeCheck = await sql`
      SELECT name, popularity FROM applications 
      WHERE name ILIKE '%chrome%'
    `;
    
    if (chromeCheck.length > 0) {
      console.log('   Apps "Chrome" trouvées:');
      chromeCheck.forEach(app => {
        console.log(`   - ${app.name}: rang ${app.popularity}`);
      });
      
      // Google Chrome devrait être au rang 7
      const chrome = chromeCheck.find(a => a.name.toLowerCase().includes('google chrome'));
      if (chrome) {
        await sql`
          UPDATE applications 
          SET popularity = 7
          WHERE name = ${chrome.name}
        `;
        console.log('   ✓ Google Chrome mis au rang 7');
      }
    } else {
      console.log('   ⚠️  Aucune app Chrome trouvée');
    }

    console.log('\n📊 Statistiques finales après corrections:');
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE popularity < 9999) as popular_apps,
        COUNT(*) FILTER (WHERE popularity = 9999) as other_apps,
        COUNT(*) as total
      FROM applications
    `;

    console.log(`  - Apps populaires (rang défini): ${stats[0].popular_apps}`);
    console.log(`  - Autres apps (rang = 9999): ${stats[0].other_apps}`);
    console.log(`  - Total: ${stats[0].total}`);

    // Afficher le top 15
    console.log('\n🏆 Top 15 des apps les plus populaires:');
    const top15 = await sql`
      SELECT name, popularity 
      FROM applications 
      WHERE popularity < 9999
      ORDER BY popularity ASC
      LIMIT 15
    `;

    top15.forEach((app, idx) => {
      console.log(`  ${String(idx + 1).padStart(2, ' ')}. ${app.name.padEnd(35)} (rang: ${app.popularity})`);
    });

    console.log('\n✅ Corrections terminées !');

  } catch (error) {
    console.error('❌ Erreur lors des corrections:', error);
    throw error;
  }
}

// Exécuter le script
fixPopularityRanks();
