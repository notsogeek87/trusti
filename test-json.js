import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('server/data/custom-trusti-apps.json', 'utf8'));
  console.log('JSON valide ✓');
  console.log('Nombre d\'apps:', data.length);
  const iaApps = data.filter(app => app.category === 'IA');
  console.log('Apps IA:', iaApps.length);
  iaApps.forEach(app => console.log('-', app.name, '(Grade:', app.grade + ')'));
} catch(e) {
  console.log('Erreur JSON:', e.message);
}
