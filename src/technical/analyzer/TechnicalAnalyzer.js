import { createTechnicalAnalysis } from '../model/TechnicalAnalysis.js';
import { analyzeAppInfo } from './AppInfoAnalyzer.js';
import { analyzePermissions } from './PermissionAnalyzer.js';
import { analyzeGoogleDependencies } from './GoogleDependencyAnalyzer.js';
import { analyzeSdks } from './SdkAnalyzer.js';
import { analyzeTrackers } from './TrackerAnalyzer.js';
import { calculateDependencyLevel } from './DependencyLevelCalculator.js';
import { analyzeComposition } from './CompositionAnalyzer.js';
import { analyzeSecurity } from './SecurityAnalyzer.js';

/**
 * Orchestrateur de l'analyse technique. Ne dépend que d'une ApplicationSource
 * (voir ../source) — jamais de Capacitor ni de PackageManager directement, ce
 * qui permet de le tester en pur JS et de le réutiliser à l'identique pour
 * une app installée ou (plus tard) un fichier APK.
 *
 *   ApplicationSource → TechnicalAnalyzer.analyze() → TechnicalAnalysis
 */
export class TechnicalAnalyzer {
  /**
   * @param {import('../source/ApplicationSource').ApplicationSource} source
   * @returns {Promise<import('../model/TechnicalAnalysis').TechnicalAnalysis>}
   */
  static async analyze(source) {
    const rawData = await source.getRawData();
    return TechnicalAnalyzer.analyzeRaw(rawData, source.kind);
  }

  /**
   * Variante synchrone opérant directement sur un RawPackageData déjà
   * normalisé — utilisée par les tests et par analyze().
   * @param {import('../source/RawPackageData').RawPackageData} rawData
   * @param {string} [source]
   * @returns {import('../model/TechnicalAnalysis').TechnicalAnalysis}
   */
  static analyzeRaw(rawData, source = 'installed') {
    const appInfo = analyzeAppInfo(rawData);
    const permissions = analyzePermissions(rawData);
    const googleDependencies = analyzeGoogleDependencies(rawData);
    const trackers = analyzeTrackers(rawData);
    const sdks = analyzeSdks(rawData);
    const composition = analyzeComposition(rawData);
    const security = analyzeSecurity(rawData);
    const { level: dependencyLevel } = calculateDependencyLevel({
      googleDependencies,
      trackers,
      sdks,
      componentsAvailable: rawData.componentsAvailable,
    });

    const limitations = [
      'Les résultats se basent sur des signatures connues et les informations accessibles via le système Android : ils peuvent être incomplets.',
      'La présence d\'une permission, d\'un SDK ou d\'une bibliothèque ne signifie pas nécessairement que cette fonctionnalité est effectivement utilisée par l\'application.',
    ];
    if (!rawData.componentsAvailable) {
      limitations.push(
        'La liste des composants de cette application n\'a pas pu être lue : les sections Google, SDK et Trackers peuvent être incomplètes.'
      );
    }

    return createTechnicalAnalysis({
      packageName: rawData.packageName,
      source,
      appInfo,
      permissions,
      googleDependencies,
      sdks,
      trackers,
      composition,
      security,
      dependencyLevel,
      componentsAvailable: rawData.componentsAvailable,
      limitations,
    });
  }
}

export default TechnicalAnalyzer;
