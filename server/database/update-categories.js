/**
 * Script pour mettre à jour les catégories des applications
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Mapping des applications et leurs catégories appropriées
const categoriesMapping = {
  // TrustiApps (Alternatives)
  'Signal': 'Messagerie',
  'Lumo AI': 'IA',
  'Proton Mail': 'Email',
  'Pixelfed': 'Réseaux sociaux',
  'Infomaniak': 'Email',
  'Bitwarden': 'Sécurité',
  'SimpleNote': 'Productivité',
  'Tasks.org': 'Productivité',
  'Ente Photos': 'Photo',
  'KDrive': 'Stockage Cloud',
  'PCloud': 'Stockage Cloud',
  'DuckDuckGo': 'Navigation',
  'Startpage': 'Navigation',
  'Curve Pay': 'Finance',
  'OsmAnd': 'Cartographie',
  'Organic Maps': 'Cartographie',
  'Deezer': 'Musique',
  'Libretube': 'Vidéo',
  'Roole Maps': 'Cartographie',
  
  // StarApps (Sélection)
  'GMail': 'Email',
  'Google Password': 'Sécurité',
  'Google Keep': 'Productivité',
  'Google Tasks': 'Productivité',
  'ChatGPT': 'IA',
  'Gemini': 'IA',
  'Google Photos': 'Photo',
  'Google Drive': 'Stockage Cloud',
  'Google.com': 'Navigation',
  'Apple Pay': 'Finance',
  'Google Wallet': 'Finance',
  'Apple Music': 'Musique',
  'Youtube Music': 'Musique',
  'Youtube': 'Vidéo',
  'Whatsapp': 'Messagerie',
  'WhatsApp': 'Messagerie',
  'Google Maps': 'Cartographie',
  'Instagram': 'Réseaux sociaux'
};

async function updateCategories() {
  try {
    console.log('🔄 Mise à jour des catégories des applications...\n');
    
    // Récupérer toutes les apps
    const apps = await sql`SELECT id, name, category FROM applications ORDER BY name`;
    
    console.log(`📊 ${apps.length} applications trouvées\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const app of apps) {
      const newCategory = categoriesMapping[app.name];
      
      if (newCategory && newCategory !== app.category) {
        await sql`
          UPDATE applications 
          SET category = ${newCategory}
          WHERE id = ${app.id}
        `;
        console.log(`✅ ${app.name}: "${app.category}" → "${newCategory}"`);
        updated++;
      } else if (newCategory) {
        console.log(`⏭️  ${app.name}: déjà "${app.category}"`);
        skipped++;
      } else {
        console.log(`⚠️  ${app.name}: aucune catégorie définie (reste "${app.category}")`);
        skipped++;
      }
    }
    
    console.log(`\n✨ Terminé!`);
    console.log(`   ${updated} applications mises à jour`);
    console.log(`   ${skipped} applications inchangées`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateCategories();
