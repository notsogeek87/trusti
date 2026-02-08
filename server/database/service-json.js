/**
 * Service de base de données JSON pour les applications
 * Alternative simple à SQL sans dépendances natives
 */
import { loadDB, saveDB, backup, initDatabase } from './db.js';

// Initialiser au démarrage
initDatabase();

/**
 * Obtenir toutes les applications
 */
export function getAllApps() {
  const db = loadDB();
  return db.applications.map(formatApp);
}

/**
 * Obtenir les applications par type
 * Type déterminé par le trustiScore:
 * - 'trusti': scores A, B, C
 * - 'star': scores D, E
 */
export function getAppsByType(appType) {
  const db = loadDB();
  let apps;
  
  if (appType === 'trusti') {
    // Trusti Apps: scores A, B, C
    apps = db.applications.filter(app => ['A', 'B', 'C'].includes(app.trustiScore));
  } else if (appType === 'star') {
    // Star Apps: scores D, E
    apps = db.applications.filter(app => ['D', 'E'].includes(app.trustiScore));
  } else {
    // Autres types par appType stocké (pour compatibilité)
    apps = db.applications.filter(app => app.appType === appType);
  }
  
  return apps.map(formatApp);
}

/**
 * Obtenir une application par ID
 */
export function getAppById(id) {
  const db = loadDB();
  const app = db.applications.find(app => String(app.id) === String(id));
  return app ? formatApp(app) : null;
}

/**
 * Créer une nouvelle application
 */
export function createApp(appData) {
  const db = loadDB();
  
  const id = appData.id || String(Date.now());
  const trustiScore = appData.trustiScore || appData.grade || 'C';
  const grade = appData.grade || appData.trustiScore || 'C';
  
  const newApp = {
    id,
    name: appData.name,
    trustiScore,
    grade,
    category: appData.category || 'Application',
    icon: appData.icon || null,
    color: appData.color || 'bg-slate-600',
    reason: appData.reason || '',
    playStoreUrl: appData.playStoreUrl || null,
    appleStoreUrl: appData.appleStoreUrl || null,
    githubUrl: appData.githubUrl || null,
    otherStoreUrl: appData.otherStoreUrl || null,
    website: appData.website || null,
    description: appData.description || null,
    developer: appData.developer || null,
    license: appData.license || null,
    isOpenSource: appData.isOpenSource || false,
    isEuropean: appData.isEuropean || false,
    jurisdiction: appData.jurisdiction || null,
    appType: appData.appType || 'regular',
    privacyFeatures: appData.privacyFeatures || {},
    alternativeAppIds: appData.alternativeAppIds || [],
    replacesAppIds: appData.replacesAppIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.applications.push(newApp);
  
  // Sauvegarder les relations
  if (appData.alternativeAppIds) {
    addRelations(db, id, appData.alternativeAppIds, 'alternative');
  }
  if (appData.replacesAppIds) {
    addRelations(db, id, appData.replacesAppIds, 'replaces');
  }
  
  saveDB(db);
  return formatApp(newApp);
}

/**
 * Mettre à jour une application
 */
export function updateApp(id, appData) {
  const db = loadDB();
  const index = db.applications.findIndex(app => String(app.id) === String(id));
  
  if (index === -1) {
    return null;
  }
  
  const trustiScore = appData.trustiScore || appData.grade;
  const grade = appData.grade || appData.trustiScore;
  
  db.applications[index] = {
    ...db.applications[index],
    ...appData,
    id: String(id), // Garder l'ID original
    trustiScore,
    grade,
    updatedAt: new Date().toISOString()
  };
  
  // Mettre à jour les relations
  deleteRelations(db, id);
  if (appData.alternativeAppIds) {
    addRelations(db, id, appData.alternativeAppIds, 'alternative');
  }
  if (appData.replacesAppIds) {
    addRelations(db, id, appData.replacesAppIds, 'replaces');
  }
  
  saveDB(db);
  return formatApp(db.applications[index]);
}

/**
 * Supprimer une application
 */
export function deleteApp(id) {
  const db = loadDB();
  const initialLength = db.applications.length;
  
  db.applications = db.applications.filter(app => String(app.id) !== String(id));
  deleteRelations(db, id);
  
  if (db.applications.length < initialLength) {
    saveDB(db);
    return true;
  }
  
  return false;
}

/**
 * Rechercher des applications
 */
export function searchApps(query, filters = {}) {
  const db = loadDB();
  let results = db.applications;
  
  // Filtre par nom
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(app => 
      app.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Filtre par catégorie
  if (filters.category) {
    results = results.filter(app => app.category === filters.category);
  }
  
  // Filtre par score
  if (filters.score) {
    results = results.filter(app => app.trustiScore === filters.score);
  }
  
  // Filtre par type
  if (filters.appType) {
    results = results.filter(app => app.appType === filters.appType);
  }
  
  // Filtre open-source
  if (filters.isOpenSource !== undefined) {
    results = results.filter(app => app.isOpenSource === filters.isOpenSource);
  }
  
  return results.map(formatApp);
}

/**
 * Obtenir les statistiques
 */
export function getStats() {
  const db = loadDB();
  
  const byType = {};
  const byScore = {};
  const byCategory = {};
  
  db.applications.forEach(app => {
    // Par type
    byType[app.appType] = (byType[app.appType] || 0) + 1;
    
    // Par score
    byScore[app.trustiScore] = (byScore[app.trustiScore] || 0) + 1;
    
    // Par catégorie
    byCategory[app.category] = (byCategory[app.category] || 0) + 1;
  });
  
  return {
    total: db.applications.length,
    byType: Object.entries(byType).map(([appType, count]) => ({ appType, count })),
    byScore: Object.entries(byScore).map(([score, count]) => ({ trustiScore: score, count }))
      .sort((a, b) => a.trustiScore.localeCompare(b.trustiScore)),
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  };
}

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Ajouter des relations
 */
function addRelations(db, appId, relatedIds, relationType) {
  if (!db.relations) {
    db.relations = [];
  }
  
  relatedIds.forEach(relatedId => {
    const exists = db.relations.some(rel => 
      String(rel.appId) === String(appId) && 
      String(rel.relatedAppId) === String(relatedId) &&
      rel.relationType === relationType
    );
    
    if (!exists) {
      db.relations.push({
        appId: String(appId),
        relatedAppId: String(relatedId),
        relationType
      });
    }
  });
}

/**
 * Supprimer les relations d'une app
 */
function deleteRelations(db, appId) {
  if (!db.relations) {
    db.relations = [];
  }
  
  db.relations = db.relations.filter(rel => String(rel.appId) !== String(appId));
}

/**
 * Obtenir les relations d'une app
 */
function getAppRelations(db, appId) {
  if (!db.relations) {
    return { alternativeAppIds: [], replacesAppIds: [] };
  }
  
  const alternatives = [];
  const replaces = [];
  
  db.relations.forEach(rel => {
    if (String(rel.appId) === String(appId)) {
      if (rel.relationType === 'alternative') {
        alternatives.push(rel.relatedAppId);
      } else if (rel.relationType === 'replaces') {
        replaces.push(rel.relatedAppId);
      }
    }
  });
  
  return { alternativeAppIds: alternatives, replacesAppIds: replaces };
}

/**
 * Calculer le type d'application basé sur le trustiScore
 * @param {string} trustiScore - Score A, B, C, D ou E
 * @returns {string} 'trusti' (A/B/C), 'star' (D/E), ou 'regular'
 */
function calculateAppType(trustiScore) {
  if (['A', 'B', 'C'].includes(trustiScore)) return 'trusti';
  if (['D', 'E'].includes(trustiScore)) return 'star';
  return 'regular';
}

/**
 * Formater une application pour l'API
 */
function formatApp(app) {
  const db = loadDB();
  const relations = getAppRelations(db, app.id);
  const appType = app.appType || calculateAppType(app.trustiScore);
  
  return {
    ...app,
    appType: appType,
    alternativeAppIds: app.alternativeAppIds || relations.alternativeAppIds,
    replacesAppIds: app.replacesAppIds || relations.replacesAppIds
  };
}

export default {
  getAllApps,
  getAppsByType,
  getAppById,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats,
  backup
};
