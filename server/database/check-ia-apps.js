/**
 * Script pour vérifier spécifiquement les apps IA
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkIAApps() {
  console.log('🤖 Vérification des apps IA...\n');
  
  const iaApps = await sql`
    SELECT name, icon, trusti_score as grade, category
    FROM applications
    WHERE category = 'IA'
    ORDER BY trusti_score, name
  `;
  
  console.log(`📊 Apps IA trouvées: ${iaApps.length}\n`);
  
  for (const app of iaApps) {
    console.log(`${app.grade === 'A' ? '🌟' : '⭐'} ${app.name} (Grade ${app.grade})`);
    console.log(`   Icon: ${app.icon}`);
    console.log('');
  }
}

checkIAApps()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
