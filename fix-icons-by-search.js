import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import gplay from 'google-play-scraper';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

// Lire le fichier CSV des apps avec problèmes
const csvFile = 'apps-missing-icons.csv';

async function fixMissingIconsBySearch() {
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
    console.log('⚠️  ATTENTION: Recherche par nom = résultats approximatifs\n');
    console.log('🕐 Traitement estimé: ~' + Math.ceil(appsToFix.length * 1.5 / 60) + ' minutes\n');
    
    const results = {
      success: [],
      failed: [],
      skipped: [],
      uncertain: []
    };
    
    for (let i = 0; i < appsToFix.length; i++) {
      const app = appsToFix[i];
      console.log(`\n[${i + 1}/${appsToFix.length}] 📱 ${app.name}`);
      
      try {
        // Nettoyer le nom pour la recherche
        const searchTerm = app.name
          .replace(/[:\-–—]/g, ' ')  // Remplacer ponctuation par espace
          .replace(/\s+/g, ' ')      // Normaliser espaces
          .trim();
        
        console.log(`   🔍 Recherche: "${searchTerm}"`);
        
        // Rechercher sur le Play Store
        const searchResults = await gplay.search({
          term: searchTerm,
          num: 5,  // Prendre les 5 premiers résultats
          lang: 'fr',
          country: 'fr'
        });
        
        if (!searchResults || searchResults.length === 0) {
          console.log(`   ❌ Aucun résultat trouvé`);
          results.failed.push({ app, reason: 'No search results' });
          continue;
        }
        
        // Prendre le premier résultat
        const firstResult = searchResults[0];
        
        // Vérifier si le nom correspond (similarité)
        const nameSimilarity = calculateSimilarity(
          app.name.toLowerCase(),
          firstResult.title.toLowerCase()
        );
        
        console.log(`   📱 Trouvé: "${firstResult.title}"`);
        console.log(`   🎯 Similarité: ${Math.round(nameSimilarity * 100)}%`);
        console.log(`   🔗 Package: ${firstResult.appId}`);
        
        if (nameSimilarity < 0.5) {
          console.log(`   ⚠️  Similarité trop faible, marqué comme incertain`);
          results.uncertain.push({ 
            app, 
            found: firstResult,
            similarity: nameSimilarity,
            icon: firstResult.icon
          });
          // Ne pas mettre à jour automatiquement
          continue;
        }
        
        if (firstResult.icon) {
          console.log(`   ✅ Icône: ${firstResult.icon.substring(0, 50)}...`);
          
          // Mettre à jour en base de données
          await sql`
            UPDATE applications
            SET icon = ${firstResult.icon},
                play_store_url = ${`https://play.google.com/store/apps/details?id=${firstResult.appId}`},
                updated_at = NOW()
            WHERE id = ${app.id}
          `;
          
          console.log(`   💾 Mise à jour BDD réussie`);
          results.success.push({ 
            app, 
            found: firstResult,
            similarity: nameSimilarity,
            newIcon: firstResult.icon 
          });
        } else {
          console.log(`   ❌ Pas d'icône dans le résultat`);
          results.failed.push({ app, reason: 'No icon in result' });
        }
        
        // Pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        results.failed.push({ app, reason: error.message });
        
        // Si rate limit, attendre plus longtemps
        if (error.message.includes('429') || error.message.includes('rate')) {
          console.log(`   ⏸️  Rate limit - pause de 10 secondes...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }
    
    // Résumé
    console.log('\n\n=== RÉSUMÉ ===\n');
    console.log(`✅ Succès: ${results.success.length}`);
    console.log(`⚠️  Incertains (similarité < 50%): ${results.uncertain.length}`);
    console.log(`❌ Échecs: ${results.failed.length}`);
    console.log(`📊 Total: ${appsToFix.length}\n`);
    
    // Générer un rapport détaillé
    const reportLines = [
      '=== RAPPORT DE MISE À JOUR DES ICÔNES (RECHERCHE PAR NOM) ===\n',
      `Date: ${new Date().toISOString()}\n`,
      `Total traité: ${appsToFix.length}\n\n`,
      `✅ SUCCÈS (${results.success.length}):\n`,
      ...results.success.map(r => 
        `  - ${r.app.name} (${r.app.id})\n` +
        `    Trouvé: ${r.found.title}\n` +
        `    Package: ${r.found.appId}\n` +
        `    Similarité: ${Math.round(r.similarity * 100)}%\n` +
        `    Icône: ${r.newIcon}\n\n`
      ),
      `⚠️  INCERTAINS - À VÉRIFIER MANUELLEMENT (${results.uncertain.length}):\n`,
      ...results.uncertain.map(r => 
        `  - ${r.app.name} (${r.app.id})\n` +
        `    Trouvé: ${r.found.title}\n` +
        `    Package: ${r.found.appId}\n` +
        `    Similarité: ${Math.round(r.similarity * 100)}% (trop faible)\n` +
        `    Icône suggérée: ${r.icon}\n\n`
      ),
      `❌ ÉCHECS (${results.failed.length}):\n`,
      ...results.failed.map(r => `  - ${r.app.name} (${r.app.id})\n    Raison: ${r.reason}\n\n`)
    ];
    
    const reportFile = 'fix-icons-by-search-report.txt';
    fs.writeFileSync(reportFile, reportLines.join(''), 'utf8');
    console.log(`📄 Rapport détaillé: ${reportFile}\n`);
    
    // Générer un CSV pour les incertains à vérifier
    if (results.uncertain.length > 0) {
      const uncertainCsvHeader = 'App ID,App Name,Found App Name,Package ID,Similarity %,Icon URL\n';
      const uncertainCsvRows = results.uncertain.map(r => 
        `"${r.app.id}","${r.app.name}","${r.found.title}","${r.found.appId}","${Math.round(r.similarity * 100)}","${r.icon}"`
      ).join('\n');
      
      const uncertainCsvFile = 'uncertain-matches.csv';
      fs.writeFileSync(uncertainCsvFile, uncertainCsvHeader + uncertainCsvRows, 'utf8');
      console.log(`⚠️  Correspondances incertaines: ${uncertainCsvFile}\n`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Fonction pour calculer la similarité entre deux chaînes (méthode Levenshtein simplifiée)
function calculateSimilarity(str1, str2) {
  // Normaliser
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();
  
  // Si identiques
  if (str1 === str2) return 1.0;
  
  // Si l'un contient l'autre
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;
  
  // Calculer distance de Levenshtein
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1, str2) {
  const costs = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  return costs[str2.length];
}

fixMissingIconsBySearch();
