import { DependencyLevel } from './DependencyLevel.js';

/**
 * @typedef {Object} TechnicalAnalysis
 * Résultat complet de l'analyse technique d'une application. Totalement
 * indépendant du Trusti-Score communautaire/éditorial — ne jamais fusionner
 * les deux.
 *
 * @property {string} packageName
 * @property {string} source - 'installed' | 'apk'
 * @property {string} generatedAt - ISO 8601
 * @property {import('./ApplicationInfo').ApplicationInfo} appInfo
 * @property {import('./PermissionInfo').PermissionInfo[]} permissions
 * @property {import('./DetectionEntry').DetectionEntry[]} googleDependencies
 * @property {import('./DetectionEntry').DetectionEntry[]} sdks
 * @property {import('./DetectionEntry').DetectionEntry[]} trackers
 * @property {string} dependencyLevel - Un des DependencyLevel
 * @property {boolean} componentsAvailable - false si le système n'a pas pu fournir
 *   la liste des composants du manifeste (alors googleDependencies/sdks/trackers
 *   sont partiels et dependencyLevel vaut UNKNOWN)
 * @property {string[]} limitations - Messages factuels sur les limites de cette analyse
 */

export function createTechnicalAnalysis({
  packageName,
  source = 'installed',
  appInfo,
  permissions = [],
  googleDependencies = [],
  sdks = [],
  trackers = [],
  dependencyLevel = DependencyLevel.UNKNOWN,
  componentsAvailable = true,
  limitations = [],
}) {
  return {
    packageName,
    source,
    generatedAt: new Date().toISOString(),
    appInfo,
    permissions,
    googleDependencies,
    sdks,
    trackers,
    dependencyLevel,
    componentsAvailable,
    limitations,
  };
}

/**
 * Sérialise une TechnicalAnalysis vers le format d'export JSON public.
 * Ne contient que les données réellement détectées — jamais de valeur inventée.
 * @param {TechnicalAnalysis} analysis
 */
export function toExportJSON(analysis) {
  return {
    packageName: analysis.packageName,
    source: analysis.source,
    generatedAt: analysis.generatedAt,
    version: analysis.appInfo?.versionName ?? null,
    versionCode: analysis.appInfo?.versionCode ?? null,
    appInfo: analysis.appInfo,
    permissions: analysis.permissions.map((p) => ({
      androidName: p.androidName,
      readableName: p.readableName,
      protectionLevel: p.protectionLevel,
      granted: p.granted,
    })),
    googleDependencies: analysis.googleDependencies.map(toExportEntry),
    sdk: analysis.sdks.map(toExportEntry),
    trackers: analysis.trackers.map(toExportEntry),
    dependencyLevel: analysis.dependencyLevel,
    componentsAvailable: analysis.componentsAvailable,
    limitations: analysis.limitations,
  };
}

function toExportEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    vendor: entry.vendor,
    category: entry.category,
    confidence: entry.confidence,
    detectionMethod: entry.detectionMethod,
  };
}

export default createTechnicalAnalysis;
