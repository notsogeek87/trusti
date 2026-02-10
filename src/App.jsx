import React, { useState, useEffect } from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/tabs';
import { APPS_DATA } from './constants/appsData';
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
import OnboardingApps from './components/OnboardingApps';

// Modals
import AppDetailModal from './components/modals/AppDetailModal';
import ShareModal from './components/modals/ShareModal';
import TrustiShareModal from './components/modals/TrustiShareModal';
import MigrationSelectorModal from './components/modals/MigrationSelectorModal';
import LoginModal from './components/modals/LoginModal';
import AdminAppsModal from './components/modals/AdminAppsModal';
import PinModal from './components/modals/PinModal';
import WelcomeModal from './components/modals/WelcomeModal';

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
  // La landing page ne s'affiche plus automatiquement, seulement sur demande
  const [showLandingPage, setShowLandingPage] = useState(false);

  const handleCloseLandingPage = () => {
    setShowLandingPage(false);
  };

  const handleOpenLandingPage = () => {
    setShowLandingPage(true);
  };

  // État pour le modal de bienvenue (première visite)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // État pour la page d'onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Vérifier si c'est la première visite au chargement
  useEffect(() => {
    const hasVisited = localStorage.getItem('trusti_has_visited');
    if (!hasVisited && !isVerifying) {
      setShowWelcomeModal(true);
    }
  }, [isVerifying]);

  // Handler pour "Oui, c'est ma première fois"
  const handleFirstTimeYes = () => {
    localStorage.setItem('trusti_has_visited', 'true');
    setShowWelcomeModal(false);
    // Afficher la page d'onboarding de sélection des apps
    setShowOnboarding(true);
  };

  // Handler pour "Non, je connais déjà"
  const handleFirstTimeNo = () => {
    localStorage.setItem('trusti_has_visited', 'true');
    setShowWelcomeModal(false);
  };

  // Handler pour la fin de l'onboarding
  const handleOnboardingComplete = (selectedAppIds) => {
    // Ajouter toutes les apps sélectionnées à "Mes Apps"
    const fakeEvent = { stopPropagation: () => {} };
    selectedAppIds.forEach(appId => {
      toggleMyApp(fakeEvent, appId);
    });
    
    // Fermer l'onboarding
    setShowOnboarding(false);
    
    // Rediriger vers l'onglet "Mes Apps"
    setActiveTab(TABS.MY_APPS);
    
    // Scroller en haut de la page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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

  // Scroller en haut lors du changement d'onglet
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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

  // Afficher la page d'onboarding de sélection des apps
  if (showOnboarding) {
    // Combiner toutes les apps disponibles (sans doublons par nom)
    const allAppsByName = new Map();
    
    // Ajouter APPS_DATA
    APPS_DATA.forEach(app => {
      const key = app.name.toLowerCase().trim();
      if (!allAppsByName.has(key)) {
        allAppsByName.set(key, app);
      }
    });
    
    // Ajouter starApps (peuvent écraser APPS_DATA si même nom)
    starApps.forEach(app => {
      const key = app.name.toLowerCase().trim();
      allAppsByName.set(key, app); // Écrase toujours si même nom
    });
    
    // Ajouter trustiApps (peuvent écraser si même nom)
    trustiApps.forEach(app => {
      const key = app.name.toLowerCase().trim();
      allAppsByName.set(key, app); // Écrase toujours si même nom
    });
    
    const allApps = Array.from(allAppsByName.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    return (
      <OnboardingApps 
        allApps={allApps}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Affichage du détail d'une application
  if (selectedApp) {
    return (
      <AppDetailModal
        app={selectedApp}
        isInMyApps={myApps.has(selectedApp.id)}
        onToggleMyApp={toggleMyApp}
        onClose={() => setSelectedApp(null)}
        onSelectApp={setSelectedApp}
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
      {showMigrationSelector && !selectedApp && (
        <MigrationSelectorModal
          currentAppId={showMigrationSelector}
          currentSelection={customMigrations.get(showMigrationSelector)}
          onSelect={(altName) => setCustomMigration(showMigrationSelector, altName)}
          onClose={() => setShowMigrationSelector(null)}
          onSelectApp={(app) => {
            setShowMigrationSelector(null);
            setSelectedApp(app);
          }}
          allApps={[...trustiApps, ...starApps]}
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

      {/* Modal de bienvenue (première visite) */}
      {showWelcomeModal && (
        <WelcomeModal
          onFirstTimeYes={handleFirstTimeYes}
          onFirstTimeNo={handleFirstTimeNo}
        />
      )}

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

      {/* Widget de chat Trusti (visible partout sauf pendant la vérification du token, la page de bienvenue et l'onboarding) */}
      {!isVerifying && !showWelcomeModal && !showOnboarding && <TrustiChatWidget onOpenLandingPage={handleOpenLandingPage} />}

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