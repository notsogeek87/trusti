import { DetectionMethod } from './DetectionMethod.js';
import { Confidence } from './Confidence.js';

/**
 * @typedef {Object} DetectionMetadata
 * Provenance d'une information technique — chaque donnée détectée devrait
 * pouvoir exposer la sienne (spec « Provenance des informations »).
 *
 * @property {string} method - Un des DetectionMethod
 * @property {string} confidence - Un des Confidence
 * @property {string|null} source - Élément concret ayant permis la détection
 *   (ex. nom de classe, clé de méta-données, domaine trouvé) — null si non applicable.
 */

/**
 * @param {{method?: string, confidence?: string, source?: string|null}} data
 * @returns {DetectionMetadata}
 */
export function createDetectionMetadata(data = {}) {
  return {
    method: data.method || DetectionMethod.UNKNOWN,
    confidence: data.confidence || Confidence.UNKNOWN,
    source: data.source ?? null,
  };
}

export default createDetectionMetadata;
