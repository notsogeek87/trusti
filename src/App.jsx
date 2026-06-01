import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/tabs';
import { CATEGORIES } from './constants/categories';
import { Sparkles, Smartphone, Monitor } from 'lucide-react';
import { ViewModeContext } from './contexts/ViewModeContext';

// Layout
import Header from './components/layout/Header';

// UI Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import TrustiLogo from './components/ui/TrustiLogo';
import Navigation from './components/layout/Navigation';

// UI Components
import SearchBar from './components/ui/SearchBar';
import ExplainerPanel from './components/ExplainerPanel';
import AppsList from './components/AppsList';
import ShareButton from './components/ShareButton';
import LandingPage from './components/LandingPage';
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

const useIsSmallViewport = () => {
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsSmall(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isSmall;
};

// Fonction pour trier les apps par popularité (utilise le champ popularity de la BDD)
const sortAppsByPopularity = (apps) => {
  return apps.slice().sort((a, b) => {
    const popA = a.popularity || 9999;
    const popB = b.popularity || 9999;
    
    // Trier par popularité (rang le plus bas = plus populaire)
    if (popA !== popB) {
      return popA - popB;
    }
    
    // Si même popularité, tri alphabétique
    return a.name.localeCompare(b.name);
  });
};

/**
 * Composant principal de l'application TrustiScore
 */
const App = () => {
  // Gestion de l'authentification
  const {
    currentUser,
    isLoading: isAuthLoading,
    login,
    logout: authLogout,
    getUserData,
    saveUserData,
    resetUserData: authResetUserData
  } = useAuth();
  
  // Wrapper pour logout qui réinitialise aussi l'état admin
  const logout = () => {
    setIsAdminUnlocked(false);
    authLogout();
  };
  
  // Wrapper pour resetUserData qui réinitialise aussi l'état admin
  const resetUserData = () => {
    setIsAdminUnlocked(false);
    authResetUserData();
  };

  // État pour la landing page
  // La landing page ne s'affiche plus automatiquement, seulement sur demande
  const [showLandingPage, setShowLandingPage] = useState(false);
  const savedScrollY = useRef(0);

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

  // Afficher le modal de bienvenue si l'utilisateur n'est pas connecté
  useEffect(() => {
    setShowWelcomeModal(!currentUser);
  }, [currentUser]);

  // Handler pour "Oui, c'est ma première fois"
  const handleFirstTimeYes = () => {
    setShowWelcomeModal(false);
    // Afficher la page d'onboarding de sélection des apps
    setShowOnboarding(true);
  };

  // Handler pour "Non, je connais déjà"
  const handleFirstTimeNo = () => {
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
    
    // Rediriger vers "Mes Apps" si des apps sélectionnées, sinon vers "Applications"
    if (selectedAppIds && selectedAppIds.size > 0) {
      setActiveTab(TABS.MY_APPS);
    } else {
      setActiveTab(TABS.APPLICATIONS);
    }
    
    // Scroller en haut de la page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // État pour le filtre de catégorie dans l'onglet Applications
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // Gestion de l'état des applications (avec sauvegarde utilisateur)
  const {
    activeTab,
    searchTerm,
    myApps,
    migratedApps,
    customMigrations,
    selectedApp,
    filteredApps,
    apps,
    isLoadingApps,
    isInitialLoading,
    isSearching,
    isLoadingAwards,
    isLoadingMyApps,
    pagination,
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleMigrate,
    setCustomMigration,
    setSelectedApp,
    loadMoreApps,
  } = useAppManagement(currentUser, saveUserData, getUserData, selectedCategory);

  const shouldRestoreScroll = useRef(false);

  const openAppDetail = useCallback((app) => {
    savedScrollY.current = window.scrollY;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedApp(app);
  }, [setSelectedApp]);

  const closeAppDetail = useCallback(() => {
    shouldRestoreScroll.current = true;
    setSelectedApp(null);
  }, [setSelectedApp]);

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

  // Auto-déverrouiller l'admin si l'email correspond à ADMIN_EMAIL
  useEffect(() => {
    if (!currentUser) {
      setIsAdminUnlocked(false);
      return;
    }
    const email = currentUser?.email || currentUser;
    const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
    fetch(`${API_URL}/check-admin?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => { if (data.isAdmin) setIsAdminUnlocked(true); })
      .catch(() => {});
  }, [currentUser]);

  // Scroller en haut lors du changement d'onglet ou de catégorie
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedCategory]);

  // Restaurer la position de scroll après fermeture du détail
  // useLayoutEffect = synchrone avant le paint, évite le flash "retour en haut"
  useLayoutEffect(() => {
    if (!selectedApp && shouldRestoreScroll.current) {
      shouldRestoreScroll.current = false;
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    }
  }, [selectedApp]);

  // Réinitialiser la catégorie lors du changement d'onglet
  useEffect(() => {
    if (activeTab !== TABS.APPLICATIONS) {
      setSelectedCategory('Toutes');
    }
  }, [activeTab]);

  // Gérer le bouton retour du smartphone/navigateur
  useEffect(() => {
    const handleBackButton = (event) => {
      // Si un modal de détails est ouvert
      if (selectedApp) {
        event.preventDefault();
        shouldRestoreScroll.current = true;
        setSelectedApp(null);
        return;
      }
      
      // Si le modal de migration est ouvert
      if (showMigrationSelector) {
        event.preventDefault();
        setShowMigrationSelector(null);
        return;
      }
      
      // Si on est sur "Mes Apps", revenir à "Applications"
      if (activeTab === TABS.MY_APPS) {
        event.preventDefault();
        setActiveTab(TABS.APPLICATIONS);
        return;
      }
      
      // Sinon, laisser le comportement par défaut
    };

    // Ajouter un état initial dans l'historique
    if (window.history.state === null) {
      window.history.pushState({ page: 'trusti' }, '');
    }

    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [selectedApp, showMigrationSelector, activeTab, setSelectedApp, setShowMigrationSelector, setActiveTab]);

  // Ajouter un état dans l'historique quand on ouvre un modal ou change d'onglet
  useEffect(() => {
    if (selectedApp || showMigrationSelector || activeTab === TABS.MY_APPS) {
      window.history.pushState({ page: 'trusti' }, '');
    }
  }, [selectedApp, showMigrationSelector, activeTab]);

  // Appelé par PinModal après validation serveur réussie
  const handleUnlockAdmin = async () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && !currentUser) {
      await login('admin@local');
    }
    setIsAdminUnlocked(true);
    setShowPinModal(false);
  };

  // ── Toggle mobile / desktop ─────────────────────────────────────────
  const isSmallViewport = useIsSmallViewport();
  const [forceMobile, setForceMobile] = useState(
    () => localStorage.getItem('trusti_force_mobile') === 'true'
  );
  const toggleForceMobile = useCallback(() => {
    setForceMobile(prev => {
      const next = !prev;
      localStorage.setItem('trusti_force_mobile', String(next));
      return next;
    });
  }, []);

  // isMobile = vrai viewport étroit OU mode forcé manuellement
  const isMobile = isSmallViewport || forceMobile;

  // Bouton flottant uniquement sur vrai écran large (pas sur mobile réel)
  const FloatingToggle = () => {
    if (isSmallViewport) return null;
    return (
      <button
        onClick={toggleForceMobile}
        className="fixed z-[9999] flex items-center gap-2 text-xs font-bold shadow-xl transition-all"
        style={{
          top: 16,
          right: 16,
          padding: '8px 14px',
          borderRadius: 999,
          background: forceMobile ? '#4f46e5' : '#1e293b',
          color: '#fff',
        }}
        title={forceMobile ? 'Quitter le mode mobile' : 'Aperçu mobile'}
      >
        {forceMobile ? <Monitor size={14} /> : <Smartphone size={14} />}
        <span>{forceMobile ? 'Desktop' : 'Mobile'}</span>
      </button>
    );
  };

  // Cadre phone visuel (purement décoratif, le layout est contrôlé via context)
  const MobileFrame = ({ children }) => {
    if (!forceMobile) return children;
    return (
      <div className="min-h-screen bg-slate-300 flex flex-col items-center py-6 gap-3">
        <div
          className="bg-white shadow-2xl"
          style={{
            width: 430,
            borderRadius: '2.8rem',
            border: '8px solid #1e293b',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  // Afficher la landing page en premier si c'est la première visite
  if (showLandingPage) {
    return <LandingPage onClose={handleCloseLandingPage} />;
  }

  // Afficher la page d'onboarding de sélection des apps
  if (showOnboarding) {
    return <OnboardingApps onComplete={handleOnboardingComplete} />;
  }

  // Affichage du détail d'une application
  if (selectedApp) {
    return (
      <ViewModeContext.Provider value={isMobile}>
        <FloatingToggle />
        <MobileFrame>
          <AppDetailModal
            key={selectedApp?.id}
            app={selectedApp}
            isInMyApps={myApps.has(selectedApp.id)}
            onToggleMyApp={toggleMyApp}
            onClose={closeAppDetail}
            onSelectApp={openAppDetail}
            allApps={apps}
          />
        </MobileFrame>
      </ViewModeContext.Provider>
    );
  }

  // Vue principale
  return (
    <ViewModeContext.Provider value={isMobile}>
    <FloatingToggle />
    <MobileFrame>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <>
      {/* Écran de chargement initial */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-purple-50">
          <div style={{ animation: 'splashFadeIn 0.5s ease-out both' }}>
            <TrustiLogo className="w-20 h-20 mb-5" />
          </div>

          <p className="text-2xl font-black text-slate-800 tracking-tight mb-1" style={{ animation: 'splashFadeIn 0.5s 0.1s ease-out both', opacity: 0 }}>
            TrustiScore
          </p>
          <p className="text-sm text-slate-400 font-medium mb-10" style={{ animation: 'splashFadeIn 0.5s 0.2s ease-out both', opacity: 0 }}>
            Votre guide de confidentialité
          </p>

          <div className="flex items-center gap-2" style={{ animation: 'splashFadeIn 0.5s 0.35s ease-out both', opacity: 0 }}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400"
                style={{ animation: `splashBounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
              />
            ))}
          </div>

          <style>{`
            @keyframes splashFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes splashBounce {
              0%, 80%, 100% { transform: translateY(0);    opacity: 0.35; }
              40%            { transform: translateY(-8px); opacity: 1; }
            }
          `}</style>
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

      <div className={isMobile ? '' : 'flex items-start'}>
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myAppsCount={myApps.size}
      />
      <main className={isMobile
        ? 'max-w-md mx-auto px-4 py-3 pb-24'
        : 'flex-1 min-w-0 px-6 py-3 pb-6'
      }>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div key={activeTab} style={{ animation: 'tabFadeIn 0.18s ease-out' }}>

        {/* Titre pour l'onglet Applications */}
        {activeTab === TABS.APPLICATIONS && (
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Apps populaires
              </p>
              {isLoadingApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            {/* Sélecteur de catégorie - scrollable horizontal pour mobile */}
            <div className="mt-2">
              <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1.5 pb-1.5 px-0.5">
                  {['Toutes', ...CATEGORIES].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all
                        ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Titre pour l'onglet Mes Apps */}
        {activeTab === TABS.MY_APPS && myApps.size > 0 && (
          <div className="mb-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Mes applications
            </p>
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg p-2 border border-rose-100">
              <p className="text-[11px] text-rose-700 font-bold">
                ⚠️ Apps à migrer en priorité en haut
              </p>
            </div>
          </div>
        )}

        {/* Titre pour l'onglet Nos recommandations */}
        {activeTab === TABS.TOP_ALTERNATIVES && (
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Nos Awards
              </p>
              {isLoadingApps && (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent"></div>
              )}
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 font-bold">
                ✨ Nos conseils d'apps avec un TrustiScore respectueux (A, B ou C) par catégorie
              </p>
            </div>
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
          onSelectApp={openAppDetail}
          onSelectMigration={setShowMigrationSelector}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          pagination={pagination}
          onLoadMore={loadMoreApps}
          isLoadingAwards={isLoadingAwards}
          isLoadingMyApps={isLoadingMyApps}
        />
        </div>
      </main>
      </div>

      {/* Modal de partage des migrations */}
      {showShareModal && (
        <ShareModal
          migratedApps={migratedApps}
          customMigrations={customMigrations}
          allApps={apps}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de partage des TrustiApp */}
      {showTrustiShareModal && (
        <TrustiShareModal
          selectedApps={filteredApps.filter(a => myApps.has(a.id))}
          allApps={apps}
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
            openAppDetail(app);
          }}
          allApps={apps}
        />
      )}

      {/* Modal de connexion */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={(email) => { login(email); setShowLoginModal(false); }}
      />

      {/* Modal de code PIN admin */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleUnlockAdmin}
        userEmail={currentUser?.email || currentUser}
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

      </>

      {/* Widget de chat Trusti (visible partout sauf pendant la vérification du token, la page de bienvenue, l'onboarding et la console admin) */}
      {!showWelcomeModal && !showOnboarding && !showAdminModal && <TrustiChatWidget onOpenLandingPage={handleOpenLandingPage} />}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
    </MobileFrame>
    </ViewModeContext.Provider>
  );
};

export default App;