/**
 * Script pour importer les apps IA depuis le JSON vers PostgreSQL Neon
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à Neon
const sql = neon(process.env.DATABASE_URL);

// Lire le fichier JSON des apps personnalisées
const customAppsPath = path.join(__dirname, '../data/custom-trusti-apps.json');
const customApps = JSON.parse(fs.readFileSync(customAppsPath, 'utf8'));

// Filtrer uniquement les apps IA
const iaApps = customApps.filter(app => app.category === 'IA');

console.log(`📦 Trouvé ${iaApps.length} apps IA à importer`);

async function importIAApps() {
  try {
    for (const app of iaApps) {
      console.log(`\n🔄 Importation de ${app.name}...`);
      
      // Vérifier si l'app existe déjà
      const existing = await sql`
        SELECT id FROM applications 
        WHERE name = ${app.name}
      `;
      
      if (existing.length > 0) {
        console.log(`   ⚠️  ${app.name} existe déjà, mise à jour...`);
        
        // Mise à jour
        await sql`
          UPDATE applications
          SET 
            icon = ${app.icon},
            grade = ${app.grade},
            trusti_score = ${app.grade},
            category = ${app.category},
            color = ${app.color},
            reason = ${app.reason},
            play_store_url = ${app.playStoreUrl || ''},
            apple_store_url = ${app.appleStoreUrl || ''},
            website = ${app.websiteUrl || ''},
            app_type = 'trusti',
            updated_at = NOW()
          WHERE name = ${app.name}
        `;
        
        // Gérer les relations (apps qu'elle remplace)
        if (app.replacesAppIds && app.replacesAppIds.length > 0) {
          // Supprimer les anciennes relations
          await sql`
            DELETE FROM app_relations 
            WHERE app_id = ${existing[0].id} AND relation_type = 'replaces'
          `;
          
          // Ajouter les nouvelles relations
          for (const replacedId of app.replacesAppIds) {
            await sql`
              INSERT INTO app_relations (app_id, related_app_id, relation_type)
              VALUES (${existing[0].id}, ${replacedId}, 'replaces')
              ON CONFLICT DO NOTHING
            `;
          }
        }
        
        console.log(`   ✅ ${app.name} mis à jour`);
      } else {
        console.log(`   ➕ Nouvelle app ${app.name}, insertion...`);
        
        // Insertion
        await sql`
          INSERT INTO applications (
            id, name, icon, grade, trusti_score, category, color, reason,
            play_store_url, apple_store_url, website, app_type
          ) VALUES (
            ${String(app.id)},
            ${app.name},
            ${app.icon},
            ${app.grade},
            ${app.grade},
            ${app.category},
            ${app.color},
            ${app.reason},
            ${app.playStoreUrl || ''},
            ${app.appleStoreUrl || ''},
            ${app.websiteUrl || ''},
            'trusti'
          )
        `;
        
        // Ajouter les relations (apps qu'elle remplace)
        if (app.replacesAppIds && app.replacesAppIds.length > 0) {
          for (const replacedId of app.replacesAppIds) {
            await sql`
              INSERT INTO app_relations (app_id, related_app_id, relation_type)
              VALUES (${String(app.id)}, ${replacedId}, 'replaces')
              ON CONFLICT DO NOTHING
            `;
          }
        }
        
        console.log(`   ✅ ${app.name} ajouté`);
      }
    }
    
    console.log(`\n\n🎉 Import terminé avec succès !`);
    console.log(`📊 ${iaApps.length} apps IA importées/mises à jour`);
    
    // Afficher un récapitulatif
    console.log('\n📋 Apps IA dans la base de données :');
    const allIAApps = await sql`
      SELECT name, grade, category FROM applications 
      WHERE category = 'IA'
      ORDER BY name
    `;
    
    allIAApps.forEach(app => {
      console.log(`   - ${app.name} (Grade: ${app.grade})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

// Exécution
console.log('🚀 Démarrage de l\'import des apps IA vers PostgreSQL/Neon...\n');
importIAApps()
  .then(() => {
    console.log('\n✨ Toutes les opérations sont terminées !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
