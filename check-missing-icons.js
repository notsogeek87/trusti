import fs from 'fs';

const trustiApps = JSON.parse(fs.readFileSync('server/data/custom-trusti-apps.json', 'utf8'));
const starApps = JSON.parse(fs.readFileSync('server/data/star-apps.json', 'utf8'));

const allApps = [...trustiApps, ...starApps];

const noIcon = allApps.filter(app => 
  !app.icon || 
  app.icon.trim() === '' || 
  app.icon === 'null' ||
  !app.icon.startsWith('http')
);

console.log('=== APPS SANS ICÔNE ===\n');
noIcon.forEach(app => {
  console.log(`- ${app.name}`);
  console.log(`  ID: ${app.id}`);
  console.log(`  Grade: ${app.grade}`);
  console.log(`  Catégorie: ${app.category}`);
  console.log(`  Icône: ${app.icon || '(vide)'}`);
  console.log('');
});

console.log(`Total: ${noIcon.length} apps sans icône valide sur ${allApps.length} apps`);
