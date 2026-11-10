// Filtres de l'onglet « Mes Apps » (migrée / à migrer, avec / sans alternative).
// Fonctions pures, sans React, pour pouvoir les tester directement.

/**
 * Une app est considérée migrée si elle est déjà au top (grade A) ou si
 * l'alternative recommandée est déjà utilisée.
 * @param {object} app
 * @returns {boolean}
 */
export const isAppMigrated = (app) => app.grade === 'A' || app.alternativeAdopted === true;

/**
 * Une app a une alternative dès lors qu'elle est déjà au top (grade A, aucune
 * alternative nécessaire), qu'une alternative recommandée existe, qu'une
 * migration personnalisée a été choisie, ou que son alternative est en cours
 * de chargement.
 * @param {object} app
 * @param {Map<string, string>} customMigrations
 * @returns {boolean}
 */
export const appHasAlternative = (app, customMigrations) =>
  app.grade === 'A' || !!app.alternative || !!customMigrations.get(app.id) || !!app.isLoadingAlternative;

const realApps = (apps) => apps.filter(app => !app.isLoadingSkeleton);

/** Compteurs migrées / à migrer (cartes de chargement exclues). */
export const countMigrations = (apps) => {
  const real = realApps(apps);
  const migrated = real.filter(isAppMigrated).length;
  return { migrated, todo: real.length - migrated };
};

/** Compteurs avec / sans alternative (cartes de chargement exclues). */
export const countAlternatives = (apps, customMigrations) => {
  const real = realApps(apps);
  const withAlt = real.filter(app => appHasAlternative(app, customMigrations)).length;
  return { with: withAlt, without: real.length - withAlt };
};

/**
 * Filtre « avec alternative » sans aucune app concernée : on montre tout
 * plutôt qu'une liste vide (cas fréquent juste après l'ajout d'apps sans
 * alternative).
 */
export const resolveAlternativeFilter = (alternativeFilter, alternativeCounts) =>
  alternativeFilter === 'with' && alternativeCounts.with === 0 ? 'all' : alternativeFilter;

/**
 * Applique les filtres migrée / à migrer et avec / sans alternative.
 * Les cartes de chargement sont gardées : le filtre est actif dès l'ouverture.
 * @param {object[]} apps
 * @param {{ migrationFilter: string, alternativeFilter: string, customMigrations: Map<string, string> }} options
 */
export const filterMyApps = (apps, { migrationFilter, alternativeFilter, customMigrations }) => {
  if (migrationFilter === 'all' && alternativeFilter === 'all') return apps;
  return apps.filter(app => {
    if (app.isLoadingSkeleton) return true;
    if (migrationFilter !== 'all' && (migrationFilter === 'migrated') !== isAppMigrated(app)) {
      return false;
    }
    if (alternativeFilter !== 'all' && (alternativeFilter === 'with') !== appHasAlternative(app, customMigrations)) {
      return false;
    }
    return true;
  });
};
