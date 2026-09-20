/**
 * Niveau de dépendance technique — indicateur SÉPARÉ du Trusti-Score.
 *
 * Ce n'est ni un score de sécurité, ni de confidentialité, ni de qualité.
 * Il décrit uniquement le volume de dépendances techniques détectées
 * (Google, trackers, SDK tiers). Voir DEPENDENCY_LEVEL_EXPLANATION.
 */
export const DependencyLevel = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
  UNKNOWN: 'UNKNOWN',
});

export const DEPENDENCY_LEVEL_LABEL = {
  [DependencyLevel.LOW]: 'Faible',
  [DependencyLevel.MODERATE]: 'Modéré',
  [DependencyLevel.HIGH]: 'Élevé',
  [DependencyLevel.VERY_HIGH]: 'Très élevé',
  [DependencyLevel.UNKNOWN]: 'Non déterminé',
};

export const DEPENDENCY_LEVEL_EMOJI = {
  [DependencyLevel.LOW]: '🟢',
  [DependencyLevel.MODERATE]: '🟡',
  [DependencyLevel.HIGH]: '🟠',
  [DependencyLevel.VERY_HIGH]: '🔴',
  [DependencyLevel.UNKNOWN]: '⚪',
};

export const DEPENDENCY_LEVEL_EXPLANATION =
  'Le niveau de dépendance décrit uniquement les dépendances techniques ' +
  'détectées dans l\'application. Il ne constitue pas une évaluation de sa ' +
  'sécurité, de sa qualité ou de sa fiabilité.';

export default DependencyLevel;
