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

// Volontairement PAS de vert/jaune/rouge ici : la confiance de détection est
// un axe totalement différent de "favorable/à surveiller" (voir
// technicalSignals.js côté UI). Utiliser les mêmes couleurs sèmerait la
// confusion — ex. Meta SDK détecté avec une "forte certitude" ne doit
// jamais donner l'impression visuelle d'être une bonne nouvelle.
export const CONFIDENCE_DOTS = {
  [Confidence.HIGH]: 3,
  [Confidence.PROBABLE]: 2,
  [Confidence.UNKNOWN]: 0,
};

export const CONFIDENCE_LABEL = {
  [Confidence.HIGH]: 'Détection : forte certitude',
  [Confidence.PROBABLE]: 'Détection : probable',
  [Confidence.UNKNOWN]: 'Détection : incertaine',
};

export default Confidence;
