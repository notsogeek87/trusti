/**
 * Script pour vérifier toutes les icônes dans la base de données
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkIcons() {
  console.log('🔍 Vérification de toutes les icônes...\n');
  
  const apps = await sql`
    SELECT name, icon, trusti_score as grade
    FROM applications
    ORDER BY trusti_score, name
  `;
  
  console.log(`📊 Total: ${apps.length} apps\n`);
  
  const problematic = [];
  
  for (const app of apps) {
    const iconUrl = app.icon || '';
    
    // Détection d'icônes potentiellement cassées
    if (!iconUrl) {
      console.log(`❌ ${app.name} (${app.grade}) - PAS D'ICÔNE`);
      problematic.push({ ...app, reason: 'Pas d\'icône' });
    } else if (iconUrl.includes('play.google.com') && iconUrl.length > 200) {
      console.log(`⚠️  ${app.name} (${app.grade}) - URL Google Play trop longue (peut être cassée)`);
      problematic.push({ ...app, reason: 'URL Google Play suspecte' });
    } else if (iconUrl.startsWith('http://') && !iconUrl.startsWith('https://')) {
      console.log(`⚠️  ${app.name} (${app.grade}) - HTTP non sécurisé`);
      problematic.push({ ...app, reason: 'HTTP non sécurisé' });
    }
  }
  
  console.log(`\n📋 Résumé:`);
  console.log(`   ✅ Apps OK: ${apps.length - problematic.length}`);
  console.log(`   ⚠️  Apps à vérifier: ${problematic.length}`);
  
  if (problematic.length > 0) {
    console.log('\n🔧 Apps nécessitant une correction:');
    problematic.forEach(app => {
      console.log(`   - ${app.name}: ${app.reason}`);
    });
  }
}

checkIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
