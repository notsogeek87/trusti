import { MIGRATION_STEPS, DATA_TIPS, DEFAULT_DATA_TIPS } from '../constants/migrationGuide.js';
import { pickRecommendedAlternative, isStrictlyBetterGrade } from './alternatives.js';

/**
 * Logique pure du parcours « Migration guidée » (sans React ni stockage).
 */

/** Conseils d'export/import pour une catégorie d'app (conseils génériques sinon). */
function getCategoryTips(category) {
  const cat = String(category || '').toLowerCase();
  const found = cat && DATA_TIPS.find(t => t.match.some(m => cat.includes(m)));
  return found ? { export: found.export, import: found.import } : DEFAULT_DATA_TIPS;
}

const fromTips = (tips) => ({ summary: null, steps: tips, notes: [], source: null });

/**
 * Contenu de l'étape « Transférer vos données », côté app quittée (`export`) et côté
 * alternative (`import`). `guide` vient de la base (useMigrationGuide, voir
 * server/migrationGuides.js) ; un côté sans guide retombe sur les conseils de la catégorie.
 *
 * @param {string} category catégorie de l'app quittée
 * @param {{export: object|null, import: object|null}|null} [guide]
 * @returns {{ export: Section, import: Section, specific: boolean }}
 *   Section = { summary: string|null, steps: string[], notes: string[], source: string|null }
 */
export function getDataTips(category, guide = null) {
  const fallback = getCategoryTips(category);
  return {
    export: guide?.export || fromTips(fallback.export),
    import: guide?.import || fromTips(fallback.import),
    specific: Boolean(guide?.export || guide?.import),
  };
}

/**
 * Alternatives proposables pour `app` : celles de meilleur grade. En premier
 * (et donc présélectionné) : le « choix de l'équipe » s'il en fait partie,
 * sinon la plus recommandée (même règle que « Mes Apps », voir alternatives.js).
 */
export function getMigrationCandidates(app, alternatives = []) {
  if (!app) return [];
  const better = alternatives.filter(a => isStrictlyBetterGrade(a.grade, app.grade));
  const best = pickRecommendedAlternative(better);
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

/**
 * Parcours commencés mais pas terminés, pour les apps encore dans « Mes Apps » et pas
 * encore migrées (carte « Migrations en cours »).
 *
 * @param {Object<string, {altId: string|null, done: object}>} states progressions stockées
 * @param {object[]} myAppsList apps chargées de « Mes Apps »
 * @param {{ migratedApps?: Set<string>, catalogApps?: object[] }} [options]
 * @returns {Array<{app: object, altName: string|null, completed: number, total: number}>}
 *   les plus avancés d'abord
 */
export function getMigrationsInProgress(states, myAppsList, { migratedApps, catalogApps = [] } = {}) {
  const names = new Map([...(catalogApps || []), ...(myAppsList || [])].map(a => [String(a.id), a.name]));
  return (myAppsList || [])
    .filter(app => app && !app.isLoadingSkeleton && !migratedApps?.has(app.id) && !app.alternativeAdopted)
    .map(app => {
      const state = states?.[String(app.id)];
      if (!state) return null;
      const { completed, total, isComplete } = computeProgress(state.done);
      if (completed === 0 || isComplete) return null;
      return { app, altName: state.altId ? names.get(String(state.altId)) || null : null, completed, total };
    })
    .filter(Boolean)
    .sort((a, b) => b.completed - a.completed || a.app.name.localeCompare(b.app.name));
}
