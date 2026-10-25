// Suggestions d'alternatives par notification (Android natif) : choix des apps
// de « Mes Apps » qui méritent une notification « X est noté D, Y (A) fait la
// même chose ». Logique pure (testée dans tests/technical/alternativeNudges.test.js) ;
// la programmation et l'envoi sont faits côté natif (AlternativeNudgesPlugin +
// AlternativeNudgeWorker), qui choisit la première candidate encore installée
// et non proposée récemment.
import { extractPackageId } from './androidPackage.js';
import { GRADE_PRIORITY, isStrictlyBetterGrade } from './alternatives.js';

// Notes pour lesquelles on suggère de changer d'app (C inclus : une alternative
// A ou B vaut encore le coup), à condition que l'alternative soit mieux notée.
export const NUDGE_APP_GRADES = ['C', 'D', 'E'];

const ENABLED_KEY = 'trusti_alt_nudges_enabled';
const PERMISSION_ASKED_KEY = 'trusti_alt_nudges_permission_asked';

/**
 * @param {Array<object>} myAppsList apps de « Mes Apps » enrichies par
 *   useAppManagement (alternative, altGrade, alternativeAdopted, playStoreUrl)
 * @param {{ migratedApps?: Set<string>, customMigrations?: Map<string, string> }} [options]
 * @returns {Array<{appId: string, appName: string, appGrade: string, altName: string, altGrade: string, packageName: string}>}
 *   triées de la plus urgente (pire note, plus grand écart) à la moins urgente
 */
export function buildNudgeCandidates(myAppsList, { migratedApps, customMigrations } = {}) {
  return (myAppsList || [])
    .filter(app =>
      app
      && !app.isLoadingSkeleton
      && NUDGE_APP_GRADES.includes(app.grade)
      && app.alternative
      && !app.alternativeAdopted
      && isStrictlyBetterGrade(app.altGrade, app.grade)
      && !migratedApps?.has(app.id)
      && !customMigrations?.get(app.id)
    )
    .map(app => ({
      appId: String(app.id),
      appName: app.name,
      appGrade: app.grade,
      altName: app.alternative,
      altGrade: app.altGrade,
      packageName: extractPackageId(app.playStoreUrl),
    }))
    .filter(candidate => candidate.packageName)
    .sort((a, b) => {
      const gradeDiff = GRADE_PRIORITY[b.appGrade] - GRADE_PRIORITY[a.appGrade];
      if (gradeDiff !== 0) return gradeDiff;
      const gapA = GRADE_PRIORITY[a.appGrade] - GRADE_PRIORITY[a.altGrade];
      const gapB = GRADE_PRIORITY[b.appGrade] - GRADE_PRIORITY[b.altGrade];
      if (gapA !== gapB) return gapB - gapA;
      return a.appName.localeCompare(b.appName);
    });
}

// true tant que la liste « Mes Apps » n'est pas complètement chargée : on ne
// synchronise pas une liste partielle (elle effacerait des candidates valides).
export function isMyAppsListSettled(myAppsList) {
  return (myAppsList || []).every(app => !app.isLoadingSkeleton && !app.isLoadingAlternative);
}

// Réglage « Suggestions d'alternatives » (actif par défaut)
export const areNudgesEnabled = () => {
  try {
    return localStorage.getItem(ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
};

export const setNudgesEnabled = (enabled) => {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // localStorage indisponible : le réglage reste valable pour la session.
  }
};

// La permission Android 13+ n'est demandée automatiquement qu'une seule fois ;
// ensuite, seulement depuis le réglage (page Espace de stockage).
export const wasNudgePermissionAsked = () => {
  try {
    return localStorage.getItem(PERMISSION_ASKED_KEY) === 'true';
  } catch {
    return true;
  }
};

export const markNudgePermissionAsked = () => {
  try {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
  } catch {
    // tant pis : on redemandera au prochain lancement.
  }
};
