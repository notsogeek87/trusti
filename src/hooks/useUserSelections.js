import { useState, useEffect } from 'react';

// Ajoute ou retire un id d'un Set, sans muter l'original
const toggleInSet = (prev, id) => {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const addToSet = (prev, ids) => {
  const next = new Set(prev);
  ids.forEach(id => next.add(String(id)));
  return next;
};

/**
 * Choix de l'utilisateur, sauvegardés en local (voir useAuth) : apps suivies
 * (« Mes Apps »), favoris du catalogue, apps migrées et alternatives choisies.
 */
export const useUserSelections = (saveUserData, getUserData) => {
  const [myApps, setMyApps] = useState(new Set());
  // Favoris du catalogue (« + » sur une app hors Mes Apps) : filtre « À tester »,
  // indépendant de « Mes Apps »
  const [favoriteApps, setFavoriteApps] = useState(new Set());
  const [migratedApps, setMigratedApps] = useState(new Set());
  const [customMigrations, setCustomMigrations] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement des données sauvegardées
  useEffect(() => {
    setIsInitialized(false);

    const userData = getUserData ? getUserData('apps') : null;
    setMyApps(new Set(userData?.myApps || []));
    setFavoriteApps(new Set(userData?.favoriteApps || []));
    setMigratedApps(new Set(userData?.migratedApps || []));
    setCustomMigrations(new Map(userData?.customMigrations || []));

    // Petite temporisation pour s'assurer que les states sont bien définis
    setTimeout(() => setIsInitialized(true), 100);
  }, [getUserData]);

  // Sauvegarde à chaque changement, une fois le chargement terminé. Aussi à la
  // fin du chargement : une app supprimée du catalogue et retirée avant (voir
  // forgetApps) doit disparaître du stockage, pas seulement de l'écran.
  // saveUserData n'est pas en dépendance pour éviter une boucle.
  useEffect(() => {
    if (isInitialized && saveUserData) {
      saveUserData('apps', {
        myApps: Array.from(myApps),
        favoriteApps: Array.from(favoriteApps),
        migratedApps: Array.from(migratedApps),
        customMigrations: Array.from(customMigrations.entries()),
      });
    }
  }, [isInitialized, myApps, favoriteApps, migratedApps, customMigrations]);

  const toggleMyApp = (e, id) => {
    e.stopPropagation();
    setMyApps(prev => toggleInSet(prev, id));
  };

  // Favoris du catalogue : n'affecte jamais « Mes Apps »
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavoriteApps(prev => toggleInSet(prev, id));
  };

  const toggleMigrate = (e, id) => {
    e.stopPropagation();
    setMigratedApps(prev => toggleInSet(prev, id));
  };

  // Ajout de plusieurs apps, toujours additif (jamais de bascule)
  const addMyApps = (ids) => {
    setMyApps(prev => addToSet(prev, ids));
  };

  // Retrait de plusieurs apps (ex : apps confirmées désinstallées par un scan)
  const removeMyApps = (ids) => {
    if (!ids || ids.length === 0) return;
    setMyApps(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(String(id)));
      return next;
    });
  };

  // Apps supprimées du catalogue : retirées de toutes les sélections
  const forgetApps = (ids) => {
    const stale = new Set(ids.map(String));
    const keep = (set) => new Set(Array.from(set).filter(id => !stale.has(String(id))));
    setMyApps(keep);
    setFavoriteApps(keep);
    setMigratedApps(keep);
  };

  // Vide « Mes Apps » et les favoris, sans toucher à l'historique de migrations
  const clearMyApps = () => {
    setMyApps(new Set());
    setFavoriteApps(new Set());
  };

  // Vide l'historique de migrations sans retirer les apps de « Mes Apps »
  const clearMigrations = () => {
    setMigratedApps(new Set());
    setCustomMigrations(new Map());
  };

  const setCustomMigration = (appId, alternativeName) => {
    setCustomMigrations(prev => new Map(prev).set(appId, alternativeName));
  };

  // Import d'un lot de migrations partagées, toujours additif.
  // entries = [{ id, customAlt? }] ; les apps migrées font aussi partie de « Mes Apps ».
  const importMigrations = (entries = []) => {
    if (!entries.length) return;
    const ids = entries.map(({ id }) => String(id));
    setMyApps(prev => addToSet(prev, ids));
    setMigratedApps(prev => addToSet(prev, ids));

    const withCustom = entries.filter(({ customAlt }) => Boolean(customAlt));
    if (withCustom.length) {
      setCustomMigrations(prev => {
        const next = new Map(prev);
        withCustom.forEach(({ id, customAlt }) => next.set(String(id), customAlt));
        return next;
      });
    }
  };

  return {
    myApps,
    favoriteApps,
    migratedApps,
    customMigrations,
    isInitialized,
    toggleMyApp,
    toggleFavorite,
    toggleMigrate,
    addMyApps,
    removeMyApps,
    forgetApps,
    clearMyApps,
    clearMigrations,
    setCustomMigration,
    importMigrations,
  };
};
