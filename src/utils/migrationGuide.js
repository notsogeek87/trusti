import { MIGRATION_STEPS, DATA_TIPS, DEFAULT_DATA_TIPS } from '../constants/migrationGuide.js';
import { APP_EXPORT_GUIDES, APP_IMPORT_GUIDES } from '../constants/appMigrationGuides.js';
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

/**
 * Conseils de l'étape « Transférer vos données ». Guide propre à l'app quittée
 * (`appId`) et à l'alternative (`altId`) quand il existe (constants/appMigrationGuides.js),
 * sinon conseils de la catégorie. Si l'alternative importe directement depuis l'app
 * quittée (`directFrom`), l'export est remplacé par une seule consigne.
 *
 * @returns {{ export: string[], import: string[], exportSource: string|null, importSource: string|null }}
 */
export function getDataTips(category, { appId, altId } = {}) {
  const fallback = getCategoryTips(category);
  const exportGuide = appId != null ? APP_EXPORT_GUIDES[String(appId)] : null;
  const importGuide = altId != null ? APP_IMPORT_GUIDES[String(altId)] : null;
  const direct = importGuide?.directFrom?.includes(String(appId)) && importGuide.directExport;

  return {
    export: direct || exportGuide?.tips || fallback.export,
    import: importGuide?.tips || fallback.import,
    exportSource: direct ? null : exportGuide?.source || null,
    importSource: importGuide?.source || null,
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
