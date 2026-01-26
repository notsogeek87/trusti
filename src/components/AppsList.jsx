import React from 'react';
import AppCard from './AppCard';

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
