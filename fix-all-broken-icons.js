/**
 * Script pour corriger toutes les icônes cassées avec des URLs qui fonctionnent
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// URLs d'icônes testées et fonctionnelles (CORS-friendly)
const iconFixes = [
  {
    name: 'Bitwarden',
    icon: 'https://raw.githubusercontent.com/bitwarden/clients/master/apps/web/src/images/icons/android-chrome-192x192.png'
  },
  {
    name: 'Lumo AI',
    icon: 'https://proton.me/favicons/apple-touch-icon.png'
  },
  {
    name: 'Mistral (Le Chat)',
    icon: 'https://avatars.githubusercontent.com/u/132372032?s=200&v=4'
  },
  {
    name: 'DuckDuckGo AI Chat',
    icon: 'https://duckduckgo.com/assets/logo_homepage.normal.v108.svg'
  },
  {
    name: 'Perplexity AI',
    icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  {
    name: 'You.com',
    icon: 'https://avatars.githubusercontent.com/u/100728270?s=200&v=4'
  },
  {
    name: 'ChatGPT',
    icon: 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp'
  },
  {
    name: 'Gemini',
    icon: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png'
  }
];

async function fixBrokenIcons() {
  console.log('🔧 Correction des icônes cassées...\n');
  
  let fixed = 0;
  let notFound = 0;
  
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
        console.log(`   → ${fix.icon.substring(0, 70)}...`);
        fixed++;
      } else {
        console.log(`⚠️  ${fix.name} - non trouvée dans la base`);
        notFound++;
      }
    } catch (error) {
      console.error(`❌ ${fix.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Corrigées: ${fixed}`);
  console.log(`   ⚠️  Non trouvées: ${notFound}`);
  console.log('\n✨ Correction terminée !');
}

fixBrokenIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
