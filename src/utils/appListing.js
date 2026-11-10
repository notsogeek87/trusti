// Construction des listes d'apps affichées (catalogue, « Mes Apps », Awards).
// Fonctions pures, sans React, pour pouvoir les tester directement.
import { TABS } from '../constants/tabs.js';
import { pickRecommendedAlternative, isStrictlyBetterGrade } from './alternatives.js';

const GOOD_GRADES = ['A', 'B', 'C'];

// Rang du grade : du meilleur au pire (catalogue) ou du pire au meilleur (« Mes Apps »)
const BEST_FIRST = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const WORST_FIRST = { E: 1, D: 2, C: 3, B: 4, A: 5 };

/**
 * Normalise les IDs d'une app de l'API en chaînes, pour la cohérence des
 * comparaisons (Set, Map, ===).
 * @param {object} app
 */
export const normalizeApp = (app) => ({
  ...app,
  id: String(app.id),
  replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
  replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined,
});

/** Apps d'une réponse de l'API, normalisées (liste vide si l'appel a échoué). */
export const normalizeApiApps = (data) => (data && data.success && Array.isArray(data.apps) ? data.apps.map(normalizeApp) : []);

const byGradeThenName = (order) => (a, b) => {
  const gradeCompare = (order[a.grade] || 999) - (order[b.grade] || 999);
  if (gradeCompare !== 0) return gradeCompare;
  return a.name.localeCompare(b.name);
};

/** Trie en place du meilleur grade au pire, puis par nom. */
export const sortBestGradeFirst = (list) => list.sort(byGradeThenName(BEST_FIRST));

/** Trie en place du pire grade au meilleur, puis par nom (« Mes Apps »). */
export const sortWorstGradeFirst = (list) => list.sort(byGradeThenName(WORST_FIRST));

/**
 * Pour une app à risque, détermine quelle alternative afficher par défaut.
 * Si l'utilisateur a déjà une des alternatives candidates dans « Mes Apps »
 * (même un grade B), on la met en avant comme « déjà migré » plutôt que la
 * meilleure du catalogue qu'il n'utilise pas — mais si une meilleure existe
 * quand même (ex : un A alors qu'il a un B), on la signale séparément
 * (`betterAlternative`) sans pour autant la substituer.
 * @param {object} app
 * @param {object[]} candidatePool apps parmi lesquelles chercher
 * @param {Set<string>} myAppsSet
 * @returns {object|null} champs à fusionner dans l'app, ou null sans alternative
 */
export const buildAlternativeInfo = (app, candidatePool, myAppsSet) => {
  const candidates = candidatePool.filter(replacementApp => {
    if (!GOOD_GRADES.includes(replacementApp.grade)) return false;
    if (replacementApp.replacesAppIds && Array.isArray(replacementApp.replacesAppIds)) {
      return replacementApp.replacesAppIds.includes(app.id);
    }
    return replacementApp.replacesAppId === app.id;
  });
  if (candidates.length === 0) return null;

  const usedAlternative = pickRecommendedAlternative(candidates.filter(c => myAppsSet.has(c.id)));
  // Le « choix de l'équipe » passe avant la mieux notée (voir alternatives.js)
  const bestOverall = pickRecommendedAlternative(candidates);

  if (usedAlternative) {
    const betterAlternative =
      bestOverall.id !== usedAlternative.id && isStrictlyBetterGrade(bestOverall.grade, usedAlternative.grade)
        ? { id: bestOverall.id, name: bestOverall.name, grade: bestOverall.grade }
        : null;
    return {
      alternative: usedAlternative.name,
      altIcon: usedAlternative.icon,
      altGrade: usedAlternative.grade,
      alternativeAdopted: true,
      betterAlternative,
    };
  }

  return {
    alternative: bestOverall.name,
    altIcon: bestOverall.icon,
    altGrade: bestOverall.grade,
    alternativeAdopted: false,
    betterAlternative: null,
  };
};

/** Carte de chargement d'une app de « Mes Apps » pas encore reçue de l'API. */
export const loadingSkeleton = (id) => ({
  id: String(id),
  name: 'Chargement...',
  grade: 'C',
  category: '',
  icon: '⏳',
  reason: '',
  isLoadingSkeleton: true,
});

/**
 * Liste « Mes Apps » hors recherche : une carte par app suivie (carte de
 * chargement tant qu'elle n'est pas reçue), enrichie de son alternative,
 * triée du pire grade au meilleur.
 */
export const buildMyAppsList = ({ myApps, myAppsData, catalogApps, isLoadingMyApps }) => {
  const loaded = new Map(myAppsData.map(app => [String(app.id), app]));
  // Alternatives cherchées parmi « Mes Apps » et le catalogue chargé (sans doublon)
  const pool = [...new Map([...myAppsData, ...catalogApps].map(a => [a.id, a])).values()];
  const poolIds = new Set(pool.map(a => String(a.id)));

  const list = Array.from(myApps).map(id => {
    const app = loaded.get(String(id));
    if (!app) return loadingSkeleton(id);

    const alternativeInfo = buildAlternativeInfo(app, pool, myApps);
    if (alternativeInfo) return { ...app, ...alternativeInfo };

    // Alternatives connues mais pas encore chargées (ou chargement en cours) :
    // on affiche un indicateur plutôt que « aucune alternative »
    if (app.grade !== 'A') {
      const hasUnloadedAlternatives = app.alternativeAppIds &&
        app.alternativeAppIds.length > 0 &&
        app.alternativeAppIds.some(altId => !poolIds.has(String(altId)));
      if (hasUnloadedAlternatives || isLoadingMyApps) {
        return { ...app, isLoadingAlternative: true };
      }
    }
    return app;
  });

  return sortWorstGradeFirst(list);
};

/**
 * Liste affichée selon l'onglet actif et la recherche.
 *
 * - Awards (sans recherche) : apps Awards telles que renvoyées (triées par l'API).
 * - Mes Apps (sans recherche) : voir buildMyAppsList.
 * - Avec recherche : résultats filtrés selon l'onglet.
 * - Catalogue « Toutes » sans recherche : ordre du serveur conservé (le
 *   localeCompare JS peut différer de Postgres sur les accents ou la casse,
 *   et réordonnerait les cartes déjà affichées à chaque page chargée).
 */
export const computeFilteredApps = ({
  activeTab,
  searchTerm,
  selectedCategory,
  catalogApps,
  searchResults,
  awardsApps,
  myApps,
  myAppsData,
  isLoadingMyApps,
}) => {
  const isSearching = Boolean(searchTerm.trim());

  if (activeTab === TABS.TOP_ALTERNATIVES && !isSearching) return awardsApps;

  if (activeTab === TABS.MY_APPS && !isSearching) {
    return buildMyAppsList({ myApps, myAppsData, catalogApps, isLoadingMyApps });
  }

  const sourceApps = isSearching ? searchResults : catalogApps;

  if (activeTab === TABS.APPLICATIONS) {
    const list = [...sourceApps];
    const isServerPaginatedStream = !isSearching && selectedCategory === 'Toutes';
    return isServerPaginatedStream ? list : sortBestGradeFirst(list);
  }

  if (activeTab === TABS.MY_APPS) {
    const list = sourceApps
      .filter(app => myApps.has(app.id))
      .map(app => {
        const alternativeInfo = buildAlternativeInfo(app, catalogApps, myApps);
        return alternativeInfo ? { ...app, ...alternativeInfo } : app;
      });
    return sortWorstGradeFirst(list);
  }

  if (activeTab === TABS.TOP_ALTERNATIVES) {
    const list = sourceApps.filter(app => app.showInAwards === true && ['A', 'B'].includes(app.trustiScore || app.grade));
    return list.sort((a, b) => {
      const categoryCompare = (a.category || '').localeCompare(b.category || '');
      if (categoryCompare !== 0) return categoryCompare;
      return a.name.localeCompare(b.name);
    });
  }

  return [];
};
