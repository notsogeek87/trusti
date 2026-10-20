#!/usr/bin/env node

/**
 * Script de vérification pour Vibe Code
 * Vérifie les points critiques avant de commiter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

// Couleurs pour l'affichage
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

let hasErrors = false;
let hasWarnings = false;

function logError(message) {
  console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
  hasErrors = true;
}

function logWarning(message) {
  console.log(`  ${colors.yellow}⚠️  ${message}${colors.reset}`);
  hasWarnings = true;
}

function logSuccess(message) {
  console.log(`  ${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`  ${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bold + colors.blue + title + colors.reset);
  console.log('-'.repeat(70));
}

console.log('\n' + '='.repeat(70));
console.log('🔍 VIBE CODE - VÉRIFICATION PRÉ-COMMIT');
console.log('='.repeat(70) + '\n');

// Vérification 1 : Fichiers interdits à modifier
logSection('🚫 Vérification des fichiers interdits');

const forbiddenFiles = [
  { path: 'android/app/debug.keystore', reason: 'Clé de signature debug' },
  { path: 'capacitor.config.json', reason: 'Configuration Capacitor' },
  { path: '.github/workflows/', reason: 'CI/CD GitHub Actions', isDir: true }
];

forbiddenFiles.forEach(file => {
  const filePath = path.join(repoRoot, file.path);
  if (file.isDir) {
    if (fs.existsSync(filePath)) {
      logInfo(`Dossier ${file.path} existe - ne pas modifier sans validation`);
    }
  } else {
    if (fs.existsSync(filePath)) {
      logInfo(`Fichier ${file.path} existe - ne pas modifier sans validation`);
    }
  }
});

// Vérification 2 : API_URL dupliquée
logSection('🔗 Vérification des URLs API');

const apiConfigPath = path.join(repoRoot, 'src', 'utils', 'apiConfig.js');

if (fs.existsSync(apiConfigPath)) {
  logSuccess(`apiConfig.js existe - bien !`);
  
  const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
  if (apiConfigContent.includes('API_URL') || apiConfigContent.includes('apiConfig')) {
    logSuccess(`apiConfig.js contient bien la configuration API`);
  } else {
    logWarning(`apiConfig.js ne semble pas contenir la configuration API attendue`);
  }
} else {
  logError(`apiConfig.js n'existe pas !`);
}

// Vérifier les duplications d'URL API dans le code
const searchApiUrl = (dir, pattern) => {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return { foundInApiConfig: false, foundElsewhere: 0 };
  }
  
  let foundInApiConfig = false;
  let foundElsewhere = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      return;
    }
    
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git') return;
      const result = searchApiUrl(filePath, pattern);
      foundInApiConfig = foundInApiConfig || result.foundInApiConfig;
      foundElsewhere += result.foundElsewhere;
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        return;
      }
      const matches = content.match(pattern);
      
      if (matches) {
        if (filePath.includes('apiConfig.js')) {
          foundInApiConfig = true;
        } else {
          foundElsewhere++;
          logWarning(`URL API hardcodée trouvée dans : ${filePath.replace(repoRoot + '/', '')}`);
        }
      }
    }
  });
  
  return { foundInApiConfig, foundElsewhere };
};

try {
  const srcDir = path.join(repoRoot, 'src');
  if (fs.existsSync(srcDir)) {
    const result = searchApiUrl(srcDir, /http:\/\/localhost:3001\/api|https:\/\/.*\/api/g);
    if (result.foundElsewhere > 0) {
      logError(`URL API hardcodée trouvée dans ${result.foundElsewhere} fichier(s) en dehors d'apiConfig.js`);
    } else if (result.foundInApiConfig) {
      logSuccess(`Pas de duplication d'URL API détectée`);
    } else {
      logInfo(`Aucune URL API trouvée dans src/`);
    }
  }
} catch (e) {
  logInfo(`Impossible de scanner src/ pour les URLs API : ${e.message}`);
}

// Vérification 3 : Taille des fichiers critiques
logSection('⚖️  Vérification de la taille des fichiers critiques');

const criticalFiles = [
  { path: 'src/App.jsx', maxLines: 500 },
  { path: 'server/index.js', maxLines: 500 }
];

criticalFiles.forEach(file => {
  const filePath = path.join(repoRoot, file.path);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const actualLines = content.split('\n').length;
    
    if (actualLines > file.maxLines) {
      logError(`${file.path} : ${actualLines} lignes (max recommandé: ${file.maxLines}) - À DÉCOUPER !`);
    } else {
      logSuccess(`${file.path} : ${actualLines} lignes (OK)`);
    }
  } else {
    logWarning(`${file.path} : fichier introuvable`);
  }
});

// Vérification 4 : Conventions de nommage
logSection('📝 Vérification des conventions de nommage');

const componentsDir = path.join(repoRoot, 'src', 'components');
if (fs.existsSync(componentsDir)) {
  let files;
  try {
    files = fs.readdirSync(componentsDir);
  } catch (e) {
    files = [];
  }
  // PascalCase: commence par majuscule, peut contenir des majuscules/minuscules et chiffres
  const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*(\.jsx|\.js)?$/;
  
  let nonPascalCase = 0;
  files.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (!pascalCasePattern.test(file.replace('.jsx', '').replace('.js', ''))) {
        nonPascalCase++;
        logWarning(`Composant non en PascalCase : ${file}`);
      }
    }
  });
  
  if (nonPascalCase === 0 && files.length > 0) {
    logSuccess(`Tous les composants sont en PascalCase`);
  } else if (files.length === 0) {
    logInfo(`Aucun composant trouvé dans src/components/`);
  }
}

// Vérifier les hooks
const hooksDir = path.join(repoRoot, 'src', 'hooks');
if (fs.existsSync(hooksDir)) {
  let files;
  try {
    files = fs.readdirSync(hooksDir);
  } catch (e) {
    files = [];
  }
  const usePattern = /^use[A-Z][a-zA-Z0-9]*\.js$/;
  
  let nonUseHooks = 0;
  files.forEach(file => {
    if (file.endsWith('.js')) {
      if (!usePattern.test(file)) {
        nonUseHooks++;
        logWarning(`Hook non conforme : ${file} (devrait commencer par use)`);
      }
    }
  });
  
  if (nonUseHooks === 0 && files.length > 0) {
    logSuccess(`Tous les hooks commencent par use`);
  } else if (files.length === 0) {
    logInfo(`Aucun hook trouvé dans src/hooks/`);
  }
}

// Vérification 5 : Tests
logSection('🧪 Vérification des tests');

logInfo(`Commande de test : npm test`);
logInfo(`Les tests vérifient : tests/technical, tests/cleaner, tests/server`);

// Vérification 6 : Build
logSection('🏗️  Vérification du build');

logInfo(`Commande de build : npm run build`);
logInfo(`Commande Android sync : npm run cap:sync`);

// Vérification 7 : Git
logSection('🌿 Vérification Git');

try {
  const currentBranch = execSync('git branch --show-current', { cwd: repoRoot, encoding: 'utf8' }).trim();
  
  if (currentBranch === 'main') {
    logError(`Tu es sur la branche main ! Ne pas commiter directement sur main.`);
  } else {
    logSuccess(`Branche actuelle : ${currentBranch} (OK)`);
  }
} catch (e) {
  logWarning(`Impossible de déterminer la branche actuelle : ${e.message}`);
}

// Résumé
logSection('📊 RÉSUMÉ');

if (hasErrors) {
  console.log(`\n  ${colors.red}${colors.bold}❌ DES ERREURS ONT ÉTÉ TROUVÉES${colors.reset}`);
  console.log(`  ${colors.red}Ne pas commiter avant de les corriger !${colors.reset}\n`);
} else if (hasWarnings) {
  console.log(`\n  ${colors.yellow}${colors.bold}⚠️  DES AVERTISSEMENTS ONT ÉTÉ TROUVÉS${colors.reset}`);
  console.log(`  ${colors.yellow}Revoir les points signalés avant de commiter.${colors.reset}\n`);
} else {
  console.log(`\n  ${colors.green}${colors.bold}✅ TOUT VA BIEN !${colors.reset}`);
  console.log(`  ${colors.green}Tu peux commiter en toute sécurité.${colors.reset}\n`);
}

console.log('='.repeat(70) + '\n');

if (hasErrors) {
  process.exit(1);
}
