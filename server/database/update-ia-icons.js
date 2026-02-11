/**
 * Script pour mettre à jour les icônes des apps IA dans PostgreSQL
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Icônes fiables pour chaque app IA (Wikipedia, CDN stables, ou logos officiels)
const iconUpdates = [
  {
    name: 'Lumo AI',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Proton_Technologies_AG_logo.svg/240px-Proton_Technologies_AG_logo.svg.png'
  },
  {
    name: 'Mistral (Le Chat)',
    icon: 'https://docs.mistral.ai/img/logo.svg'
  },
  {
    name: 'DuckDuckGo AI Chat',
    icon: 'https://upload.wikimedia.org/wikipedia/en/9/90/The_DuckDuckGo_Duck.png'
  },
  {
    name: 'Perplexity AI',
    icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  {
    name: 'HuggingChat',
    icon: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg'
  },
  {
    name: 'Ollama',
    icon: 'https://avatars.githubusercontent.com/u/151674099?s=200&v=4'
  },
  {
    name: 'You.com',
    icon: 'https://about.you.com/wp-content/uploads/2023/01/ydc-logo.svg'
  },
  {
    name: 'ChatGPT',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/240px-ChatGPT_logo.svg.png'
  },
  {
    name: 'Gemini',
    icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'
  }
];

async function updateIcons() {
  console.log('🎨 Mise à jour des icônes des apps IA...\n');
  
  for (const update of iconUpdates) {
    try {
      console.log(`🔄 ${update.name}...`);
      
      const result = await sql`
        UPDATE applications
        SET icon = ${update.icon}
        WHERE name = ${update.name}
        RETURNING name
      `;
      
      if (result.length > 0) {
        console.log(`   ✅ Icône mise à jour`);
      } else {
        console.log(`   ⚠️  App non trouvée`);
      }
    } catch (error) {
      console.error(`   ❌ Erreur pour ${update.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Mise à jour des icônes terminée !');
}

updateIcons()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
