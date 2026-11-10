import { useState, useMemo } from 'react';
import { TABS } from '../constants/tabs';
import { hasCompletedOnboarding } from '../utils/onboardingStorage';
import { computeFilteredApps } from '../utils/appListing';
import { useUserSelections } from './useUserSelections';
import { useCatalogApps } from './useCatalogApps';
import { useAwardsApps, useMyAppsData, useAppSearch } from './useRemoteAppLists';

/**
 * État des applications : onglet actif, recherche, choix de l'utilisateur
 * (sauvegardés en local), listes chargées depuis l'API, et liste affichée.
 *
 * Assemble useUserSelections, useCatalogApps, useAwardsApps, useMyAppsData
 * et useAppSearch ; la liste affichée est calculée par computeFilteredApps
 * (utils/appListing.js).
 *
 * @param {Function} saveUserData voir useAuth
 * @param {Function} getUserData voir useAuth
 * @param {string} selectedCategory catégorie du catalogue (« Toutes » par défaut)
 * @param {boolean} needsMyAppsData un écran hors onglet a besoin des données de « Mes Apps »
 */
export const useAppManagement = (saveUserData, getUserData, selectedCategory = 'Toutes', needsMyAppsData = false) => {
  // Après l'onboarding, la réouverture de l'app tombe directement sur « Mes Apps »
  const [activeTab, setActiveTab] = useState(
    () => (hasCompletedOnboarding() ? TABS.MY_APPS : TABS.APPLICATIONS)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const selections = useUserSelections(saveUserData, getUserData);
  const { myApps } = selections;

  const catalog = useCatalogApps({ activeTab, selectedCategory });
  const { awardsApps, isLoadingAwards } = useAwardsApps(activeTab);
  const { myAppsData, isLoadingMyApps } = useMyAppsData({
    activeTab,
    myApps,
    needsMyAppsData,
    onMissingApps: selections.forgetApps,
  });
  const { searchResults, isSearching } = useAppSearch(searchTerm);

  const filteredApps = useMemo(() => computeFilteredApps({
    activeTab,
    searchTerm,
    selectedCategory,
    catalogApps: catalog.apps,
    searchResults,
    awardsApps,
    myApps,
    myAppsData,
    isLoadingMyApps,
  }), [activeTab, myApps, searchTerm, searchResults, catalog.apps, awardsApps, myAppsData, isLoadingMyApps, selectedCategory]);

  return {
    // État
    activeTab,
    searchTerm,
    myApps,
    favoriteApps: selections.favoriteApps,
    migratedApps: selections.migratedApps,
    customMigrations: selections.customMigrations,
    selectedApp,
    apps: catalog.apps,
    isLoadingApps: catalog.isLoadingApps,
    isInitialLoading: catalog.isInitialLoading,
    isInitialized: selections.isInitialized,
    isSearching,
    isLoadingAwards,
    isLoadingMyApps,
    myAppsData,
    filteredApps,
    pagination: catalog.pagination,

    // Actions
    setActiveTab,
    setSearchTerm,
    toggleMyApp: selections.toggleMyApp,
    toggleFavorite: selections.toggleFavorite,
    addMyApps: selections.addMyApps,
    removeMyApps: selections.removeMyApps,
    clearMyApps: selections.clearMyApps,
    clearMigrations: selections.clearMigrations,
    toggleMigrate: selections.toggleMigrate,
    setCustomMigration: selections.setCustomMigration,
    importMigrations: selections.importMigrations,
    setSelectedApp,
    loadMoreApps: catalog.loadMoreApps,
  };
};
