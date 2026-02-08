import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'apps.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('\n═══════════════════════════════════════');
console.log('📊 CONTENU DE LA BASE DE DONNÉES');
console.log('═══════════════════════════════════════\n');

console.log(`📦 Total applications: ${db.applications.length}`);
console.log(`🔗 Total relations: ${db.relations.length}`);
console.log(`📅 Dernière mise à jour: ${new Date(db.metadata.lastUpdate).toLocaleString('fr-FR')}\n`);

// Par type
const byType = {};
db.applications.forEach(app => {
  byType[app.appType] = (byType[app.appType] || 0) + 1;
});

console.log('📂 PAR TYPE:');
Object.entries(byType).forEach(([type, count]) => {
  console.log(`   ${type}: ${count} apps`);
});

// Par score
const byScore = {};
db.applications.forEach(app => {
  byScore[app.trustiScore] = (byScore[app.trustiScore] || 0) + 1;
});

console.log('\n⭐ PAR SCORE TRUSTI:');
Object.entries(byScore).sort().forEach(([score, count]) => {
  const emoji = score === 'A' ? '🌟' : score === 'B' ? '✨' : score === 'C' ? '⚡' : score === 'D' ? '⚠️' : '❌';
  console.log(`   ${emoji} ${score}: ${count} apps`);
});

// Liste des applications
console.log('\n📋 LISTE DES APPLICATIONS:\n');
console.log('TRUSTI APPS:');
db.applications
  .filter(app => app.appType === 'trusti')
  .forEach((app, i) => {
    const emoji = app.trustiScore === 'A' ? '🌟' : app.trustiScore === 'B' ? '✨' : '⚡';
    console.log(`   ${i+1}. ${emoji} ${app.name} (${app.trustiScore})`);
  });

console.log('\nSTAR APPS:');
db.applications
  .filter(app => app.appType === 'star')
  .forEach((app, i) => {
    const emoji = app.trustiScore === 'A' ? '🌟' : app.trustiScore === 'B' ? '✨' : '⚡';
    console.log(`   ${i+1}. ${emoji} ${app.name} (${app.trustiScore})`);
  });

console.log('\n═══════════════════════════════════════\n');
