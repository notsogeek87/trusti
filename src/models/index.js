/**
 * Point d'entrée pour le modèle Application Trusti
 * Exporte tous les modules nécessaires
 */

// Classe principale et fonctions de création
export {
  TrustiApplication,
  createApplication,
  TRUSTI_GRADES,
  APP_CATEGORIES,
  APPLICATION_EXAMPLE,
  default
} from './Application.js';

// Utilitaires de validation et manipulation
export * as utils from './utils.js';

// Exemples d'applications
export {
  exampleSignal,
  exampleWhatsApp,
  exampleTikTok,
  exampleProtonMail,
  exampleNewPipe,
  exampleMastodon,
  EXAMPLE_APPS,
  displayAppInfo
} from './examples.js';

/**
 * Import rapide de toutes les fonctions utilitaires
 */
export {
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
} from './utils.js';
