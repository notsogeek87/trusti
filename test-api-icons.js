/**
 * Test rapide de l'API backend
 */
import https from 'https';
import http from 'http';

function testAPI(url) {
  const client = url.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

console.log('🧪 Test de l\'API backend...\n');

testAPI('http://localhost:3001/api/custom-trusti-apps')
  .then(response => {
    const apps = response.apps || response;
    console.log(`✅ API répond! ${apps.length} apps trouvées\n`);
    
    // Filtrer les apps IA
    const iaApps = apps.filter(app => app.category === 'IA');
    console.log(`🤖 Apps IA: ${iaApps.length}\n`);
    
    iaApps.forEach(app => {
      const iconPreview = app.icon ? app.icon.substring(0, 60) + '...' : 'PAS D\'ICÔNE';
      console.log(`${app.grade === 'A' ? '🌟' : '⭐'} ${app.name} (${app.grade})`);
      console.log(`   Icon: ${iconPreview}\n`);
    });
    
    if (iaApps.length === 0) {
      console.log('\n❌ Aucune app IA trouvée!');
      console.log('   Vérification des premières apps...\n');
      apps.slice(0, 3).forEach(app => {
        console.log(`   - ${app.name} (${app.category || 'pas de catégorie'})`);
      });
    }
  })
  .catch(error => {
    console.error('❌ Erreur API:', error.message);
    console.error('   Le backend est-il démarré sur le port 3001 ?');
  });
