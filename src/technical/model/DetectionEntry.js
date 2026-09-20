import { Confidence } from './Confidence.js';

/**
 * @typedef {Object} DetectionEntry
 * Forme commune utilisée pour une dépendance Google, un SDK ou un tracker détecté.
 *
 * @property {string} id - Identifiant de la signature (ex. "firebase_cloud_messaging")
 * @property {string} name - Nom d'affichage (ex. "Firebase Cloud Messaging")
 * @property {string} vendor - Organisation éditrice (ex. "Google", "Meta")
 * @property {string} category - Catégorie fonctionnelle (ex. "push_notifications", "crash_reporting")
 * @property {string} confidence - Un des Confidence
 * @property {string} detectionMethod - Explication factuelle de la méthode de détection
 * @property {boolean} isGoogleProduct
 * @property {string|null} trackerCategory - null si ce n'est pas un tracker, sinon ex. "advertising" | "analytics" | "attribution"
 * @property {string} [description] - Courte description neutre du rôle de la bibliothèque
 */

/**
 * Construit un DetectionEntry à partir d'une signature détectée + du contexte du match.
 * @param {Object} signature - Entrée de la base de signatures
 * @param {{confidence: string, detectionMethod: string}} matchInfo
 * @returns {DetectionEntry}
 */
export function createDetectionEntry(signature, matchInfo) {
  return {
    id: signature.id,
    name: signature.name,
    vendor: signature.vendor,
    category: signature.category,
    confidence: matchInfo?.confidence || Confidence.UNKNOWN,
    detectionMethod: matchInfo?.detectionMethod || 'Référence détectée dans l\'application',
    isGoogleProduct: !!signature.isGoogleProduct,
    trackerCategory: signature.trackerCategory || null,
    description: signature.description || '',
  };
}

export default createDetectionEntry;
