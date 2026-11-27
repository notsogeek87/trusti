import React, { useEffect, useRef } from 'react';
import AppCard from './AppCard';
import LoadingSpinner from './ui/LoadingSpinner';
import { buildAwardsPodiums } from '../utils/awards';
import { TABS } from '../constants/tabs';
import { categoryLabel, getMainCategory, getPodiumCategory } from '../constants/categories';
import { useIsMobile } from '../contexts/ViewModeContext';
import { t } from '../i18n/index.js';

/**
 * Normalise une catégorie vers sa catégorie principale
 */
const normalizeCategory = getMainCategory;

/**
 * Liste des applications
 */
const AppsList = ({
  apps,
  activeTab,
  myApps,
  migratedApps,
  customMigrations,
  onToggleMyApp,
  onToggleMigrate,
  onSelectApp,
  selectedCategory = 'Toutes',
  profileFilterActive = false,
  isLoadingProfiles = false,
  searchTerm = '',
  pagination = { hasMore: false, isLoadingMore: false, total: 0 },
  onLoadMore,
  isLoadingAwards = false,
  isLoadingMyApps = false,
  catalogSearchApps = [],
  isSearching = false,
  selection = null
}) => {
  const isMobile = useIsMobile();
  const loadMoreSentinelRef = useRef(null);

  // Filtrer par catégorie dans l'onglet APPLICATIONS
  let displayApps = apps;
  if (activeTab === TABS.APPLICATIONS && selectedCategory !== 'Toutes') {
    displayApps = apps.filter(app => {
      const normalizedCat = normalizeCategory(app.category);
      return normalizedCat === selectedCategory;
    });
  }

  // Le « + » ajoute / retire de « Mes Apps », quel que soit l'onglet
  const getToggleProps = (app) => ({ isInMyApps: myApps.has(app.id), onToggleMyApp });

  // Mode sélection (partage d'une liste d'apps par lien)
  const getSelectionProps = (app) => selection?.isSelecting
    ? { isSelecting: true, isSelected: selection.isSelected(app.id), onToggleSelect: selection.onToggle }
    : {};
  
  // Pour l'onglet APPLICATIONS, utiliser la pagination serveur
  // Désactiver la pagination pendant une recherche
  const showPagination = activeTab === TABS.APPLICATIONS && selectedCategory === 'Toutes' && !profileFilterActive && !searchTerm.trim();
  const hasMore = showPagination && pagination.hasMore;
  const isLoadingMore = pagination.isLoadingMore;

  // Chargement automatique au scroll : dès que la sentinelle en bas de liste
  // devient visible, on charge la page suivante (remplace le bouton "Voir plus").
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Pour l'onglet MY_APPS, ne pas bloquer l'affichage pendant le chargement
  // On laisse les AppCard individuelles afficher leur loader
  
  // Pour l'onglet TOP_ALTERNATIVES, grouper par catégorie
  if (activeTab === TABS.TOP_ALTERNATIVES) {
    // Afficher un loader pendant le chargement initial
    if (isLoadingAwards) {
      return <LoadingSpinner message={t('myApps.list.loadingAwards')} size="medium" />;
    }
    
    // Un podium (3 apps A/B max) par catégorie détaillée : regrouper par
    // catégorie principale mettait Email, Messagerie et Visio en concurrence
    // sur un seul podium (la messagerie instantanée disparaissait).
    const podiums = buildAwardsPodiums(apps, getPodiumCategory);

    return (
      <div className="space-y-6">
        {podiums.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8 px-4">{t('myApps.list.noAwards')}</p>
        )}
        {podiums.map(({ category, apps: podiumApps }) => (
          <div key={category}>
            {/* En-tête de catégorie */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl mb-3 shadow-lg">
              <h3 className="font-black text-sm uppercase tracking-wider">{categoryLabel(category)}</h3>
            </div>
            
            {/* Apps de cette catégorie */}
            <div className={isMobile ? 'space-y-3' : 'grid grid-cols-2 xl:grid-cols-3 gap-3'}>
              {podiumApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  activeTab={activeTab}
                  {...getToggleProps(app)}
                  {...getSelectionProps(app)}
                  isMigrated={migratedApps.has(app.id)}
                  customMigration={customMigrations.get(app.id)}
                  onToggleMigrate={onToggleMigrate}
                  onSelectApp={onSelectApp}
                  isLoadingMyApps={isLoadingMyApps}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isMyAppsSearch = activeTab === TABS.MY_APPS && Boolean(searchTerm.trim());

  // Affichage normal pour les autres onglets
  return (
    <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 xl:grid-cols-3 gap-4'}>
      {displayApps.length === 0 && activeTab === TABS.APPLICATIONS && profileFilterActive && isLoadingProfiles && (
        <LoadingSpinner message={t('ui.profiles.loading')} size="medium" />
      )}
      {displayApps.length === 0 && activeTab === TABS.APPLICATIONS && profileFilterActive && !isLoadingProfiles && (
        <div className="text-center py-8 px-4">
          <p className="text-slate-500 text-sm mb-2">{t('ui.profiles.empty')}</p>
          <p className="text-slate-400 text-xs">{t('ui.profiles.emptyHint')}</p>
        </div>
      )}
      {displayApps.length === 0 && activeTab === TABS.APPLICATIONS && selectedCategory !== 'Toutes' && !profileFilterActive && (
        <div className="text-center py-8 px-4">
          <p className="text-slate-500 text-sm mb-2">{t('myApps.list.emptyCategory')}</p>
          <p className="text-slate-400 text-xs">{t('myApps.list.emptyCategoryHint')}</p>
        </div>
      )}
      {displayApps.length === 0 && activeTab === TABS.MY_APPS && !searchTerm.trim() && myApps.size > 0 && isLoadingMyApps && (
        <LoadingSpinner message={t('myApps.list.loadingMyApps')} size="medium" />
      )}
      {displayApps.length === 0 && activeTab === TABS.MY_APPS && !searchTerm.trim() && myApps.size > 0 && !isLoadingMyApps && (
        <div className="text-center py-8 px-4">
          <p className="text-slate-500 text-sm">{t('myApps.list.noFilterMatch')}</p>
        </div>
      )}
      {displayApps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          activeTab={activeTab}
          {...getToggleProps(app)}
          {...getSelectionProps(app)}
          isMigrated={migratedApps.has(app.id)}
          customMigration={customMigrations.get(app.id)}
          onToggleMigrate={onToggleMigrate}
          onSelectApp={onSelectApp}
          isLoadingMyApps={isLoadingMyApps}
        />
      ))}

      {/* Recherche dans « Mes Apps » : les apps du catalogue non suivies
          viennent ensuite, dans leur propre section (le + les ajoute à Mes Apps) */}
      {isMyAppsSearch && displayApps.length === 0 && !isSearching && (
        <p className="col-span-full text-center text-slate-500 text-sm py-4 px-4">
          {t('myApps.list.noSearchMatch', { term: searchTerm.trim() })}
        </p>
      )}
      {isMyAppsSearch && catalogSearchApps.length > 0 && (
        <>
          <div className="col-span-full flex items-center gap-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{t('myApps.list.catalogue')}</h3>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">{catalogSearchApps.length}</span>
          </div>
          {catalogSearchApps.map((app) => (
            <AppCard
              key={`catalog-${app.id}`}
              app={app}
              activeTab={TABS.APPLICATIONS}
              isInMyApps={false}
              onToggleMyApp={onToggleMyApp}
              isMigrated={migratedApps.has(app.id)}
              customMigration={customMigrations.get(app.id)}
              onToggleMigrate={onToggleMigrate}
              onSelectApp={onSelectApp}
            />
          ))}
        </>
      )}
      
      {/* Sentinelle de chargement automatique au scroll pour la pagination serveur */}
      {hasMore && (
        <div ref={loadMoreSentinelRef} className="col-span-full text-center py-6">
          {isLoadingMore && (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('myApps.list.loading')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppsList;
