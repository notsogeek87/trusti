import * as dotenv from 'dotenv';
dotenv.config();

import dbService from './server/database/service-postgres.js';

async function checkBrokenIcons() {
  try {
    console.log('🔍 Connexion à la base de données Neon...\n');
    
    // Récupérer toutes les apps
    const allApps = await dbService.getAllApps();
    
    console.log(`📊 ${allApps.length} applications trouvées\n`);
    console.log('🔍 Vérification des icônes...\n');
    
    const appsWithIssues = [];
    
    for (const app of allApps) {
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
          } else {
            issues.push(`Erreur réseau: ${error.message}`);
          }
        }
      }
      
      if (issues.length > 0) {
        appsWithIssues.push({ app, issues });
      }
    }
    
    console.log('=== RÉSULTATS ===\n');
    
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
    
    console.log(`\n📊 Résumé: ${appsWithIssues.length}/${allApps.length} apps avec problèmes d'icônes`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkBrokenIcons();
