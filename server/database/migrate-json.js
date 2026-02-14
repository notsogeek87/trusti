/**
 * Script de migration des fichiers JSON vers la base de données
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDB, saveDB, backup } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins vers les fichiers JSON actuels
const CUSTOM_APPS_PATH = path.join(__dirname, '../data/custom-trusti-apps.json');
const STAR_APPS_PATH = path.join(__dirname, '../data/star-apps.json');

/**
 * Migrer les applications depuis les JSON
 */
async function migrate() {
  console.log('🔄 Début de la migration des données...\n');
  
  // Backup de la base actuelle
  const backupPath = backup();
  console.log(`✅ Backup créé: ${backupPath}\n`);
  
  const db = loadDB();
  let totalApps = 0;
  let migratedApps = 0;
  let skippedApps = 0;
  
  // Migrer custom-trusti-apps.json
  if (fs.existsSync(CUSTOM_APPS_PATH)) {
    console.log('📦 Importation de custom-trusti-apps.json...');
    const customApps = JSON.parse(fs.readFileSync(CUSTOM_APPS_PATH, 'utf8'));
    
    if (Array.isArray(customApps)) {
      totalApps += customApps.length;
      const result = importApps(db, customApps, 'trusti');
      migratedApps += result.migrated;
      skippedApps += result.skipped;
      console.log(`   ✅ ${result.migrated} apps importées, ${result.skipped} ignorées (déjà présentes)\n`);
    }
  } else {
    console.log('⚠️  custom-trusti-apps.json non trouvé\n');
  }
  
  // Migrer star-apps.json
  if (fs.existsSync(STAR_APPS_PATH)) {
    console.log('📦 Importation de star-apps.json...');
    const starApps = JSON.parse(fs.readFileSync(STAR_APPS_PATH, 'utf8'));
    
    if (Array.isArray(starApps)) {
      totalApps += starApps.length;
      const result = importApps(db, starApps, 'star');
      migratedApps += result.migrated;
      skippedApps += result.skipped;
      console.log(`   ✅ ${result.migrated} apps importées, ${result.skipped} ignorées (déjà présentes)\n`);
    }
  } else {
    console.log('⚠️  star-apps.json non trouvé\n');
  }
  
  // Sauvegarder la base de données
  saveDB(db);
  
  // Afficher le résumé
  console.log('═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ DE LA MIGRATION');
  console.log('═══════════════════════════════════════');
  console.log(`Applications trouvées: ${totalApps}`);
  console.log(`Applications migrées:  ${migratedApps}`);
  console.log(`Applications ignorées: ${skippedApps}`);
  console.log(`Total en base:         ${db.applications.length}`);
  console.log('═══════════════════════════════════════\n');
  console.log('✅ Migration terminée avec succès!');
  console.log(`💾 Base de données: ${db.applications.length} applications`);
  console.log(`📂 Backup disponible: ${backupPath}\n`);
}

/**
 * Importer des applications dans la base
 */
function importApps(db, apps, appType) {
  let migrated = 0;
  let skipped = 0;
  
  apps.forEach(app => {
    // Vérifier si l'app existe déjà (par nom)
    const exists = db.applications.some(existingApp => 
      existingApp.name === app.name
    );
    
    if (exists) {
      skipped++;
      return;
    }
    
    // Normaliser les données
    const id = app.id || String(Date.now() + Math.random());
    const trustiScore = app.trustiScore || app.grade || 'C';
    const grade = app.grade || app.trustiScore || 'C';
    
    const normalizedApp = {
      id,
      name: app.name,
      trustiScore,
      grade,
      category: app.category || 'Application',
      icon: app.icon || null,
      color: app.color || 'bg-slate-600',
      reason: app.reason || '',
      playStoreUrl: app.playStoreUrl || null,
      appleStoreUrl: app.appleStoreUrl || null,
      githubUrl: app.githubUrl || null,
      otherStoreUrl: app.otherStoreUrl || null,
      website: app.website || null,
      description: app.description || null,
      developer: app.developer || null,
      license: app.license || null,
      isOpenSource: app.isOpenSource || false,
      isEuropean: app.isEuropean || false,
      jurisdiction: app.jurisdiction || null,
      appType: appType,
      privacyFeatures: app.privacyFeatures || {},
      alternativeAppIds: [],
      replacesAppIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.applications.push(normalizedApp);
    
    // Ajouter les relations
    if (app.alternativeAppIds && app.alternativeAppIds.length > 0) {
      if (!db.relations) {
        db.relations = [];
      }
      
      app.alternativeAppIds.forEach(relatedId => {
        db.relations.push({
          appId: id,
          relatedAppId: relatedId,
          relationType: 'alternative'
        });
      });
    }
    
    migrated++;
  });
  
  return { migrated, skipped };
}

// Exécuter la migration
migrate().catch(error => {
  console.error('❌ Erreur lors de la migration:', error);
  process.exit(1);
});
