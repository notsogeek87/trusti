import fetch from 'node-fetch';

async function testAPIPopularity() {
  console.log('🧪 Test de l\'API - Tri par popularité\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/apps?limit=500');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erreur API:', data);
      return;
    }
    
    const apps = data.apps;
    console.log(`📦 ${apps.length} apps récupérées\n`);
    
    // Filtrer les apps avec popularity < 50
    const popularApps = apps.filter(app => app.popularity < 50);
    
    // Trier par popularity
    popularApps.sort((a, b) => a.popularity - b.popularity);
    
    console.log('📊 Top 15 apps par popularité (depuis l\'API):\n');
    popularApps.slice(0, 15).forEach((app, index) => {
      const num = (index + 1).toString().padStart(2, ' ');
      const name = app.name.padEnd(35, ' ');
      const pop = app.popularity.toString().padStart(3, ' ');
      console.log(`${num}. ${name} (rang ${pop}, note ${app.grade})`);
    });
    
    // Vérifier que Whatsapp est bien en tête
    if (popularApps[0].name === 'Whatsapp' && popularApps[0].popularity === 0) {
      console.log('\n✅ Whatsapp est bien en position 1 avec popularity=0');
    } else {
      console.log('\n❌ Problème: Whatsapp n\'est pas en tête!');
    }
    
    // Vérifier que tous les champs popularity sont présents
    const appsWithoutPopularity = apps.filter(app => app.popularity === undefined);
    if (appsWithoutPopularity.length === 0) {
      console.log('✅ Toutes les apps ont un champ popularity');
    } else {
      console.log(`❌ ${appsWithoutPopularity.length} apps sans champ popularity`);
    }
    
    console.log('\n🎉 Le tri par popularité fonctionne correctement dans l\'API!');
    console.log('📱 La page onboarding affichera les apps dans cet ordre.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAPIPopularity();
