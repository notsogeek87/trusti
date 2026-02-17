import React from 'react';
import AppCard from './AppCard';
import { TABS } from '../constants/tabs';
import { CATEGORY_MAPPING } from '../constants/categories';

/**
 * Normalise une catégorie vers sa catégorie principale
 */
const normalizeCategory = (category) => {
  if (!category) return 'Divers';
  return CATEGORY_MAPPING[category] || 'Divers';
};

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
  onSelectMigration,
  selectedCategory = 'Toutes',
  searchTerm = '',
  pagination = { hasMore: false, isLoadingMore: false, total: 0 },
  onLoadMore
}) => {
  // Filtrer par catégorie dans l'onglet APPLICATIONS
  let displayApps = apps;
  if (activeTab === TABS.APPLICATIONS && selectedCategory !== 'Toutes') {
    displayApps = apps.filter(app => {
      const normalizedCat = normalizeCategory(app.category);
      return normalizedCat === selectedCategory;
    });
  }
  
  // Pour l'onglet APPLICATIONS, utiliser la pagination serveur
  // Désactiver la pagination pendant une recherche
  const showPagination = activeTab === TABS.APPLICATIONS && selectedCategory === 'Toutes' && !searchTerm.trim();
  const hasMore = showPagination && pagination.hasMore;
  const isLoadingMore = pagination.isLoadingMore;

  // Pour l'onglet TOP_ALTERNATIVES, grouper par catégorie
  if (activeTab === TABS.TOP_ALTERNATIVES) {
    // Grouper les apps par catégorie normalisée
    const appsByCategory = apps.reduce((acc, app) => {
      const category = normalizeCategory(app.category);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(app);
      return acc;
    }, {});

    // Trier les catégories alphabétiquement
    const sortedCategories = Object.keys(appsByCategory).sort();

    return (
      <div className="space-y-6">
        {sortedCategories.map((category) => (
          <div key={category}>
            {/* En-tête de catégorie */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl mb-3 shadow-lg">
              <h3 className="font-black text-sm uppercase tracking-wider">{category}</h3>
              <p className="text-xs text-emerald-50 mt-0.5">{appsByCategory[category].length} app{appsByCategory[category].length > 1 ? 's' : ''}</p>
            </div>
            
            {/* Apps de cette catégorie */}
            <div className="space-y-3">
              {appsByCategory[category].map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  activeTab={activeTab}
                  isInMyApps={myApps.has(app.id)}
                  isMigrated={migratedApps.has(app.id)}
                  customMigration={customMigrations.get(app.id)}
                  onToggleMyApp={onToggleMyApp}
                  onToggleMigrate={onToggleMigrate}
                  onSelectApp={onSelectApp}
                  onSelectMigration={onSelectMigration}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Affichage normal pour les autres onglets
  return (
    <div className="space-y-4">
      {displayApps.length === 0 && activeTab === TABS.APPLICATIONS && selectedCategory !== 'Toutes' && (
        <div className="text-center py-8 px-4">
          <p className="text-slate-500 text-sm mb-2">Aucune application dans cette catégorie</p>
          <p className="text-slate-400 text-xs">Essayez une autre catégorie ou utilisez la recherche</p>
        </div>
      )}
      {displayApps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          activeTab={activeTab}
          isInMyApps={myApps.has(app.id)}
          isMigrated={migratedApps.has(app.id)}
          customMigration={customMigrations.get(app.id)}
          onToggleMyApp={onToggleMyApp}
          onToggleMigrate={onToggleMigrate}
          onSelectApp={onSelectApp}
          onSelectMigration={onSelectMigration}
        />
      ))}
      
      {/* Bouton "Voir plus" pour la pagination serveur */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : (
              `Voir plus (${pagination.total - apps.length} restantes)`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AppsList;
