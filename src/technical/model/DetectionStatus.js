/**
 * Statut de détection d'un élément technique (permission, SDK, dépendance...).
 *
 * Distinction volontaire entre "non détecté" (on a cherché, on n'a rien trouvé
 * dans les signatures/données disponibles) et "non déterminé" (les données
 * nécessaires n'étaient pas disponibles pour se prononcer). Ne jamais confondre
 * les deux : "non détecté" n'est pas une preuve d'absence.
 */
export const DetectionStatus = Object.freeze({
  DETECTED: 'DETECTED',
  NOT_DETECTED: 'NOT_DETECTED',
  UNKNOWN: 'UNKNOWN',
});

export const isValidDetectionStatus = (value) =>
  Object.values(DetectionStatus).includes(value);

export default DetectionStatus;
