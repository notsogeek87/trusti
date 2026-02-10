/**
 * Script de mise à jour des catégories dans PostgreSQL
 * 
 * Ce script met à jour les catégories des applications existantes dans Postgres
 * en se basant sur les données du fichier apps.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Chemin vers la base de données JSON
const JSON_DB_PATH = path.join(__dirname, 'data', 'apps.json');

/**
 * Mettre à jour les catégories
 */
async function updateCategories() {
  console.log('🔄 Mise à jour des catégories dans PostgreSQL...\n');
  
  try {
    // Lire le fichier JSON
    const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
    const applications = jsonData.applications || [];
    
    console.log(`📚 ${applications.length} applications trouvées dans apps.json\n`);
    
    let updated = 0;
    let unchanged = 0;
    let notFound = 0;
    const changes = [];
    
    // Parcourir toutes les applications
    for (const app of applications) {
      try {
        // Récupérer l'application actuelle dans Postgres
        const existing = await sql`
          SELECT id, category FROM applications WHERE id = ${app.id}
        `;
        
        if (existing.length === 0) {
          notFound++;
          continue;
        }
        
        const oldCategory = existing[0].category;
        const newCategory = app.category;
        
        // Si la catégorie a changé, mettre à jour
        if (oldCategory !== newCategory) {
          await sql`
            UPDATE applications 
            SET category = ${newCategory}, 
                updated_at = NOW()
            WHERE id = ${app.id}
          `;
          
          changes.push({
            name: app.name,
            id: app.id,
            old: oldCategory,
            new: newCategory
          });
          updated++;
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${app.name}:`, error.message);
      }
    }
    
    console.log('✅ Mise à jour terminée !\n');
    console.log('📊 Statistiques:');
    console.log(`   - Catégories mises à jour: ${updated}`);
    console.log(`   - Inchangées: ${unchanged}`);
    console.log(`   - Non trouvées: ${notFound}`);
    console.log(`   - Total: ${applications.length}\n`);
    
    if (changes.length > 0) {
      console.log('📋 Changements effectués:\n');
      changes.forEach((change) => {
        console.log(`   ✓ ${change.name} (${change.id})`);
        console.log(`     ${change.old} → ${change.new}`);
      });
      console.log('');
    }
    
    // Afficher les nouvelles statistiques par catégorie
    const stats = await sql`
      SELECT category, COUNT(*) as count 
      FROM applications 
      GROUP BY category 
      ORDER BY count DESC, category ASC
    `;
    
    console.log('📊 Applications par catégorie:\n');
    stats.forEach((stat) => {
      console.log(`   ${stat.category}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

// Exécution
updateCategories();
