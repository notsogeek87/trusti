import { TrackerDatabase } from '../database/TrackerDatabase.js';

/**
 * Détecte les SDK de tracking connus (publicité, mesure d'audience,
 * attribution, engagement). Formulation strictement factuelle attendue en
 * aval ("SDK de tracking détecté"), jamais accusatoire.
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/DetectionEntry').DetectionEntry[]}
 */
export function analyzeTrackers(rawData) {
  return TrackerDatabase.detect(rawData);
}

export default analyzeTrackers;
