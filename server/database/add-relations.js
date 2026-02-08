/**
 * Script pour ajouter les relations entre Star Apps et Trusti Apps
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

// Mapping des relations Star App → Trusti App
const relations = [
  // Gmail → Proton Mail
  { starApp: 'GMail', trustiApp: 'Proton Mail' },
  
  // Google Password → Bitwarden
  { starApp: 'Google Password', trustiApp: 'Bitwarden' },
  
  // Google Keep → SimpleNote
  { starApp: 'Google Keep', trustiApp: 'SimpleNote' },
  
  // Google Tasks → Tasks.org
  { starApp: 'Google Tasks', trustiApp: 'Tasks.org' },
  
  // ChatGPT → Lumo AI
  { starApp: 'ChatGPT', trustiApp: 'Lumo AI' },
  
  // Google Photos → Ente Photos
  { starApp: 'Google Photos', trustiApp: 'Ente Photos' },
  
  // Google Drive → KDrive / PCloud
  { starApp: 'Google Drive', trustiApp: 'KDrive' },
  { starApp: 'Google Drive', trustiApp: 'PCloud' },
  
  // Google.com → DuckDuckGo / Startpage
  { starApp: 'Google.com', trustiApp: 'DuckDuckGo' },
  { starApp: 'Google.com', trustiApp: 'Startpage' },
  
  // Apple Pay → Curve Pay
  { starApp: 'Apple Pay', trustiApp: 'Curve Pay' },
  
  // Google Wallet → Curve Pay
  { starApp: 'Google Wallet', trustiApp: 'Curve Pay' },
  
  // Apple Music → Deezer
  { starApp: 'Apple Music', trustiApp: 'Deezer' },
  
  // YouTube Music → Deezer
  { starApp: 'Youtube Music', trustiApp: 'Deezer' },
  
  // YouTube → Libretube
  { starApp: 'Youtube', trustiApp: 'Libretube' },
  
  // WhatsApp → Signal
  { starApp: 'Whatsapp', trustiApp: 'Signal' },
  
  // Google Maps → Roole Maps / Infomaniak
  { starApp: 'Google Maps', trustiApp: 'Roole Maps' },
  { starApp: 'Google Maps', trustiApp: 'Infomaniak' }
];

async function addRelations() {
  console.log('\n═══════════════════════════════════════');
  console.log('🔗 AJOUT DES RELATIONS');
  console.log('═══════════════════════════════════════\n');
  
  let added = 0;
  let errors = 0;
  
  for (const rel of relations) {
    try {
      // Trouver l'ID de la Star App
      const starApps = await sql`
        SELECT id FROM applications WHERE name = ${rel.starApp}
      `;
      
      if (starApps.length === 0) {
        console.log(`⚠️  Star App non trouvée: ${rel.starApp}`);
        errors++;
        continue;
      }
      
      // Trouver l'ID de la Trusti App
      const trustiApps = await sql`
        SELECT id FROM applications WHERE name = ${rel.trustiApp}
      `;
      
      if (trustiApps.length === 0) {
        console.log(`⚠️  Trusti App non trouvée: ${rel.trustiApp}`);
        errors++;
        continue;
      }
      
      const starId = starApps[0].id;
      const trustiId = trustiApps[0].id;
      
      // Ajouter la relation "alternative"
      await sql`
        INSERT INTO app_relations (app_id, related_app_id, relation_type)
        VALUES (${starId}, ${trustiId}, 'alternative')
        ON CONFLICT (app_id, related_app_id, relation_type) DO NOTHING
      `;
      
      // Ajouter la relation inverse "replaces"
      await sql`
        INSERT INTO app_relations (app_id, related_app_id, relation_type)
        VALUES (${trustiId}, ${starId}, 'replaces')
        ON CONFLICT (app_id, related_app_id, relation_type) DO NOTHING
      `;
      
      console.log(`✅ ${rel.starApp} → ${rel.trustiApp}`);
      added++;
      
    } catch (error) {
      console.error(`❌ Erreur: ${rel.starApp} → ${rel.trustiApp}`, error.message);
      errors++;
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════');
  console.log(`Relations ajoutées: ${added}`);
  console.log(`Erreurs: ${errors}`);
  console.log('═══════════════════════════════════════\n');
  
  // Afficher le total de relations
  const total = await sql`SELECT COUNT(*) as count FROM app_relations`;
  console.log(`🔗 Total de relations en base: ${total[0].count}\n`);
}

addRelations().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
