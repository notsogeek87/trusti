import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import gplay from 'google-play-scraper';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

// Lire le fichier CSV des apps avec problèmes
const csvFile = 'apps-missing-icons.csv';

async function fixMissingIcons() {
  try {
    console.log('🔍 Lecture du fichier CSV...\n');
    
    if (!fs.existsSync(csvFile)) {
      console.error(`❌ Fichier ${csvFile} introuvable. Exécutez d'abord: node check-icons-simple.js`);
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    const lines = csvContent.split('\n').slice(1); // Skip header
    const appsToFix = lines.filter(line => line.trim()).map(line => {
      const parts = line.match(/"([^"]*)"/g).map(p => p.slice(1, -1));
      return {
        id: parts[0],
        name: parts[1],
        grade: parts[2],
        category: parts[3],
        type: parts[4],
        currentIcon: parts[5],
        problem: parts[6]
      };
    });
    
    console.log(`📊 ${appsToFix.length} applications à traiter\n`);
    
    const results = {
      success: [],
      failed: [],
      skipped: []
    };
    
    for (let i = 0; i < appsToFix.length; i++) {
      const app = appsToFix[i];
      console.log(`\n[${i + 1}/${appsToFix.length}] 📱 ${app.name}`);
      
      // Récupérer l'app depuis la DB pour avoir le Play Store URL
      const dbApp = await sql`
        SELECT id, name, play_store_url, icon
        FROM applications
        WHERE id = ${app.id}
      `;
      
      if (!dbApp || dbApp.length === 0) {
        console.log(`   ⚠️  App non trouvée en DB`);
        results.skipped.push({ app, reason: 'Not found in DB' });
        continue;
      }
      
      const appData = dbApp[0];
      
      // Extraire le package name depuis le Play Store URL
      let packageName = null;
      if (appData.play_store_url) {
        const match = appData.play_store_url.match(/[?&]id=([^&]+)/);
        if (match) {
          packageName = match[1];
        }
      }
      
      if (!packageName) {
        console.log(`   ⚠️  Pas de Play Store URL valide - impossible de chercher sur Play Store`);
        console.log(`   URL: ${appData.play_store_url || '(vide)'}`);
        results.skipped.push({ app, reason: 'No valid Play Store URL' });
        continue;
      }
      
      try {
        console.log(`   🔍 Recherche sur Play Store: ${packageName}`);
        
        // Récupérer les détails depuis le Play Store
        const playStoreApp = await gplay.app({ appId: packageName });
        
        if (playStoreApp && playStoreApp.icon) {
          console.log(`   ✅ Icône trouvée: ${playStoreApp.icon.substring(0, 60)}...`);
          
          // Mettre à jour en base de données
          await sql`
            UPDATE applications
            SET icon = ${playStoreApp.icon},
                updated_at = NOW()
            WHERE id = ${app.id}
          `;
          
          console.log(`   💾 Mise à jour en BDD réussie`);
          results.success.push({ app, newIcon: playStoreApp.icon });
        } else {
          console.log(`   ❌ Aucune icône trouvée sur le Play Store`);
          results.failed.push({ app, reason: 'No icon in Play Store response' });
        }
        
        // Pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log(`   ❌ App non trouvée sur Play Store`);
          results.failed.push({ app, reason: 'Not found on Play Store' });
        } else {
          console.log(`   ❌ Erreur: ${error.message}`);
          results.failed.push({ app, reason: error.message });
        }
      }
    }
    
    // Résumé
    console.log('\n\n=== RÉSUMÉ ===\n');
    console.log(`✅ Succès: ${results.success.length}`);
    console.log(`❌ Échecs: ${results.failed.length}`);
    console.log(`⚠️  Ignorés: ${results.skipped.length}`);
    console.log(`📊 Total: ${appsToFix.length}\n`);
    
    // Générer un rapport
    const reportLines = [
      '=== RAPPORT DE MISE À JOUR DES ICÔNES ===\n',
      `Date: ${new Date().toISOString()}\n`,
      `Total traité: ${appsToFix.length}\n\n`,
      `✅ SUCCÈS (${results.success.length}):\n`,
      ...results.success.map(r => `  - ${r.app.name} (${r.app.id})\n    Nouvelle icône: ${r.newIcon}\n`),
      `\n❌ ÉCHECS (${results.failed.length}):\n`,
      ...results.failed.map(r => `  - ${r.app.name} (${r.app.id})\n    Raison: ${r.reason}\n`),
      `\n⚠️  IGNORÉS (${results.skipped.length}):\n`,
      ...results.skipped.map(r => `  - ${r.app.name} (${r.app.id})\n    Raison: ${r.reason}\n`)
    ];
    
    const reportFile = 'fix-icons-report.txt';
    fs.writeFileSync(reportFile, reportLines.join(''), 'utf8');
    console.log(`📄 Rapport généré: ${reportFile}\n`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixMissingIcons();
