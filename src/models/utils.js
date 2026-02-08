/**
 * Utilitaires de validation et manipulation pour les applications Trusti
 */

import { TRUSTI_GRADES } from './Application.js';

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} true si valide
 */
export function isValidUrl(url) {
  if (!url) return true; // Les URLs sont optionnelles
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valide un score Trusti
 * @param {string} score - Score à valider
 * @returns {boolean} true si valide
 */
export function isValidTrustiScore(score) {
  return Object.values(TRUSTI_GRADES).includes(score);
}

/**
 * Valide un ID d'application
 * @param {number|string} id - ID à valider
 * @returns {boolean} true si valide
 */
export function isValidAppId(id) {
  return id !== null && id !== undefined && id !== '';
}

/**
 * Valide les champs obligatoires d'une application
 * @param {Object} app - Application à valider
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateApplication(app) {
  const errors = [];

  // Champs obligatoires
  if (!isValidAppId(app.id)) {
    errors.push("Le champ 'id' est obligatoire");
  }

  if (!app.name || typeof app.name !== 'string' || app.name.trim() === '') {
    errors.push("Le champ 'name' est obligatoire et doit être une chaîne non vide");
  }

  if (!app.trustiScore && !app.grade) {
    errors.push("Le champ 'trustiScore' (ou 'grade') est obligatoire");
  } else if (!isValidTrustiScore(app.trustiScore || app.grade)) {
    errors.push(`Le 'trustiScore' doit être A, B, C, D ou E (reçu: ${app.trustiScore || app.grade})`);
  }

  if (!app.category || typeof app.category !== 'string') {
    errors.push("Le champ 'category' est obligatoire");
  }

  if (!app.reason || typeof app.reason !== 'string' || app.reason.trim() === '') {
    errors.push("Le champ 'reason' est obligatoire et doit expliquer le score");
  }

  // Validation des URLs
  const urlFields = ['playStoreUrl', 'appleStoreUrl', 'githubUrl', 'otherStoreUrl', 'website'];
  urlFields.forEach(field => {
    if (app[field] && !isValidUrl(app[field])) {
      errors.push(`Le champ '${field}' n'est pas une URL valide: ${app[field]}`);
    }
  });

  // Validation des tableaux
  if (app.alternativeAppIds && !Array.isArray(app.alternativeAppIds)) {
    errors.push("Le champ 'alternativeAppIds' doit être un tableau");
  }

  if (app.replacesAppIds && !Array.isArray(app.replacesAppIds)) {
    errors.push("Le champ 'replacesAppIds' doit être un tableau");
  }

  // Validation des booleans
  const boolFields = ['isOpenSource', 'isEuropean'];
  boolFields.forEach(field => {
    if (app[field] !== undefined && typeof app[field] !== 'boolean') {
      errors.push(`Le champ '${field}' doit être un booléen`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Nettoie et normalise les données d'une application
 * @param {Object} app - Application à nettoyer
 * @returns {Object} Application nettoyée
 */
export function sanitizeApplication(app) {
  const cleaned = { ...app };

  // Normalisation du score (grade -> trustiScore)
  if (cleaned.grade && !cleaned.trustiScore) {
    cleaned.trustiScore = cleaned.grade;
  }
  // Garder 'grade' pour la compatibilité avec le code existant
  if (cleaned.trustiScore && !cleaned.grade) {
    cleaned.grade = cleaned.trustiScore;
  }
  // Si les deux existent, synchroniser
  if (cleaned.grade && cleaned.trustiScore && cleaned.grade !== cleaned.trustiScore) {
    cleaned.trustiScore = cleaned.grade;
  }

  // Nettoyer les URLs (supprimer les espaces, etc.)
  const urlFields = ['playStoreUrl', 'appleStoreUrl', 'githubUrl', 'otherStoreUrl', 'website'];
  urlFields.forEach(field => {
    if (cleaned[field]) {
      cleaned[field] = cleaned[field].trim();
      if (cleaned[field] === '') {
        cleaned[field] = null;
      }
    }
  });

  // Assurer que les tableaux existent
  cleaned.alternativeAppIds = cleaned.alternativeAppIds || [];
  cleaned.replacesAppIds = cleaned.replacesAppIds || [];

  // Nettoyer le nom et la catégorie
  if (cleaned.name) {
    cleaned.name = cleaned.name.trim();
  }

  if (cleaned.category) {
    cleaned.category = cleaned.category.trim();
  }

  // Valeurs par défaut
  cleaned.color = cleaned.color || 'bg-slate-600';
  cleaned.icon = cleaned.icon || '📱';

  return cleaned;
}

/**
 * Migre une application de l'ancien format vers le nouveau
 * @param {Object} oldApp - Application au format ancien
 * @returns {Object} Application au nouveau format
 */
export function migrateFromOldFormat(oldApp) {
  const migrated = {
    id: oldApp.id,
    name: oldApp.name,
    trustiScore: oldApp.grade,
    grade: oldApp.grade, // Garder pour compatibilité
    category: oldApp.category,
    icon: oldApp.icon,
    color: oldApp.color,
    reason: oldApp.reason,
    
    // Champs nouveaux à remplir manuellement si besoin
    playStoreUrl: oldApp.playStoreUrl || null,
    appleStoreUrl: oldApp.appleStoreUrl || null,
    githubUrl: oldApp.githubUrl || null,
    otherStoreUrl: oldApp.otherStoreUrl || null,
    website: oldApp.website || null,
    
    alternativeAppIds: oldApp.alternativeAppIds || [],
    replacesAppIds: oldApp.replacesAppIds || [],
    
    description: oldApp.description || oldApp.reason,
    developer: oldApp.developer || null,
    license: oldApp.license || null,
    isOpenSource: oldApp.isOpenSource || false,
    isEuropean: oldApp.isEuropean || false,
    jurisdiction: oldApp.jurisdiction || null,
    
    privacyFeatures: oldApp.privacyFeatures || {}
  };
  
  return sanitizeApplication(migrated);
}

/**
 * Compare deux applications par leur score Trusti
 * @param {Object} a - Première application
 * @param {Object} b - Deuxième application
 * @returns {number} Résultat de comparaison (-1, 0, 1)
 */
export function compareByScore(a, b) {
  const scoreValues = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const scoreA = scoreValues[a.trustiScore || a.grade] || 0;
  const scoreB = scoreValues[b.trustiScore || b.grade] || 0;
  return scoreB - scoreA; // Ordre décroissant (A avant E)
}

/**
 * Filtre les applications par score minimum
 * @param {Array} apps - Liste d'applications
 * @param {string} minScore - Score minimum (A, B, C, D, E)
 * @returns {Array} Applications filtrées
 */
export function filterByMinScore(apps, minScore) {
  const scoreValues = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const minValue = scoreValues[minScore] || 0;
  
  return apps.filter(app => {
    const appValue = scoreValues[app.trustiScore || app.grade] || 0;
    return appValue >= minValue;
  });
}

/**
 * Filtre les applications par catégorie
 * @param {Array} apps - Liste d'applications
 * @param {string} category - Catégorie recherchée
 * @returns {Array} Applications filtrées
 */
export function filterByCategory(apps, category) {
  return apps.filter(app => 
    app.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filtre les applications open-source
 * @param {Array} apps - Liste d'applications
 * @returns {Array} Applications open-source
 */
export function filterOpenSource(apps) {
  return apps.filter(app => app.isOpenSource === true);
}

/**
 * Filtre les applications européennes
 * @param {Array} apps - Liste d'applications
 * @returns {Array} Applications européennes
 */
export function filterEuropean(apps) {
  return apps.filter(app => app.isEuropean === true);
}

/**
 * Recherche d'applications par nom
 * @param {Array} apps - Liste d'applications
 * @param {string} query - Terme de recherche
 * @returns {Array} Applications correspondantes
 */
export function searchByName(apps, query) {
  const lowerQuery = query.toLowerCase();
  return apps.filter(app => 
    app.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Trouve une application par son ID
 * @param {Array} apps - Liste d'applications
 * @param {number|string} id - ID recherché
 * @returns {Object|null} Application trouvée ou null
 */
export function findById(apps, id) {
  return apps.find(app => app.id == id) || null; // == pour comparer number et string
}

/**
 * Trouve les alternatives d'une application
 * @param {Array} apps - Liste de toutes les applications
 * @param {Object} app - Application source
 * @returns {Array} Liste des applications alternatives
 */
export function findAlternatives(apps, app) {
  if (!app.alternativeAppIds || app.alternativeAppIds.length === 0) {
    return [];
  }
  
  return app.alternativeAppIds
    .map(id => findById(apps, id))
    .filter(alt => alt !== null);
}

/**
 * Trouve les applications que celle-ci peut remplacer
 * @param {Array} apps - Liste de toutes les applications
 * @param {Object} app - Application source
 * @returns {Array} Liste des applications remplaçables
 */
export function findReplaceableApps(apps, app) {
  if (!app.replacesAppIds || app.replacesAppIds.length === 0) {
    return [];
  }
  
  return app.replacesAppIds
    .map(id => findById(apps, id))
    .filter(replaceable => replaceable !== null);
}

/**
 * Génère des statistiques sur une liste d'applications
 * @param {Array} apps - Liste d'applications
 * @returns {Object} Statistiques
 */
export function generateStats(apps) {
  const stats = {
    total: apps.length,
    byScore: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    byCategory: {},
    openSource: 0,
    european: 0,
    withPlayStore: 0,
    withAppleStore: 0,
    withGithub: 0
  };

  apps.forEach(app => {
    const score = app.trustiScore || app.grade;
    if (score) {
      stats.byScore[score] = (stats.byScore[score] || 0) + 1;
    }

    const category = app.category || 'Autre';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    if (app.isOpenSource) stats.openSource++;
    if (app.isEuropean) stats.european++;
    if (app.playStoreUrl) stats.withPlayStore++;
    if (app.appleStoreUrl) stats.withAppleStore++;
    if (app.githubUrl) stats.withGithub++;
  });

  return stats;
}

/**
 * Exporte une application au format JSON lisible
 * @param {Object} app - Application à exporter
 * @returns {string} JSON formaté
 */
export function exportToJSON(app) {
  return JSON.stringify(app, null, 2);
}

/**
 * Importe une application depuis JSON avec validation
 * @param {string} jsonString - Chaîne JSON
 * @returns {Object} { success: boolean, app?: Object, errors?: string[] }
 */
export function importFromJSON(jsonString) {
  try {
    const app = JSON.parse(jsonString);
    const validation = validateApplication(app);
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    return {
      success: true,
      app: sanitizeApplication(app)
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Erreur de parsing JSON: ${error.message}`]
    };
  }
}

export default {
  isValidUrl,
  isValidTrustiScore,
  isValidAppId,
  validateApplication,
  sanitizeApplication,
  migrateFromOldFormat,
  compareByScore,
  filterByMinScore,
  filterByCategory,
  filterOpenSource,
  filterEuropean,
  searchByName,
  findById,
  findAlternatives,
  findReplaceableApps,
  generateStats,
  exportToJSON,
  importFromJSON
};
