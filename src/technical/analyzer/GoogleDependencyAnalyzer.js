import { GoogleDatabase } from '../database/GoogleDatabase.js';

/**
 * Détecte les dépendances Google connues. Ne conclut jamais que l'app "ne
 * fonctionne pas sans Google" — uniquement qu'une référence a été détectée.
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/DetectionEntry').DetectionEntry[]}
 */
export function analyzeGoogleDependencies(rawData) {
  return GoogleDatabase.detect(rawData);
}

export default analyzeGoogleDependencies;
