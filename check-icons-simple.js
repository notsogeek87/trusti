import * as dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function checkBrokenIcons() {
  try {
    console.log('🔍 Connexion à la base de données Neon...\n');
    
    // Récupérer seulement les données de base (pas de relations pour éviter les timeouts)
    const apps = await sql`
      SELECT id, name, icon, grade, category, app_type as "appType"
      FROM applications
      ORDER BY name
    `;
    
    console.log(`📊 ${apps.length} applications trouvées\n`);
    console.log('🔍 Vérification des icônes...\n');
    
    const appsWithIssues = [];
    let checked = 0;
    
    for (const app of apps) {
      checked++;
      if (checked % 50 === 0) {
        console.log(`   ... ${checked}/${apps.length} vérifiées`);
      }
      
      const issues = [];
      
      // Vérifier si l'icône existe
      if (!app.icon) {
        issues.push('Icône manquante (vide)');
      } else if (app.icon.trim() === '') {
        issues.push('Icône vide (string vide)');
      } else if (!app.icon.startsWith('http')) {
        issues.push(`Icône invalide (ne commence pas par http): "${app.icon}"`);
      } else {
        // Vérifier si l'URL est accessible
        try {
          const response = await fetch(app.icon, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          if (!response.ok) {
            issues.push(`URL retourne ${response.status} ${response.statusText}`);
          } else {
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.startsWith('image/')) {
              issues.push(`Content-Type invalide: ${contentType} (devrait être image/*)`);
            }
          }
        } catch (error) {
          if (error.name === 'TimeoutError') {
            issues.push('Timeout (URL ne répond pas en 5s)');
          } else if (error.code === 'ENOTFOUND') {
            issues.push('DNS: Domaine introuvable');
          } else if (error.code === 'ECONNREFUSED') {
            issues.push('Connexion refusée');
          } else if (error.message.includes('certificate')) {
            issues.push(`Erreur SSL: ${error.message}`);
          } else {
            issues.push(`Erreur réseau: ${error.message}`);
          }
        }
      }
      
      if (issues.length > 0) {
        appsWithIssues.push({ app, issues });
      }
    }
    
    console.log('\n=== RÉSULTATS ===\n');
    
    if (appsWithIssues.length === 0) {
      console.log('✅ Toutes les icônes sont valides et accessibles!\n');
    } else {
      console.log(`❌ ${appsWithIssues.length} applications avec des problèmes d'icônes:\n`);
      
      appsWithIssues.forEach(({ app, issues }) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📱 ${app.name} (ID: ${app.id})`);
        console.log(`   Grade: ${app.grade} | Catégorie: ${app.category}`);
        console.log(`   Type: ${app.appType}`);
        console.log(`   URL icône: ${app.icon || '(vide)'}`);
        console.log(`   ⚠️  Problèmes:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
        console.log('');
      });
    }
    
    console.log(`\n📊 Résumé: ${appsWithIssues.length}/${apps.length} apps avec problèmes d'icônes`);
    
    // Générer un fichier CSV
    if (appsWithIssues.length > 0) {
      const csvHeader = 'ID,Name,Grade,Category,Type,Icon URL,Problem\n';
      const csvRows = appsWithIssues.map(({ app, issues }) => {
        const icon = (app.icon || '').replace(/"/g, '""');
        const problems = issues.join(' | ').replace(/"/g, '""');
        return `"${app.id}","${app.name}","${app.grade}","${app.category}","${app.appType}","${icon}","${problems}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const csvFilename = 'apps-missing-icons.csv';
      fs.writeFileSync(csvFilename, csvContent, 'utf8');
      console.log(`\n💾 Fichier CSV généré: ${csvFilename}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkBrokenIcons();
