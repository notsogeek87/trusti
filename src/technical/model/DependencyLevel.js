import { t } from '../../i18n/index.js';
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
  [DependencyLevel.LOW]: t('technical.models.dependency.LOW'),
  [DependencyLevel.MODERATE]: t('technical.models.dependency.MODERATE'),
  [DependencyLevel.HIGH]: t('technical.models.dependency.HIGH'),
  [DependencyLevel.VERY_HIGH]: t('technical.models.dependency.VERY_HIGH'),
  [DependencyLevel.UNKNOWN]: t('technical.models.dependency.UNKNOWN'),
};

export const DEPENDENCY_LEVEL_EMOJI = {
  [DependencyLevel.LOW]: t('technical.models.dependency.LOW'),
  [DependencyLevel.MODERATE]: t('technical.models.dependency.MODERATE'),
  [DependencyLevel.HIGH]: t('technical.models.dependency.HIGH'),
  [DependencyLevel.VERY_HIGH]: t('technical.models.dependency.VERY_HIGH'),
  [DependencyLevel.UNKNOWN]: t('technical.models.dependency.UNKNOWN'),
};

export const DEPENDENCY_LEVEL_EXPLANATION = t('technical.models.dependency.explanation');

export default DependencyLevel;
