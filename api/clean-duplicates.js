/**
 * API endpoint pour nettoyer les doublons dans la base de données
 * Usage: GET /api/clean-duplicates?action=list ou GET /api/clean-duplicates?action=delete
 */
import dbService from '../server/database/service-postgres.js';

/**
 * Normalise un nom d'application pour la comparaison
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[:\-\–\—\.\,\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trouve les similaires (comme "leboncoin" vs "leboncoin, petites annonces")
 */
function findSimilar(apps) {
  const similar = [];
  
  for (let i = 0; i < apps.length; i++) {
    for (let j = i + 1; j < apps.length; j++) {
      const app1 = apps[i];
      const app2 = apps[j];
      
      const name1 = normalizeName(app1.name);
      const name2 = normalizeName(app2.name);
      
      // Vérifie si l'un est contenu dans l'autre
      if (name1.includes(name2) || name2.includes(name1)) {
        const words1 = name1.split(' ');
        const words2 = name2.split(' ');
        
        if (Math.abs(words1.length - words2.length) <= 3) {
          similar.push({
            app1: { id: app1.id, name: app1.name },
            app2: { id: app2.id, name: app2.name },
            shouldDelete: name1.length > name2.length ? app1.id : app2.id // Garder le nom le plus court
          });
        }
      }
    }
  }
  
  return similar;
}

/**
 * Trouve les doublons exacts
 */
function findExactDuplicates(apps) {
  const duplicates = [];
  const seen = new Map();
  
  for (const app of apps) {
    const normalizedName = normalizeName(app.name);
    
    if (seen.has(normalizedName)) {
      const original = seen.get(normalizedName);
      duplicates.push({
        original: { id: original.id, name: original.name },
        duplicate: { id: app.id, name: app.name },
        shouldDelete: app.id
      });
    } else {
      seen.set(normalizedName, app);
    }
  }
  
  return duplicates;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    console.log('🔍 Récupération de toutes les applications...');
    const apps = await dbService.getAllApps();
    console.log(`📱 ${apps.length} applications trouvées`);
    
    // Chercher spécifiquement leboncoin
    const leboncoinApps = apps.filter(app => 
      app.name && app.name.toLowerCase().includes('leboncoin')
    );
    
    console.log('🔍 Applications leboncoin trouvées:', leboncoinApps.map(app => ({ id: app.id, name: app.name })));
    
    // Chercher les doublons exacts
    const exactDuplicates = findExactDuplicates(apps);
    
    // Chercher les similaires  
    const similarApps = findSimilar(apps);
    
    // Cas spécifique: leboncoin - garder seulement "Leboncoin"
    const leboncoinDuplicates = leboncoinApps.filter(app => 
      app.name !== 'Leboncoin'
    ).map(app => ({
      original: { name: 'Leboncoin' },
      duplicate: { id: app.id, name: app.name },
      shouldDelete: app.id,
      reason: 'leboncoin variant'
    }));

    const allDuplicates = [
      ...exactDuplicates,
      ...similarApps,
      ...leboncoinDuplicates
    ];

    console.log('📋 Doublons détectés:', allDuplicates);

    if (action === 'list') {
      return res.json({
        total: apps.length,
        duplicates: allDuplicates.length,
        leboncoinApps: leboncoinApps.map(app => ({ id: app.id, name: app.name })),
        details: {
          exact: exactDuplicates,
          similar: similarApps,
          leboncoin: leboncoinDuplicates
        }
      });
    }

    if (action === 'delete') {
      const deleteIds = [...new Set(allDuplicates.map(d => d.shouldDelete))];
      
      console.log('🗑️ IDs à supprimer:', deleteIds);
      
      if (deleteIds.length === 0) {
        return res.json({ message: 'Aucun doublon à supprimer', deleted: 0 });
      }

      // Supprimer les doublons un par un
      const results = [];
      for (const appId of deleteIds) {
        try {
          console.log(`Suppression de ${appId}...`);
          await dbService.deleteApp(appId);
          results.push({ id: appId, status: 'deleted' });
          console.log(`✅ ${appId} supprimé`);
        } catch (error) {
          console.error(`❌ Erreur suppression ${appId}:`, error);
          results.push({ id: appId, status: 'error', error: error.message });
        }
      }

      const deletedCount = results.filter(r => r.status === 'deleted').length;
      console.log(`🎉 ${deletedCount} doublons supprimés au total`);

      return res.json({
        message: `${deletedCount} doublons supprimés`,
        total_attempted: deleteIds.length,
        results
      });
    }

    return res.status(400).json({ 
      error: 'Action required: ?action=list or ?action=delete' 
    });

  } catch (error) {
    console.error('❌ Erreur dans clean-duplicates:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message,
      stack: error.stack 
    });
  }
}