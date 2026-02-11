/**
 * Script pour restaurer les icônes avec des URLs ultra-stables
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// URLs d'icônes compatibles (Wikipedia, GitHub, CDN stables)
const iconUpdates = [
  {
    name: 'Lumo AI',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Proton_Technologies_AG_logo.svg/120px-Proton_Technologies_AG_logo.svg.png'
  },
  {
    name: 'Mistral (Le Chat)',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Mistral_AI_logo.svg/120px-Mistral_AI_logo.svg.png'
  },
  {
    name: 'DuckDuckGo AI Chat',
    icon: 'https://upload.wikimedia.org/wikipedia/en/9/90/The_DuckDuckGo_Duck.png'
  },
  {
    name: 'Perplexity AI',
    icon: 'https://pbs.twimg.com/profile_images/1730656471172317184/QmM_u9ql_400x400.jpg'
  },
  {
    name: 'HuggingChat',
    icon: 'https://avatars.githubusercontent.com/u/25720743?s=200&v=4'
  },
  {
    name: 'Ollama',
    icon: 'https://avatars.githubusercontent.com/u/151674099?s=200&v=4'
  },
  {
    name: 'You.com',
    icon: 'https://pbs.twimg.com/profile_images/1669403207969579008/JlcZ7z_v_400x400.jpg'
  },
  {
    name: 'ChatGPT',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/120px-ChatGPT_logo.svg.png'
  },
  {
    name: 'Gemini',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/120px-Google_Gemini_logo.svg.png'
  }
];

async function fixIcons() {
  console.log('🔧 Restauration des icônes avec URLs stables...\n');
  
  for (const update of iconUpdates) {
    try {
      const result = await sql`
        UPDATE applications
        SET icon = ${update.icon}
        WHERE name = ${update.name}
        RETURNING name
      `;
      
      if (result.length > 0) {
        console.log(`✅ ${update.name}`);
      } else {
        console.log(`⚠️  ${update.name} - non trouvée`);
      }
    } catch (error) {
      console.error(`❌ ${update.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Restauration terminée !');
}

fixIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
