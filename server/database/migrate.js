/**
 * Script de migration des données JSON vers la base de données
 */
import { getDatabase, closeDatabase } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers JSON
const CUSTOM_APPS_PATH = path.join(__dirname, '../data/custom-trusti-apps.json');
const STAR_APPS_PATH = path.join(__dirname, '../data/star-apps.json');

console.log('🔄 Migration des données JSON vers la base de données\n');

try {
  const db = getDatabase();
  
  // Préparer les statements
  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, name, trustiScore, grade, category, icon, color, reason,
      playStoreUrl, appleStoreUrl, githubUrl, otherStoreUrl, website,
      description, developer, license, isOpenSource, isEuropean, jurisdiction,
      appType, privacyFeatures
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);
  
  const insertRelation = db.prepare(`
    INSERT OR IGNORE INTO app_relations (appId, relatedAppId, relationType)
    VALUES (?, ?, ?)
  `);
  
  let totalApps = 0;
  let totalRelations = 0;
  
  // Fonction pour migrer un fichier JSON
  const migrateFile = (filePath, appType) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Fichier non trouvé : ${filePath}`);
      return { apps: 0, relations: 0 };
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let appsCount = 0;
    let relationsCount = 0;
    
    // Transaction pour de meilleures performances
    const migrate = db.transaction((apps) => {
      for (const app of apps) {
        // Normaliser les données
        const id = String(app.id);
        const trustiScore = app.trustiScore || app.grade || 'C';
        const grade = app.grade || app.trustiScore || 'C';
        
        // Insérer l'application
        insertApp.run(
          id,
          app.name,
          trustiScore,
          grade,
          app.category || 'Application',
          app.icon || null,
          app.color || 'bg-slate-600',
          app.reason || 'Aucune raison fournie',
          app.playStoreUrl || null,
          app.appleStoreUrl || null,
          app.githubUrl || null,
          app.otherStoreUrl || null,
          app.website || null,
          app.description || null,
          app.developer || null,
          app.license || null,
          app.isOpenSource ? 1 : 0,
          app.isEuropean ? 1 : 0,
          app.jurisdiction || null,
          appType,
          app.privacyFeatures ? JSON.stringify(app.privacyFeatures) : null
        );
        appsCount++;
        
        // Insérer les relations (alternatives)
        if (app.alternativeAppIds && Array.isArray(app.alternativeAppIds)) {
          for (const altId of app.alternativeAppIds) {
            insertRelation.run(id, String(altId), 'alternative');
            relationsCount++;
          }
        }
        
        // Insérer les relations (remplacements)
        if (app.replacesAppIds && Array.isArray(app.replacesAppIds)) {
          for (const replaceId of app.replacesAppIds) {
            insertRelation.run(id, String(replaceId), 'replaces');
            relationsCount++;
          }
        }
      }
    });
    
    migrate(data);
    return { apps: appsCount, relations: relationsCount };
  };
  
  // Migrer les TrustiApps
  console.log('📦 Migration des TrustiApps (custom-trusti-apps.json)...');
  const trustiResult = migrateFile(CUSTOM_APPS_PATH, 'trusti');
  console.log(`   ✓ ${trustiResult.apps} applications`);
  console.log(`   ✓ ${trustiResult.relations} relations`);
  totalApps += trustiResult.apps;
  totalRelations += trustiResult.relations;
  
  // Migrer les StarApps
  console.log('\n⭐ Migration des StarApps (star-apps.json)...');
  const starResult = migrateFile(STAR_APPS_PATH, 'star');
  console.log(`   ✓ ${starResult.apps} applications`);
  console.log(`   ✓ ${starResult.relations} relations`);
  totalApps += starResult.apps;
  totalRelations += starResult.relations;
  
  // Statistiques finales
  console.log('\n📊 Statistiques de la base de données :');
  
  const stats = {
    total: db.prepare('SELECT COUNT(*) as count FROM applications').get().count,
    byType: db.prepare(`
      SELECT appType, COUNT(*) as count 
      FROM applications 
      GROUP BY appType
    `).all(),
    byScore: db.prepare(`
      SELECT trustiScore, COUNT(*) as count 
      FROM applications 
      GROUP BY trustiScore 
      ORDER BY trustiScore
    `).all(),
    relations: db.prepare('SELECT COUNT(*) as count FROM app_relations').get().count
  };
  
  console.log(`   - Total d'applications : ${stats.total}`);
  stats.byType.forEach(row => {
    console.log(`   - ${row.appType} : ${row.count}`);
  });
  console.log(`\n   - Par score :`);
  stats.byScore.forEach(row => {
    console.log(`     ${row.trustiScore} : ${row.count}`);
  });
  console.log(`\n   - Relations : ${stats.relations}`);
  
  closeDatabase(db);
  
  console.log('\n🎉 Migration terminée avec succès !');
  console.log(`✅ ${totalApps} applications migrées`);
  console.log(`✅ ${totalRelations} relations créées\n`);
  
} catch (error) {
  console.error('❌ Erreur lors de la migration :', error.message);
  console.error(error.stack);
  process.exit(1);
}
