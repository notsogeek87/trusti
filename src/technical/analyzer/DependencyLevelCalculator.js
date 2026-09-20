import { DependencyLevel } from '../model/DependencyLevel.js';

/**
 * Calcule le niveau de dépendance technique — un indicateur SÉPARÉ du
 * Trusti-Score, purement descriptif (voir spec §9). Basé uniquement sur des
 * critères explicables et reproductibles :
 *
 *   score = (nb dépendances Google)
 *         + (nb trackers) × 2        — pondérés davantage : impact confidentialité
 *         + (nb autres SDK détectés) — SDK "SdkAnalyzer" qui ne sont ni Google ni tracker
 *
 *   score = 0        → LOW
 *   score 1-3         → MODERATE
 *   score 4-7         → HIGH
 *   score ≥ 8         → VERY_HIGH
 *
 * Si les composants du manifeste n'ont pas pu être lus (componentsAvailable
 * === false), le résultat est UNKNOWN plutôt qu'une valeur inventée — voir
 * spec §18.
 *
 * @param {{googleDependencies: Array, trackers: Array, sdks: Array, componentsAvailable: boolean}} params
 * @returns {{level: string, score: number|null, breakdown: {google: number, trackers: number, otherSdks: number}}}
 */
export function calculateDependencyLevel({ googleDependencies, trackers, sdks, componentsAvailable }) {
  if (!componentsAvailable) {
    return { level: DependencyLevel.UNKNOWN, score: null, breakdown: { google: 0, trackers: 0, otherSdks: 0 } };
  }

  const googleIds = new Set(googleDependencies.map((e) => e.id));
  const trackerIds = new Set(trackers.map((e) => e.id));
  const otherSdks = sdks.filter((e) => !googleIds.has(e.id) && !trackerIds.has(e.id));

  const breakdown = {
    google: googleDependencies.length,
    trackers: trackers.length,
    otherSdks: otherSdks.length,
  };
  const score = breakdown.google + breakdown.trackers * 2 + breakdown.otherSdks;

  let level;
  if (score === 0) level = DependencyLevel.LOW;
  else if (score <= 3) level = DependencyLevel.MODERATE;
  else if (score <= 7) level = DependencyLevel.HIGH;
  else level = DependencyLevel.VERY_HIGH;

  return { level, score, breakdown };
}

export default calculateDependencyLevel;
