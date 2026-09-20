import { createCompositionInfo } from '../model/CompositionInfo.js';

/**
 * Normalise la composition brute (taille, DEX, bibliothèques natives,
 * architectures, split APK, nombre de composants) en CompositionInfo. Reste
 * purement descriptif — ne dit rien sur la sécurité ni l'intention de l'app.
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/CompositionInfo').CompositionInfo}
 */
export function analyzeComposition(rawData) {
  return createCompositionInfo(rawData.composition, rawData.componentCounts);
}

export default analyzeComposition;
