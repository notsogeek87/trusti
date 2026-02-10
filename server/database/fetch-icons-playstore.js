/**
 * Script automatique pour récupérer les icônes depuis le Play Store
 * Utilise google-play-scraper pour obtenir les vraies icônes officielles
 */

import gplay from 'google-play-scraper';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAR_APPS_FILE = path.join(__dirname, '../data/star-apps.json');
const TRUSTI_APPS_FILE = path.join(__dirname, '../data/custom-trusti-apps.json');

// Lire JSON
const readJSON = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Erreur lecture ${filePath}:`, error);
  }
  return [];
};

// Écrire JSON
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur écriture ${filePath}:`, error);
    return false;
  }
};

// Extraire le package ID d'une URL Play Store
const extractPackageId = (playStoreUrl) => {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-z0-9._]+)/i);
  return match ? match[1] : null;
};

// Vérifier si l'icône est problématique
const isIconProblematic = (icon) => {
  if (!icon) return true;
  if (icon.length < 5) return true; // emoji
  if (icon.includes('external-content.duckduckgo')) return true;
  if (icon.includes('bing.net')) return true;
  if (icon.includes('play-lh.googleusercontent') && icon.includes('XxXxX')) return true; // URL invalide
  return false;
};

// Récupérer l'icône depuis le Play Store
const fetchIconFromPlayStore = async (packageId) => {
  try {
    console.log(`  🔍 Recherche: ${packageId}`);
    const appInfo = await gplay.app({ appId: packageId });
    if (appInfo && appInfo.icon) {
      console.log(`  ✅ Icône trouvée!`);
      return appInfo.icon;
    }
  } catch (error) {
    console.log(`  ⚠️  Pas trouvé sur Play Store`);
  }
  return null;
};

// Traiter un fichier
const processFile = async (filePath, fileName) => {
  console.log(`\n📱 Traitement: ${fileName}`);
  console.log('─'.repeat(50));
  
  const apps = readJSON(filePath);
  let fixedCount = 0;
  let skippedCount = 0;
  
  const updatedApps = [];
  
  for (const app of apps) {
    const needsFix = isIconProblematic(app.icon);
    
    if (needsFix) {
      console.log(`\n🔧 ${app.name}:`);
      const packageId = extractPackageId(app.playStoreUrl);
      
      if (packageId) {
        const newIcon = await fetchIconFromPlayStore(packageId);
        if (newIcon) {
          updatedApps.push({ ...app, icon: newIcon });
          fixedCount++;
          // Petite pause pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`  ⏭️  Garde l'icône actuelle: ${app.icon}`);
          updatedApps.push(app);
          skippedCount++;
        }
      } else {
        console.log(`  ⏭️  Pas de playStoreUrl - garde l'icône actuelle`);
        updatedApps.push(app);
        skippedCount++;
      }
    } else {
      updatedApps.push(app);
    }
  }
  
  if (fixedCount > 0) {
    writeJSON(filePath, updatedApps);
    console.log(`\n✅ ${fixedCount} icône(s) mise(s) à jour`);
  }
  if (skippedCount > 0) {
    console.log(`ℹ️  ${skippedCount} app(s) ignorée(s)`);
  }
  
  return fixedCount;
};

// Main
console.log('🚀 Récupération automatique des icônes depuis Play Store\n');

let totalFixed = 0;

// Traiter Star Apps
totalFixed += await processFile(STAR_APPS_FILE, 'star-apps.json');

// Traiter Trusti Apps
totalFixed += await processFile(TRUSTI_APPS_FILE, 'custom-trusti-apps.json');

console.log('\n' + '═'.repeat(50));
console.log(`🎉 Total: ${totalFixed} icône(s) récupérée(s) depuis Play Store`);
console.log('═'.repeat(50));
