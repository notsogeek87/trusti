/**
 * Point d'entrée du module d'analyse technique Trusti-Score.
 * Totalement découplé de la note communautaire/éditorielle existante
 * (voir src/models et src/utils) — ce module ne la modifie jamais, ne la lit même pas.
 */
export * from './model/index.js';
export * from './database/index.js';
export * from './analyzer/index.js';
export * from './source/index.js';
export { toExportJSON as exportTechnicalAnalysisJSON } from './model/TechnicalAnalysis.js';
