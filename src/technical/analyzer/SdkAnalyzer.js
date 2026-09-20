import { SdkDatabase } from '../database/SdkDatabase.js';

/**
 * Détecte l'ensemble des SDK connus (superset de Google + trackers + outils
 * développeur).
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/DetectionEntry').DetectionEntry[]}
 */
export function analyzeSdks(rawData) {
  return SdkDatabase.detect(rawData);
}

export default analyzeSdks;
