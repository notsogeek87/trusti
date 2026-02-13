import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import gplay from 'google-play-scraper';

const sql = neon(process.env.DATABASE_URL);

async function fixSpecificApps() {
  const appsToFix = [
    { 
      name: 'Android Auto',
      searchTerm: 'Android Auto',
      expectedPackage: 'com.google.android.projection.gearhead'
    },
    { 
      name: 'Audiomack',
      searchTerm: 'Audiomack',
      expectedPackage: 'com.audiomack'
    }
  ];

  console.log('🔧 Correction manuelle des icônes...\n');

  for (const app of appsToFix) {
    console.log(`📱 ${app.name}`);
    
    try {
      // Chercher l'app en BDD par nom
      const dbApps = await sql`
        SELECT id, name, icon
        FROM applications
        WHERE name ILIKE ${`%${app.name}%`}
        LIMIT 5
      `;
      
      if (dbApps.length === 0) {
        console.log(`   ❌ Pas trouvée en BDD\n`);
        continue;
      }
      
      console.log(`   ✓ ${dbApps.length} résultat(s) en BDD`);
      
      // Récupérer depuis Play Store
      console.log(`   🔍 Récupération depuis Play Store...`);
      const playStoreApp = await gplay.app({ appId: app.expectedPackage });
      
      if (!playStoreApp || !playStoreApp.icon) {
        console.log(`   ❌ Icône non trouvée sur Play Store\n`);
        continue;
      }
      
      console.log(`   ✅ Icône trouvée: ${playStoreApp.icon.substring(0, 60)}...`);
      
      // Mettre à jour toutes les occurrences
      for (const dbApp of dbApps) {
        await sql`
          UPDATE applications
          SET icon = ${playStoreApp.icon},
              play_store_url = ${`https://play.google.com/store/apps/details?id=${app.expectedPackage}`},
              updated_at = NOW()
          WHERE id = ${dbApp.id}
        `;
        console.log(`   💾 Mise à jour: ${dbApp.name} (${dbApp.id})`);
      }
      
      console.log(`   ✅ Terminé\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}\n`);
    }
  }
  
  console.log('✅ Correction terminée !');
}

fixSpecificApps();
