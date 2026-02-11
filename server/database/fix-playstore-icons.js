/**
 * Script pour corriger les icônes Play Store problématiques
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const iconFixes = [
  {
    name: 'Lumo AI',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Proton_Technologies_AG_logo.svg/120px-Proton_Technologies_AG_logo.svg.png'
  },
  {
    name: 'Perplexity AI',
    icon: 'https://pbs.twimg.com/profile_images/1730656471172317184/QmM_u9ql_400x400.jpg'
  },
  {
    name: 'ChatGPT',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/120px-ChatGPT_logo.svg.png'
  }
];

async function fixPlayStoreIcons() {
  console.log('🔧 Correction des icônes Play Store cassées...\n');
  
  for (const fix of iconFixes) {
    try {
      const result = await sql`
        UPDATE applications
        SET icon = ${fix.icon}
        WHERE name = ${fix.name}
        RETURNING name
      `;
      
      if (result.length > 0) {
        console.log(`✅ ${fix.name}`);
      } else {
        console.log(`⚠️  ${fix.name} - non trouvée`);
      }
    } catch (error) {
      console.error(`❌ ${fix.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Corrections terminées !');
}

fixPlayStoreIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
