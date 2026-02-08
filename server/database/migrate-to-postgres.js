/**
 * Script de migration des données JSON vers PostgreSQL (Neon)
 * 
 * Ce script lit les données depuis la BDD JSON et les importe dans Postgres
 * Utiliser ce script AVANT le premier déploiement sur Vercel
 * 
 * Utilisation:
 * 1. Créer une base de données Postgres sur Neon (https://neon.tech)
 * 2. Ajouter DATABASE_URL dans .env
 * 3. Exécuter: node server/database/migrate-to-postgres.js
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
  console.error('   Please create a .env file with:');
  console.error('   DATABASE_URL=postgresql://...');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Chemin vers la base de données JSON
const JSON_DB_PATH = path.join(__dirname, 'data', 'apps.json');

/**
 * Créer les tables
 */
async function createTables() {
  console.log('📋 Création des tables...');
  
  try {
    // Table des applications
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trusti_score TEXT NOT NULL,
        grade TEXT NOT NULL,
        category TEXT DEFAULT 'Application',
        icon TEXT,
        color TEXT DEFAULT 'bg-slate-600',
        reason TEXT DEFAULT '',
        play_store_url TEXT,
        apple_store_url TEXT,
        github_url TEXT,
        other_store_url TEXT,
        website TEXT,
        description TEXT,
        developer TEXT,
        license TEXT,
        is_open_source BOOLEAN DEFAULT FALSE,
        is_european BOOLEAN DEFAULT FALSE,
        jurisdiction TEXT,
        app_type TEXT DEFAULT 'regular',
        privacy_features JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Table des relations
    await sql`
      CREATE TABLE IF NOT EXISTS app_relations (
        id SERIAL PRIMARY KEY,
        app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        related_app_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        UNIQUE(app_id, related_app_id, relation_type)
      )
    `;

    // Index
    await sql`CREATE INDEX IF NOT EXISTS idx_app_type ON applications(app_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trusti_score ON applications(trusti_score)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_app_relations_app_id ON app_relations(app_id)`;

    console.log('✅ Tables créées avec succès\n');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
}

/**
 * Importer les applications depuis JSON
 */
async function importApplications() {
  console.log('📦 Importation des applications...');
  
  try {
    // Lire la base JSON
    if (!fs.existsSync(JSON_DB_PATH)) {
      console.error(`❌ Fichier JSON non trouvé: ${JSON_DB_PATH}`);
      return { imported: 0, skipped: 0 };
    }

    const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    const apps = jsonData.applications || [];
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const app of apps) {
      try {
        // Vérifier si l'app existe déjà
        const existing = await sql`SELECT id FROM applications WHERE id = ${app.id}`;
        
        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insérer l'application
        await sql`
          INSERT INTO applications (
            id, name, trusti_score, grade, category, icon, color, reason,
            play_store_url, apple_store_url, github_url, other_store_url,
            website, description, developer, license,
            is_open_source, is_european, jurisdiction, app_type, privacy_features,
            created_at, updated_at
          )
          VALUES (
            ${app.id},
            ${app.name},
            ${app.trustiScore},
            ${app.grade},
            ${app.category},
            ${app.icon},
            ${app.color},
            ${app.reason},
            ${app.playStoreUrl},
            ${app.appleStoreUrl},
            ${app.githubUrl},
            ${app.otherStoreUrl},
            ${app.website},
            ${app.description},
            ${app.developer},
            ${app.license},
            ${app.isOpenSource},
            ${app.isEuropean},
            ${app.jurisdiction},
            ${app.appType},
            ${JSON.stringify(app.privacyFeatures || {})},
            ${app.createdAt},
            ${app.updatedAt}
          )
        `;

        imported++;
        
        // Log progress
        if (imported % 10 === 0) {
          console.log(`   Importé: ${imported}/${apps.length}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de ${app.name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Applications importées: ${imported}`);
    console.log(`   Ignorées (déjà présentes): ${skipped}`);
    if (errors > 0) {
      console.log(`   ⚠️  Erreurs: ${errors}`);
    }
    console.log('');

    return { imported, skipped, errors };
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
    throw error;
  }
}

/**
 * Importer les relations entre applications
 */
async function importRelations() {
  console.log('🔗 Importation des relations...');
  
  try {
    // Lire la base JSON
    const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    const relations = jsonData.relations || [];
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const rel of relations) {
      try {
        // Vérifier si la relation existe déjà
        const existing = await sql`
          SELECT id FROM app_relations 
          WHERE app_id = ${rel.appId} 
          AND related_app_id = ${rel.relatedAppId}
          AND relation_type = ${rel.relationType}
        `;
        
        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insérer la relation
        await sql`
          INSERT INTO app_relations (app_id, related_app_id, relation_type)
          VALUES (${rel.appId}, ${rel.relatedAppId}, ${rel.relationType})
        `;

        imported++;
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de la relation:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Relations importées: ${imported}`);
    console.log(`   Ignorées (déjà présentes): ${skipped}`);
    if (errors > 0) {
      console.log(`   ⚠️  Erreurs: ${errors}`);
    }
    console.log('');

    return { imported, skipped, errors };
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation des relations:', error);
    throw error;
  }
}

/**
 * Afficher les statistiques
 */
async function showStats() {
  console.log('📊 Statistiques de la base de données:\n');
  
  try {
    // Total apps
    const total = await sql`SELECT COUNT(*) as count FROM applications`;
    console.log(`   Total applications: ${total[0].count}`);

    // Par type
    const byType = await sql`
      SELECT app_type, COUNT(*) as count
      FROM applications
      GROUP BY app_type
    `;
    console.log('\n   Par type:');
    byType.forEach(row => {
      console.log(`      ${row.app_type}: ${row.count}`);
    });

    // Par score
    const byScore = await sql`
      SELECT trusti_score, COUNT(*) as count
      FROM applications
      GROUP BY trusti_score
      ORDER BY trusti_score
    `;
    console.log('\n   Par score:');
    byScore.forEach(row => {
      console.log(`      ${row.trusti_score}: ${row.count}`);
    });

    // Relations
    const relCount = await sql`SELECT COUNT(*) as count FROM app_relations`;
    console.log(`\n   Relations: ${relCount[0].count}`);
    
    console.log('');
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    throw error;
  }
}

/**
 * Fonction principale de migration
 */
async function migrate() {
  console.log('\n═══════════════════════════════════════');
  console.log('🚀 MIGRATION VERS POSTGRESQL (NEON)');
  console.log('═══════════════════════════════════════\n');
  console.log(`📂 Source: ${JSON_DB_PATH}`);
  console.log(`🗄️  Destination: ${process.env.DATABASE_URL.split('@')[1]}\n`);

  try {
    // 1. Créer les tables
    await createTables();

    // 2. Importer les applications
    const appResult = await importApplications();

    // 3. Importer les relations
    const relResult = await importRelations();

    // 4. Afficher les statistiques
    await showStats();

    console.log('═══════════════════════════════════════');
    console.log('✅ MIGRATION TERMINÉE AVEC SUCCÈS');
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 Vous pouvez maintenant déployer sur Vercel!');
    console.log('📝 N\'oubliez pas d\'ajouter DATABASE_URL dans Vercel:\n');
    console.log('   1. Aller dans Vercel Dashboard > Project > Settings > Environment Variables');
    console.log('   2. Ajouter DATABASE_URL avec la même valeur que votre .env\n');

  } catch (error) {
    console.error('\n❌ MIGRATION ÉCHOUÉE:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrate();
