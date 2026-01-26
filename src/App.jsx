import React from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
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
import LoginModal from './components/modals/LoginModal';

/**
 * Composant principal de l'application TrustiScore
 */
const App = () => {
  // Gestion de l'authentification
  const {
    currentUser,
    isLoading: isAuthLoading,
    login,
    logout,
    getUserData,
    saveUserData,
    resetUserData
  } = useAuth();

  // Gestion de l'état des applications (avec sauvegarde utilisateur)
  const {
    activeTab,
    searchTerm,
    myApps,
    migratedApps,
    customMigrations,
    selectedApp,
    filteredApps,
    topApps,
    trustiApps,
    isLoadingTopApps,
    isLoadingTrustiApps,
    isInitialLoading,
    lastUpdate,
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleMigrate,
    setCustomMigration,
    setSelectedApp,
  } = useAppManagement(currentUser, saveUserData, getUserData);

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
    showLoginModal,
    setShowLoginModal,
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
      {/* Écran de chargement initial */}
      {isInitialLoading && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/assets/logo.png" 
                alt="TrustiScore Logo" 
                className="w-48 mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">TrustiScore</h2>
            <p className="text-slate-500 mb-6">Chargement des applications...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          </div>
        </div>
      )}
      
      <Header 
        showExplainer={showExplainer} 
        onToggleExplainer={() => setShowExplainer(!showExplainer)}
        currentUser={currentUser}
        onLogout={logout}
        onLogin={() => setShowLoginModal(true)}
        onResetUserData={resetUserData}
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

        {/* Bouton Partager pour TrustiApps */}
        {activeTab === TABS.ALTERNATIVES && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                TrustiApps - F-Droid
              </p>
              {isLoadingTrustiApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Apps open source respectueuses de la vie privée
            </p>
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
          </div>
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
          topApps={[...topApps, ...trustiApps]}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de partage des TrustiApp */}
      {showTrustiShareModal && (
        <TrustiShareModal
          selectedApps={filteredApps.filter(a => myApps.has(a.id))}
          topApps={[...topApps, ...trustiApps]}
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
          allApps={trustiApps}
        />
      )}

      {/* Modal de connexion */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
      />

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