/**
 * Script pour diagnostiquer les icônes manquantes
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function diagnoseIcons() {
  console.log('🔍 Diagnostic des icônes...\n');
  
  // Récupérer toutes les apps
  const apps = await sql`
    SELECT name, icon, trusti_score as grade
    FROM applications
    ORDER BY name
    LIMIT 20
  `;
  
  console.log(`📊 Échantillon de 20 apps:\n`);
  
  let missingCount = 0;
  let brokenCount = 0;
  let okCount = 0;
  
  for (const app of apps) {
    const iconUrl = app.icon || '';
    
    if (!iconUrl) {
      console.log(`❌ ${app.name} - PAS D'ICÔNE`);
      missingCount++;
    } else if (iconUrl.length < 10) {
      console.log(`⚠️  ${app.name} - URL trop courte: ${iconUrl}`);
      brokenCount++;
    } else {
      console.log(`✅ ${app.name} - OK (${iconUrl.substring(0, 50)}...)`);
      okCount++;
    }
  }
  
  console.log(`\n📈 Résumé:`);
  console.log(`   ✅ OK: ${okCount}`);
  console.log(`   ⚠️  Problématiques: ${brokenCount}`);
  console.log(`   ❌ Manquantes: ${missingCount}`);
}

diagnoseIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
