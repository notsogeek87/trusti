import { useState, useEffect, useMemo } from 'react';
import { TABS } from '../constants/tabs';
import { getMyAppsSortPref, setMyAppsSortPref, sortMyApps } from '../utils/myAppsSort';
import { countMigrations, countAlternatives, resolveAlternativeFilter, filterMyApps } from '../utils/myAppsFilters';
import { DEFAULT_MIGRATION_FILTER, DEFAULT_ALTERNATIVE_FILTER } from '../components/MyAppsFilterMenu';

const EMPTY_MIGRATION_COUNTS = { migrated: 0, todo: 0 };
const EMPTY_ALTERNATIVE_COUNTS = { with: 0, without: 0 };

/**
 * Tri et filtres de l'onglet « Mes Apps ».
 *
 * - `myAppsSorted` : toutes les apps suivies, triées selon le réglage (sert
 *   aussi au partage, qui doit refléter l'ordre affiché).
 * - `myAppsDisplayed` : la même liste après les filtres migrée / à migrer et
 *   avec / sans alternative (hors « Mes Apps », la liste reçue telle quelle).
 */
export const useMyAppsView = ({ activeTab, filteredApps, myApps, customMigrations }) => {
  const isMyAppsTab = activeTab === TABS.MY_APPS;

  // TrustiScore décroissant par défaut, persisté en local
  const [mySort, setMySort] = useState(() => getMyAppsSortPref());
  useEffect(() => {
    setMyAppsSortPref(mySort);
  }, [mySort]);

  const [migrationFilter, setMigrationFilter] = useState(DEFAULT_MIGRATION_FILTER);
  // Par défaut on masque les apps sans alternative connue (rien à proposer
  // pour elles), pour que la liste reste actionnable.
  const [alternativeFilter, setAlternativeFilter] = useState(DEFAULT_ALTERNATIVE_FILTER);

  // Compteurs calculés sur la liste non filtrée par ces critères
  const migrationCounts = useMemo(
    () => (isMyAppsTab ? countMigrations(filteredApps) : EMPTY_MIGRATION_COUNTS),
    [isMyAppsTab, filteredApps]
  );
  const alternativeCounts = useMemo(
    () => (isMyAppsTab ? countAlternatives(filteredApps, customMigrations) : EMPTY_ALTERNATIVE_COUNTS),
    [isMyAppsTab, filteredApps, customMigrations]
  );

  // Ordre d'ajout (le Set préserve l'ordre d'insertion), pour le tri « Date d'ajout »
  const myAppsOrder = useMemo(
    () => new Map(Array.from(myApps).map((id, index) => [String(id), index])),
    [myApps]
  );

  const myAppsSorted = useMemo(() => {
    const relevant = filteredApps.filter(app => myApps.has(app.id));
    return sortMyApps(relevant, mySort, myAppsOrder);
  }, [filteredApps, myApps, mySort, myAppsOrder]);

  const effectiveAlternativeFilter = resolveAlternativeFilter(alternativeFilter, alternativeCounts);

  const myAppsDisplayed = useMemo(() => {
    if (!isMyAppsTab) return filteredApps;
    return filterMyApps(myAppsSorted, {
      migrationFilter,
      alternativeFilter: effectiveAlternativeFilter,
      customMigrations,
    });
  }, [isMyAppsTab, filteredApps, myAppsSorted, migrationFilter, effectiveAlternativeFilter, customMigrations]);

  const resetFilters = () => {
    setMigrationFilter('all');
    setAlternativeFilter('all');
  };

  return {
    mySort,
    setMySort,
    migrationFilter,
    setMigrationFilter,
    alternativeFilter,
    setAlternativeFilter,
    effectiveAlternativeFilter,
    migrationCounts,
    alternativeCounts,
    myAppsSorted,
    myAppsDisplayed,
    resetFilters,
  };
};
