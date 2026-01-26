import React from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { TABS } from './constants/tabs';

// Layout
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';

// UI Components
import SearchBar from './components/ui/SearchBar';
import ExplainerPanel from './components/ExplainerPanel';
import AppsList from './components/AppsList';
import ShareButton from './components/ShareButton';

// Modals
import AppDetailModal from './components/modals/AppDetailModal';
import ShareModal from './components/modals/ShareModal';
import TrustiShareModal from './components/modals/TrustiShareModal';
import MigrationSelectorModal from './components/modals/MigrationSelectorModal';

/**
 * Composant principal de l'application TrustiScore
 */
const App = () => {
  // Gestion de l'état des applications
  const {
    activeTab,
    searchTerm,
    myApps,
    migratedApps,
    customMigrations,
    selectedApp,
    filteredApps,
    isLoadingTopApps,
    lastUpdate,
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleMigrate,
    setCustomMigration,
    setSelectedApp,
  } = useAppManagement();

  // Gestion des modales
  const {
    showExplainer,
    setShowExplainer,
    showShareModal,
    setShowShareModal,
    showTrustiShareModal,
    setShowTrustiShareModal,
    showMigrationSelector,
    setShowMigrationSelector,
  } = useModals();

  // Affichage du détail d'une application
  if (selectedApp) {
    return (
      <AppDetailModal
        app={selectedApp}
        isInMyApps={myApps.has(selectedApp.id)}
        onToggleMyApp={toggleMyApp}
        onClose={() => setSelectedApp(null)}
      />
    );
  }

  // Vue principale
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <Header 
        showExplainer={showExplainer} 
        onToggleExplainer={() => setShowExplainer(!showExplainer)} 
      />

      <main className="max-w-md mx-auto p-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Titre pour l'onglet Classement */}
        {activeTab === TABS.TOP && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Classement France
              </p>
              {isLoadingTopApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Applications les plus téléchargées en France
            </p>
            {lastUpdate && (
              <p className="text-[10px] text-slate-300 mt-1">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}

        {/* Bouton Partager pour App Trusti */}
        {activeTab === TABS.ALTERNATIVES && (
          <ShareButton
            title="Partager mes TrustiApp"
            description={`${filteredApps.filter(a => myApps.has(a.id)).length} app${filteredApps.filter(a => myApps.has(a.id)).length > 1 ? 's' : ''}`}
            onShare={() => setShowTrustiShareModal(true)}
            disabled={filteredApps.filter(a => myApps.has(a.id)).length === 0}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
            textColor="text-emerald-900"
            subtextColor="text-emerald-700"
            buttonColor="bg-emerald-600 hover:bg-emerald-700"
          />
        )}

        {/* Bouton Partager pour Mes Apps */}
        {activeTab === TABS.MY_APPS && myApps.size > 0 && (
          <ShareButton
            title="Partager ma migration"
            description={`${myApps.size} app${myApps.size > 1 ? 's' : ''} (${migratedApps.size} migré${migratedApps.size > 1 ? 's' : ''})`}
            onShare={() => setShowShareModal(true)}
          />
        )}

        {/* Panneau explicatif */}
        {showExplainer && (
          <ExplainerPanel onClose={() => setShowExplainer(false)} />
        )}

        {/* Liste des applications */}
        <AppsList
          apps={filteredApps}
          activeTab={activeTab}
          myApps={myApps}
          migratedApps={migratedApps}
          customMigrations={customMigrations}
          onToggleMyApp={toggleMyApp}
          onToggleMigrate={toggleMigrate}
          onSelectApp={setSelectedApp}
          onSelectMigration={setShowMigrationSelector}
        />
      </main>

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myAppsCount={myApps.size}
      />

      {/* Modal de partage des migrations */}
      {showShareModal && (
        <ShareModal
          migratedApps={migratedApps}
          customMigrations={customMigrations}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de partage des TrustiApp */}
      {showTrustiShareModal && (
        <TrustiShareModal
          selectedApps={filteredApps.filter(a => myApps.has(a.id))}
          onClose={() => setShowTrustiShareModal(false)}
        />
      )}

      {/* Modal de sélection de migration */}
      {showMigrationSelector && (
        <MigrationSelectorModal
          currentAppId={showMigrationSelector}
          currentSelection={customMigrations.get(showMigrationSelector)}
          onSelect={(altName) => setCustomMigration(showMigrationSelector, altName)}
          onClose={() => setShowMigrationSelector(null)}
        />
      )}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;