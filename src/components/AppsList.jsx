import React from 'react';
import AppCard from './AppCard';
import { TABS } from '../constants/tabs';

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
  onSelectMigration
}) => {
  // Pour l'onglet TOP_ALTERNATIVES, grouper par catégorie
  if (activeTab === TABS.TOP_ALTERNATIVES) {
    // Grouper les apps par catégorie
    const appsByCategory = apps.reduce((acc, app) => {
      const category = app.category || 'Autre';
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
      {apps.map((app) => (
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
  );
};

export default AppsList;
