/**
 * Progression du parcours « Migration guidée », par app remplacée.
 * Stockée uniquement en localStorage (clé "trusti_migration_guides", préfixe
 * commun voir storageStats.js) — jamais envoyée au serveur.
 * Forme : { [appId]: { altId?: string, done: { [stepId]: true } } }
 */
const STORAGE_KEY = 'trusti_migration_guides';

const readAll = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getMigrationGuideState = (appId) => {
  const entry = readAll()[String(appId)];
  return {
    altId: entry?.altId ? String(entry.altId) : null,
    done: entry?.done && typeof entry.done === 'object' ? entry.done : {},
  };
};

export const saveMigrationGuideState = (appId, state) => {
  try {
    const all = readAll();
    all[String(appId)] = { altId: state.altId || undefined, done: state.done || {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage indisponible (navigation privée stricte) : progression perdue.
  }
};
