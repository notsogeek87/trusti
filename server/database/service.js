/**
 * Service de base de données pour les applications
 * Fournit toutes les opérations CRUD
 */
import { getDatabase } from './config.js';

/**
 * Obtenir toutes les applications
 */
export function getAllApps(db) {
  const apps = db.prepare(`
    SELECT * FROM applications
    ORDER BY name
  `).all();
  
  return apps.map(formatApp);
}

/**
 * Obtenir les applications par type
 */
export function getAppsByType(db, appType) {
  const apps = db.prepare(`
    SELECT * FROM applications
    WHERE appType = ?
    ORDER BY name
  `).all(appType);
  
  return apps.map(formatApp);
}

/**
 * Obtenir une application par ID
 */
export function getAppById(db, id) {
  const app = db.prepare(`
    SELECT * FROM applications
    WHERE id = ?
  `).get(String(id));
  
  return app ? formatApp(app) : null;
}

/**
 * Obtenir les relations d'une application
 */
export function getAppRelations(db, appId) {
  const relations = db.prepare(`
    SELECT relatedAppId, relationType
    FROM app_relations
    WHERE appId = ?
  `).all(String(appId));
  
  const alternatives = [];
  const replaces = [];
  
  relations.forEach(rel => {
    if (rel.relationType === 'alternative') {
      alternatives.push(rel.relatedAppId);
    } else if (rel.relationType === 'replaces') {
      replaces.push(rel.relatedAppId);
    }
  });
  
  return { alternativeAppIds: alternatives, replacesAppIds: replaces };
}

/**
 * Créer une nouvelle application
 */
export function createApp(db, appData) {
  const id = appData.id || String(Date.now());
  const trustiScore = appData.trustiScore || appData.grade || 'C';
  const grade = appData.grade || appData.trustiScore || 'C';
  
  const insert = db.prepare(`
    INSERT INTO applications (
      id, name, trustiScore, grade, category, icon, color, reason,
      playStoreUrl, appleStoreUrl, githubUrl, otherStoreUrl, website,
      description, developer, license, isOpenSource, isEuropean, jurisdiction,
      appType, privacyFeatures
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);
  
  insert.run(
    id,
    appData.name,
    trustiScore,
    grade,
    appData.category || 'Application',
    appData.icon || null,
    appData.color || 'bg-slate-600',
    appData.reason || '',
    appData.playStoreUrl || null,
    appData.appleStoreUrl || null,
    appData.githubUrl || null,
    appData.otherStoreUrl || null,
    appData.website || null,
    appData.description || null,
    appData.developer || null,
    appData.license || null,
    appData.isOpenSource ? 1 : 0,
    appData.isEuropean ? 1 : 0,
    appData.jurisdiction || null,
    appData.appType || 'regular',
    appData.privacyFeatures ? JSON.stringify(appData.privacyFeatures) : null
  );
  
  // Ajouter les relations
  if (appData.alternativeAppIds && Array.isArray(appData.alternativeAppIds)) {
    addRelations(db, id, appData.alternativeAppIds, 'alternative');
  }
  
  if (appData.replacesAppIds && Array.isArray(appData.replacesAppIds)) {
    addRelations(db, id, appData.replacesAppIds, 'replaces');
  }
  
  return getAppById(db, id);
}

/**
 * Mettre à jour une application
 */
export function updateApp(db, id, appData) {
  const trustiScore = appData.trustiScore || appData.grade;
  const grade = appData.grade || appData.trustiScore;
  
  const update = db.prepare(`
    UPDATE applications SET
      name = ?,
      trustiScore = ?,
      grade = ?,
      category = ?,
      icon = ?,
      color = ?,
      reason = ?,
      playStoreUrl = ?,
      appleStoreUrl = ?,
      githubUrl = ?,
      otherStoreUrl = ?,
      website = ?,
      description = ?,
      developer = ?,
      license = ?,
      isOpenSource = ?,
      isEuropean = ?,
      jurisdiction = ?,
      appType = ?,
      privacyFeatures = ?
    WHERE id = ?
  `);
  
  update.run(
    appData.name,
    trustiScore,
    grade,
    appData.category,
    appData.icon,
    appData.color,
    appData.reason,
    appData.playStoreUrl || null,
    appData.appleStoreUrl || null,
    appData.githubUrl || null,
    appData.otherStoreUrl || null,
    appData.website || null,
    appData.description || null,
    appData.developer || null,
    appData.license || null,
    appData.isOpenSource ? 1 : 0,
    appData.isEuropean ? 1 : 0,
    appData.jurisdiction || null,
    appData.appType,
    appData.privacyFeatures ? JSON.stringify(appData.privacyFeatures) : null,
    String(id)
  );
  
  // Mettre à jour les relations
  deleteRelations(db, id);
  if (appData.alternativeAppIds) {
    addRelations(db, id, appData.alternativeAppIds, 'alternative');
  }
  if (appData.replacesAppIds) {
    addRelations(db, id, appData.replacesAppIds, 'replaces');
  }
  
  return getAppById(db, id);
}

/**
 * Supprimer une application
 */
export function deleteApp(db, id) {
  const del = db.prepare('DELETE FROM applications WHERE id = ?');
  const result = del.run(String(id));
  return result.changes > 0;
}

/**
 * Rechercher des applications
 */
export function searchApps(db, query, filters = {}) {
  let sql = 'SELECT * FROM applications WHERE 1=1';
  const params = [];
  
  // Recherche par nom
  if (query) {
    sql += ' AND name LIKE ?';
    params.push(`%${query}%`);
  }
  
  // Filtres
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  
  if (filters.score) {
    sql += ' AND trustiScore = ?';
    params.push(filters.score);
  }
  
  if (filters.appType) {
    sql += ' AND appType = ?';
    params.push(filters.appType);
  }
  
  if (filters.isOpenSource !== undefined) {
    sql += ' AND isOpenSource = ?';
    params.push(filters.isOpenSource ? 1 : 0);
  }
  
  sql += ' ORDER BY name';
  
  const apps = db.prepare(sql).all(...params);
  return apps.map(formatApp);
}

/**
 * Obtenir les statistiques
 */
export function getStats(db) {
  return {
    total: db.prepare('SELECT COUNT(*) as count FROM applications').get().count,
    byType: db.prepare(`
      SELECT appType, COUNT(*) as count 
      FROM applications 
      GROUP BY appType
    `).all(),
    byScore: db.prepare(`
      SELECT trustiScore, COUNT(*) as count 
      FROM applications 
      GROUP BY trustiScore 
      ORDER BY trustiScore
    `).all(),
    byCategory: db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM applications 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10
    `).all()
  };
}

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Ajouter des relations
 */
function addRelations(db, appId, relatedIds, relationType) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO app_relations (appId, relatedAppId, relationType)
    VALUES (?, ?, ?)
  `);
  
  const addMany = db.transaction((ids) => {
    for (const relatedId of ids) {
      insert.run(String(appId), String(relatedId), relationType);
    }
  });
  
  addMany(relatedIds);
}

/**
 * Supprimer les relations d'une app
 */
function deleteRelations(db, appId) {
  const del = db.prepare('DELETE FROM app_relations WHERE appId = ?');
  del.run(String(appId));
}

/**
 * Formater une application pour l'API
 */
function formatApp(app) {
  const relations = getAppRelations(getDatabase(), app.id);
  
  return {
    id: app.id,
    name: app.name,
    trustiScore: app.trustiScore,
    grade: app.grade,
    category: app.category,
    icon: app.icon,
    color: app.color,
    reason: app.reason,
    playStoreUrl: app.playStoreUrl,
    appleStoreUrl: app.appleStoreUrl,
    githubUrl: app.githubUrl,
    otherStoreUrl: app.otherStoreUrl,
    website: app.website,
    description: app.description,
    developer: app.developer,
    license: app.license,
    isOpenSource: Boolean(app.isOpenSource),
    isEuropean: Boolean(app.isEuropean),
    jurisdiction: app.jurisdiction,
    appType: app.appType,
    privacyFeatures: app.privacyFeatures ? JSON.parse(app.privacyFeatures) : {},
    alternativeAppIds: relations.alternativeAppIds,
    replacesAppIds: relations.replacesAppIds,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
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
  getStats
};
