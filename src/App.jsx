import React, { useState, useEffect } from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/tabs';
import { Sparkles } from 'lucide-react';

// Layout
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';

// UI Components
import SearchBar from './components/ui/SearchBar';
import ExplainerPanel from './components/ExplainerPanel';
import AppsList from './components/AppsList';
import ShareButton from './components/ShareButton';
import LandingPage from './components/LandingPage';
import VerifyAuth from './components/VerifyAuth';
import TrustiChatWidget from './components/TrustiChatWidget';

// Modals
import AppDetailModal from './components/modals/AppDetailModal';
import ShareModal from './components/modals/ShareModal';
import TrustiShareModal from './components/modals/TrustiShareModal';
import MigrationSelectorModal from './components/modals/MigrationSelectorModal';
import LoginModal from './components/modals/LoginModal';
import AdminAppsModal from './components/modals/AdminAppsModal';
import PinModal from './components/modals/PinModal';

/**
 * Composant principal de l'application TrustiScore
 */
const App = () => {
  // Vérifier si on est en mode vérification de token
  const urlParams = new URLSearchParams(window.location.search);
  const isVerifying = urlParams.has('token');
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

  // État pour la landing page
  // La landing page s'affiche UNIQUEMENT quand l'utilisateur n'est pas connecté
  const [showLandingPage, setShowLandingPage] = useState(false);

  // Mettre à jour la landing page quand l'état de connexion change
  useEffect(() => {
    // Afficher la landing page seulement si non connecté
    setShowLandingPage(!currentUser);
  }, [currentUser]);

  const handleCloseLandingPage = () => {
    setShowLandingPage(false);
  };

  // Gestion de l'état des applications (avec sauvegarde utilisateur)
  const {
    activeTab,
    searchTerm,
    myApps,
    migratedApps,
    customMigrations,
    selectedApp,
    filteredApps,
    trustiApps,
    starApps,
    isLoadingTrustiApps,
    isLoadingStarApps,
    isInitialLoading,
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

  // Modal admin
  const [showAdminModal, setShowAdminModal] = useState(false);

  // État de déverrouillage admin (code PIN)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Charger l'état de déverrouillage admin au changement d'utilisateur
  useEffect(() => {
    if (currentUser && getUserData) {
      const adminUnlocked = getUserData('admin_unlocked');
      setIsAdminUnlocked(!!adminUnlocked);
    } else {
      setIsAdminUnlocked(false);
    }
  }, [currentUser, getUserData]);

  // Gérer le déverrouillage admin
  const handleUnlockAdmin = () => {
    setIsAdminUnlocked(true);
    if (saveUserData) {
      saveUserData('admin_unlocked', true);
    }
  };

  // Afficher la landing page en premier si c'est la première visite
  if (showLandingPage) {
    return <LandingPage onClose={handleCloseLandingPage} />;
  }

  // Affichage du détail d'une application
  if (selectedApp) {
    return (
      <AppDetailModal
        app={selectedApp}
        isInMyApps={myApps.has(selectedApp.id)}
        onToggleMyApp={toggleMyApp}
        onClose={() => setSelectedApp(null)}
        trustiApps={trustiApps}
        starApps={starApps}
      />
    );
  }

  // Vue principale
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Mode vérification de token */}
      {isVerifying && (
        <VerifyAuth onLogin={login} />
      )}

      {/* Interface normale (masquée pendant la vérification) */}
      {!isVerifying && (
        <>
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
        currentUser={currentUser}
        onLogout={logout}
        onLogin={() => setShowLoginModal(true)}
        onResetUserData={resetUserData}
        onOpenAdmin={() => setShowAdminModal(true)}
        onShowLandingPage={() => setShowLandingPage(true)}
        isAdminUnlocked={isAdminUnlocked}
        onRequestAdminUnlock={() => setShowPinModal(true)}
      />

      <main className="max-w-md mx-auto p-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Titre pour l'onglet Sélection */}
        {activeTab === TABS.SELECTION && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Remplacez les applications les plus utilisées
              </p>
              {isLoadingStarApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {starApps.length} app{starApps.length > 1 ? 's' : ''} sélectionnée{starApps.length > 1 ? 's' : ''} par l'équipe
            </p>
            {/* Message incitatif */}
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 border border-purple-100">
              <p className="text-xs text-purple-700 font-bold flex items-center justify-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Clique sur une app pour voir ses alternatives !
                <Sparkles size={14} className="animate-pulse" />
              </p>
            </div>
          </div>
        )}

        {/* En-tête pour Alternatives */}
        {activeTab === TABS.ALTERNATIVES && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Alternatives
              </p>
              {isLoadingTrustiApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Apps européennes et même parfois open source !
            </p>
          </div>
        )}

        {/* Boutons Partager pour Mes Apps */}
        {activeTab === TABS.MY_APPS && myApps.size > 0 && (
          <div className="space-y-3">
            <ShareButton
              title="Partager ma migration"
              description={`${myApps.size} app${myApps.size > 1 ? 's' : ''} (${migratedApps.size} migré${migratedApps.size > 1 ? 's' : ''})`}
              onShare={() => setShowShareModal(true)}
            />
            <ShareButton
              title="Partager mes TrustiApp"
              description={`${Array.from(myApps).filter(id => {
                const allApps = [...trustiApps, ...starApps];
                const app = allApps.find(a => a.id === id);
                return app && (app.grade === 'A' || app.grade === 'B' || app.grade === 'C');
              }).length} app${Array.from(myApps).filter(id => {
                const allApps = [...trustiApps, ...starApps];
                const app = allApps.find(a => a.id === id);
                return app && (app.grade === 'A' || app.grade === 'B' || app.grade === 'C');
              }).length > 1 ? 's' : ''}`}
              onShare={() => setShowTrustiShareModal(true)}
              disabled={Array.from(myApps).filter(id => {
                const allApps = [...trustiApps, ...starApps];
                const app = allApps.find(a => a.id === id);
                return app && (app.grade === 'A' || app.grade === 'B' || app.grade === 'C');
              }).length === 0}
              bgColor="bg-emerald-50"
              borderColor="border-emerald-200"
              textColor="text-emerald-900"
              subtextColor="text-emerald-700"
              buttonColor="bg-emerald-600 hover:bg-emerald-700"
            />
          </div>
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
      />

      {/* Modal de code PIN admin */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleUnlockAdmin}
      />

      {/* Modal d'administration Apps (TrustiApps et StarApps) */}
      {showAdminModal && (
        <AdminAppsModal
          onClose={() => {
            setShowAdminModal(false);
            // Forcer le rechargement pour que tout le monde voit les changements
            window.location.reload();
          }}
        />
      )}

      {/* Fermeture du fragment pour l'interface normale */}
      </>
      )}

      {/* Widget de chat Trusti (visible partout sauf pendant la vérification du token) */}
      {!isVerifying && <TrustiChatWidget />}

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