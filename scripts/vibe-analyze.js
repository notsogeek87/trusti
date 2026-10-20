#!/usr/bin/env node

/**
 * Script d'analyse pour Vibe Code
 * Fournit une vue d'ensemble rapide du projet Trusti
 */

import fs from 'fs';
import path from 'path';

console.log('\n' + '='.repeat(70));
console.log('🔍 ANALYSE TRUSTI POUR VIBE CODE');
console.log('='.repeat(70) + '\n');

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

function logSection(title) {
  console.log(colors.bold + colors.blue + '\n📁 ' + title + colors.reset);
  console.log('-'.repeat(70));
}

function logItem(label, value, color = colors.reset) {
  console.log(`  ${colors.bold}${label}${colors.reset}: ${color}${value}${colors.reset}`);
}

function logWarning(message) {
  console.log(`  ${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`  ${colors.green}✅ ${message}${colors.reset}`);
}

// Obtenir le chemin de la racine du repo
const repoRoot = path.join(new URL('.', import.meta.url).pathname, '..', '..');

// Analyse du projet
logSection('INFORMATIONS GÉNÉRALES');
logItem('Nom', 'Trusti');
logItem('Description', 'Comparateur d\'applications privacy-first (notes A-E)');
logItem('Stack', 'React 18 + Vite + Tailwind CSS + Express + PostgreSQL (Neon) + Capacitor 8');
logItem('Déploiement', 'Vercel (web) + GitHub Actions (APK Android)');
logItem('Licence', 'GPL-3.0-or-later');

// Structure importante
logSection('📂 STRUCTURE DU PROJET');

const structure = [
  { path: 'src/App.jsx', lines: '~631', status: 'CRITIQUE - À découper', color: colors.red },
  { path: 'src/main.jsx', lines: '~20', status: 'Point d\'entrée React', color: colors.green },
  { path: 'src/components/', lines: 'N/A', status: 'Composants React (PascalCase)', color: colors.cyan },
  { path: 'src/hooks/', lines: 'N/A', status: 'Hooks personnalisés (use*.js)', color: colors.cyan },
  { path: 'src/constants/', lines: 'N/A', status: 'Constantes (UPPER_SNAKE_CASE)', color: colors.cyan },
  { path: 'src/utils/', lines: 'N/A', status: 'Fonctions utilitaires', color: colors.cyan },
  { path: 'api/*.js', lines: 'N/A', status: 'Routes serverless Vercel (PROD)', color: colors.green },
  { path: 'server/index.js', lines: '~740', status: 'CRITIQUE - À découper', color: colors.red },
  { path: 'android/', lines: 'N/A', status: 'Projet Capacitor (Android)', color: colors.cyan },
  { path: 'docs/', lines: 'N/A', status: 'Documentation complète', color: colors.cyan }
];

structure.forEach(item => {
  logItem(item.path, `${item.lines} lignes - ${item.status}`, item.color);
});

// Fichiers critiques
logSection('⚠️  FICHIERS CRITIQUES À CONNAÎTRE');

const criticalFiles = [
  {
    path: 'src/App.jsx',
    lines: '631',
    description: 'Composant root - état global, routing tabs',
    action: 'À DÉCOUPER en hooks/composants',
    risk: 'Trop complexe'
  },
  {
    path: 'server/index.js',
    lines: '740',
    description: 'Backend Express - toutes les routes dev',
    action: 'À DÉCOUPER en modules',
    risk: 'Trop complexe'
  },
  {
    path: 'src/utils/apiConfig.js',
    lines: '~20',
    description: 'Configuration centrale de l\'URL API',
    action: 'TOUJOURS utiliser ce fichier',
    risk: 'Duplication = maintenance difficile'
  },
  {
    path: 'src/constants/appsData.js',
    lines: 'N/A',
    description: 'Base de données des applications',
    action: 'À migrer vers PostgreSQL',
    risk: 'Données en dur'
  }
];

criticalFiles.forEach(file => {
  console.log(`\n  ${colors.bold}${file.path}${colors.reset} (${file.lines} lignes)`);
  console.log(`    Description: ${file.description}`);
  console.log(`    ${colors.yellow}Action: ${file.action}${colors.reset}`);
  console.log(`    ${colors.red}Risque: ${file.risk}${colors.reset}`);
});

// Commandes utiles
logSection('🚀 COMMANDES UTILES');

const commands = [
  { cmd: 'npm run dev', desc: 'Lance le frontend (Vite, port 5173)' },
  { cmd: 'npm run server', desc: 'Lance le backend (Express, port 3001)' },
  { cmd: 'npm run dev:all', desc: '⭐ Frontend + backend simultanément' },
  { cmd: 'npm run build', desc: 'Build Vite pour la production' },
  { cmd: 'npm run preview', desc: 'Prévisualisation du build' },
  { cmd: 'npm run cap:sync', desc: '⭐ Build Vite + cap sync android (OBLIGATOIRE)' },
  { cmd: 'npm run android:open', desc: 'Ouvre Android Studio' },
  { cmd: 'npm test', desc: 'Exécute les tests unitaires' },
  { cmd: 'npm run vibe:analyze', desc: 'Analyse du projet (ce script)' },
  { cmd: 'npm run vibe:check', desc: 'Vérification pré-commit' }
];

commands.forEach(cmd => {
  logItem(cmd.cmd, cmd.desc);
});

// Pièges à éviter
logSection('🚨 PIÈGES À ÉVITER');

const pitfalls = [
  {
    title: 'Ne JAMAIS dupliquer API_URL',
    description: 'TOUJOURS utiliser src/utils/apiConfig.js',
    severity: 'CRITIQUE'
  },
  {
    title: 'Ne pas casser le build Capacitor',
    description: 'android/ dépend de dist/ généré par Vite',
    severity: 'CRITIQUE'
  },
  {
    title: 'App.jsx et server/index.js sont trop gros',
    description: 'À découper avant d\'y ajouter de la logique',
    severity: 'HAUTE'
  },
  {
    title: 'Les tokens magic link expirent en 15 min',
    description: 'À prendre en compte pour les tests d\'authentification',
    severity: 'MOYENNE'
  },
  {
    title: 'L\'admin est protégé par PIN (localStorage)',
    description: 'Pas de rôle serveur, seulement côté client',
    severity: 'MOYENNE'
  }
];

pitfalls.forEach(pitfall => {
  const color = pitfall.severity === 'CRITIQUE' ? colors.red : 
                pitfall.severity === 'HAUTE' ? colors.yellow : colors.gray;
  console.log(`\n  ${color}▶ ${pitfall.title}${colors.reset}`);
  console.log(`    ${pitfall.description}`);
  console.log(`    Séverité: ${color}${pitfall.severity}${colors.reset}`);
});

// Conventions
logSection('📝 CONVENTIONS À RESPECTER');

const conventions = [
  { type: 'Composants', convention: 'PascalCase', example: 'AppCard.jsx' },
  { type: 'Hooks', convention: 'usePascalCase', example: 'useAppManagement.js' },
  { type: 'Constantes', convention: 'UPPER_SNAKE_CASE', example: 'APP_CATEGORIES' },
  { type: 'Variables/Fonctions', convention: 'camelCase', example: 'getAppById()' },
  { type: 'Fichiers', convention: 'kebab-case', example: 'app-card.jsx' },
  { type: 'Dossiers', convention: 'kebab-case', example: 'components/' }
];

conventions.forEach(conv => {
  logItem(conv.type, `${conv.convention} (ex: ${conv.example})`);
});

console.log(`\n  ${colors.bold}Autres conventions:${colors.reset}`);
console.log(`    • Pas de Redux : React hooks + localStorage uniquement`);
console.log(`    • Pas de router : Navigation par activeTab state dans App.jsx`);
console.log(`    • Pas de CSS modules : Uniquement Tailwind CSS`);
console.log(`    • Mobile-first : Toujours penser mobile en premier`);
console.log(`    • Memoization : React.memo pour les composants dans des listes`);

// Documentation
logSection('📚 DOCUMENTATION DISPONIBLE');

const docs = [
  { path: 'README.md', desc: 'Présentation, structure, déploiement' },
  { path: '.vibe/instructions.md', desc: '⭐ Instructions détaillées pour Vibe Code' },
  { path: 'AGENTS.md', desc: 'Guide pour tous les agents IA' },
  { path: '.claude/context.md', desc: 'Contexte pour Claude Code' },
  { path: '.vibe/config.json', desc: 'Configuration JSON pour Vibe Code' },
  { path: 'docs/README.md', desc: 'Index de la documentation' },
  { path: 'docs/BACKLOG.md', desc: 'Roadmap et idées de features' },
  { path: 'docs/api/README.md', desc: 'Référence API complète' },
  { path: 'docs/architecture/', desc: 'Analyse technique, Android, sécurité' },
  { path: 'docs/guides/', desc: 'Déploiement, migration, icons, etc.' }
];

docs.forEach(doc => {
  logItem(doc.path, doc.desc);
});

// Priorités de refactoring
logSection('🎯 PRIORITÉS DE REFACTORING');

const refactoring = [
  {
    task: 'Découper src/App.jsx (631L)',
    priority: 'URGENT',
    effort: 'Moyen',
    impact: 'Améliore la maintenabilité'
  },
  {
    task: 'Découper server/index.js (740L)',
    priority: 'URGENT',
    effort: 'Moyen',
    impact: 'Améliore la maintenabilité'
  },
  {
    task: 'Nettoyer les scripts racine',
    priority: 'MOYENNE',
    effort: 'Faible',
    impact: 'Propreté du repository'
  },
  {
    task: 'Synchroniser le README',
    priority: 'MOYENNE',
    effort: 'Faible',
    impact: 'Cohérence de la documentation'
  },
  {
    task: 'Vérifier android/app/debug.keystore',
    priority: 'MOYENNE',
    effort: 'Faible',
    impact: 'Sécurité'
  }
];

refactoring.forEach(item => {
  const color = item.priority === 'URGENT' ? colors.red : colors.yellow;
  console.log(`\n  ${color}▶ ${item.task}${colors.reset}`);
  console.log(`    Priorité: ${color}${item.priority}${colors.reset} | Effort: ${item.effort} | Impact: ${item.impact}`);
});

// Backlog
logSection('📋 BACKLOG (voir docs/BACKLOG.md)');

const backlog = [
  { id: '1', task: 'Migration guidée vers une alternative', status: 'MVP fait' },
  { id: '2', task: 'Alertes et suivi des notes dans le temps', status: 'À faire' },
  { id: '3', task: 'Détail du score par critères sourcés', status: 'À faire' },
  { id: '4', task: 'Contribution communautaire', status: 'À faire' },
  { id: '5', task: 'Mode hors-ligne partiel', status: 'À faire' },
  { id: '6', task: 'Portage (extension navigateur, iOS)', status: 'À faire' }
];

backlog.forEach(item => {
  const color = item.status === 'MVP fait' ? colors.green : colors.gray;
  logItem(`#${item.id}`, `${item.task} - ${item.status}`, color);
});

// Vérification rapide des fichiers
logSection('🔍 VÉRIFICATION RAPIDE DES FICHIERS');

try {
  const filesToCheck = [
    { path: 'src/App.jsx', label: 'App.jsx' },
    { path: 'server/index.js', label: 'server/index.js' },
    { path: 'src/utils/apiConfig.js', label: 'apiConfig.js' },
    { path: 'src/constants/appsData.js', label: 'appsData.js' },
    { path: '.vibe/instructions.md', label: '.vibe/instructions.md' },
    { path: 'AGENTS.md', label: 'AGENTS.md' }
  ];

  filesToCheck.forEach(file => {
    const filePath = path.join(repoRoot, file.path);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      logSuccess(`${file.label} existe (${size} KB)`);
    } else {
      logWarning(`${file.label} introuvable`);
    }
  });
} catch (e) {
  logInfo(`Impossible de vérifier les fichiers : ${e.message}`);
}

// Résumé
console.log('\n' + '='.repeat(70));
console.log(colors.bold + colors.green + '✅ ANALYSE TERMINÉE');
console.log(colors.reset + '='.repeat(70));
console.log('\n' + colors.bold + 'Prochaines étapes suggérées:' + colors.reset);
console.log('  1. Lire .vibe/instructions.md pour les détails');
console.log('  2. Lire AGENTS.md pour les règles communes');
console.log('  3. Vérifier docs/BACKLOG.md pour les priorités');
console.log('  4. Commencer par découper App.jsx ou server/index.js');
console.log('  5. Exécuter npm run vibe:check avant de commiter');
console.log('\n' + colors.gray + 'Bon codage avec Vibe Code ! 🚀' + colors.reset + '\n');
