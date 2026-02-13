import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixBeReal() {
  const appId = 'app_1770825752659_v1q9eago9';
  const icon = 'https://play-lh.googleusercontent.com/8Lu1K0dDM8hFB3wlkUgUvOOw9hc7NRwVijiEPqeXZhzz7t2Q3jktTZ_aqT3kofwurG4';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.bereal.ft';
  
  console.log('🔧 Correction de BeReal...\n');
  
  try {
    // Vérifier que l'app existe
    const apps = await sql`
      SELECT id, name, icon
      FROM applications
      WHERE id = ${appId}
    `;
    
    if (apps.length === 0) {
      console.log('❌ BeReal non trouvée en BDD\n');
      return;
    }
    
    console.log(`📱 ${apps[0].name}`);
    console.log(`   ID: ${apps[0].id}`);
    console.log(`   Icône actuelle: ${apps[0].icon || '(vide)'}`);
    
    // Mettre à jour
    await sql`
      UPDATE applications
      SET icon = ${icon},
          play_store_url = ${playStoreUrl},
          updated_at = NOW()
      WHERE id = ${appId}
    `;
    
    console.log(`   ✅ Nouvelle icône: ${icon.substring(0, 60)}...`);
    console.log(`   💾 Mise à jour réussie\n`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

fixBeReal();
