/**
 * Niveau de confiance d'une détection (Google / SDK / tracker).
 * Reflète la fiabilité du signal ayant mené à la détection, pas la certitude
 * que la bibliothèque est activement utilisée par l'application.
 */
export const Confidence = Object.freeze({
  HIGH: 'HIGH',
  PROBABLE: 'PROBABLE',
  UNKNOWN: 'UNKNOWN',
});

export const CONFIDENCE_EMOJI = {
  [Confidence.HIGH]: '🟢',
  [Confidence.PROBABLE]: '🟡',
  [Confidence.UNKNOWN]: '⚪',
};

export const CONFIDENCE_LABEL = {
  [Confidence.HIGH]: 'Forte certitude',
  [Confidence.PROBABLE]: 'Probable',
  [Confidence.UNKNOWN]: 'Indéterminé',
};

export default Confidence;
