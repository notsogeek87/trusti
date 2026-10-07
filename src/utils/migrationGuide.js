import { MIGRATION_STEPS, DATA_TIPS, DEFAULT_DATA_TIPS } from '../constants/migrationGuide.js';
import { pickBestAlternative, isStrictlyBetterGrade } from './alternatives.js';

/**
 * Logique pure du parcours « Migration guidée » (sans React ni stockage).
 */

/** Conseils d'export/import pour une catégorie d'app (conseils génériques sinon). */
export function getDataTips(category) {
  const cat = String(category || '').toLowerCase();
  const found = cat && DATA_TIPS.find(t => t.match.some(m => cat.includes(m)));
  return found ? { export: found.export, import: found.import } : DEFAULT_DATA_TIPS;
}

/**
 * Alternatives proposables pour `app` : celles de meilleur grade, la plus
 * recommandée en premier (même règle que « Mes Apps », voir alternatives.js).
 */
export function getMigrationCandidates(app, alternatives = []) {
  if (!app) return [];
  const better = alternatives.filter(a => isStrictlyBetterGrade(a.grade, app.grade));
  const best = pickBestAlternative(better);
  return best ? [best, ...better.filter(a => a !== best)] : [];
}

/** Le parcours n'a de sens que pour une app notée C, D ou E avec une meilleure alternative. */
export function canStartMigration(app, alternatives = []) {
  return Boolean(app) && !['A', 'B'].includes(app.grade) && getMigrationCandidates(app, alternatives).length > 0;
}

/** Nombre d'étapes cochées / total, et indice de la première étape à faire. */
export function computeProgress(done = {}) {
  const total = MIGRATION_STEPS.length;
  const completed = MIGRATION_STEPS.filter(s => done[s.id]).length;
  const nextIndex = MIGRATION_STEPS.findIndex(s => !done[s.id]);
  return { completed, total, nextIndex: nextIndex === -1 ? total - 1 : nextIndex, isComplete: completed === total };
}
