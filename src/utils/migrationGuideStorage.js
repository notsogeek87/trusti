/**
 * Progression du parcours « Migration guidée », par app remplacée.
 * Stockée uniquement en localStorage (clé "trusti_migration_guides", préfixe
 * commun voir storageStats.js) — jamais envoyée au serveur.
 * Forme : { [appId]: { altId?: string, done: { [stepId]: true }, updatedAt?: number } }
 * updatedAt (ms) : dernier progrès, pour la relance d'un parcours resté en plan
 * (voir src/utils/notificationInbox.js).
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
    all[String(appId)] = { altId: state.altId || undefined, done: state.done || {}, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage indisponible (navigation privée stricte) : progression perdue.
  }
};

/** Toutes les progressions enregistrées : { [appId]: { altId, done } }. */
export const getAllMigrationGuideStates = () => {
  const all = readAll();
  return Object.fromEntries(Object.keys(all).map(id => [id, getMigrationGuideState(id)]));
};

/** Date du dernier progrès de chaque parcours : { [appId]: ms } (absente pour les anciens parcours). */
export const getMigrationGuideTimestamps = () => {
  const all = readAll();
  return Object.fromEntries(
    Object.entries(all)
      .map(([id, entry]) => [id, Number(entry?.updatedAt) || null])
      .filter(([, at]) => at),
  );
};

/**
 * Abandonne le parcours d'une app : sa progression est effacée (elle disparaît
 * de la carte « Migrations en cours »). Renvoie l'état effacé, pour pouvoir
 * l'annuler avec saveMigrationGuideState.
 */
export const removeMigrationGuideState = (appId) => {
  const previous = getMigrationGuideState(appId);
  try {
    const all = readAll();
    delete all[String(appId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage indisponible : rien à effacer.
  }
  return previous;
};
