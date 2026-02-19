import React, { useState, useEffect } from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/tabs';
import { CATEGORIES } from './constants/categories';
import { Sparkles } from 'lucide-react';

// Layout
import Header from './components/layout/Header';

// UI Components
import LoadingSpinner from './components/ui/LoadingSpinner';
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
  // Vérifier si on est en mode vérification de token
  const urlParams = new URLSearchParams(window.location.search);
  const isVerifying = urlParams.has('token');
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
  const [allAppsForOnboarding, setAllAppsForOnboarding] = useState([]);
  const [isLoadingOnboardingApps, setIsLoadingOnboardingApps] = useState(false);
  const [onboardingPagination, setOnboardingPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
    isLoadingMore: false
  });

  // Charger TOUTES les apps pour l'onboarding (avec tri par popularité)
  useEffect(() => {
    if (showOnboarding && allAppsForOnboarding.length === 0 && !isLoadingOnboardingApps) {
      const loadAllApps = async () => {
        setIsLoadingOnboardingApps(true);
        try {
          const API_URL = import.meta.env.PROD 
            ? '/api'
            : 'http://localhost:3001/api';
          
          // Charger les apps triées par popularité avec pagination
          const url = `${API_URL}/apps?limit=${onboardingPagination.limit}&offset=0&sortBy=popularity`;
          
          const response = await fetch(url);
          const data = await response.json();
          const appsArray = data.success ? data.apps : [];
          
          setAllAppsForOnboarding(appsArray);
          
          // Mettre à jour l'état de pagination
          if (data.pagination) {
            setOnboardingPagination({
              total: data.pagination.total,
              limit: data.pagination.limit,
              offset: 0,
              hasMore: data.pagination.hasMore,
              isLoadingMore: false
            });
          }
        } catch (error) {
        } finally {
          setIsLoadingOnboardingApps(false);
        }
      };
      
      loadAllApps();
    }
  }, [showOnboarding, allAppsForOnboarding.length, isLoadingOnboardingApps]);

  // Fonction pour charger plus d'apps pour l'onboarding
  const loadMoreOnboardingApps = async () => {
    if (onboardingPagination.isLoadingMore || !onboardingPagination.hasMore) {
      return;
    }

    setOnboardingPagination(prev => ({ ...prev, isLoadingMore: true }));

    try {
      const API_URL = import.meta.env.PROD 
        ? '/api'
        : 'http://localhost:3001/api';
      
      const newOffset = onboardingPagination.offset + onboardingPagination.limit;
      const url = `${API_URL}/apps?limit=${onboardingPagination.limit}&offset=${newOffset}&sortBy=popularity`;
      
      const response = await fetch(url);
      const data = await response.json();
      const appsArray = data.success ? data.apps : [];
      
      // Ajouter les nouvelles apps à la liste existante
      setAllAppsForOnboarding(prev => [...prev, ...appsArray]);
      
      // Mettre à jour la pagination
      if (data.pagination) {
        setOnboardingPagination({
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: newOffset,
          hasMore: data.pagination.hasMore,
          isLoadingMore: false
        });
      }
    } catch (error) {
      setOnboardingPagination(prev => ({ ...prev, isLoadingMore: false }));
    }
  };

  // Afficher le modal de bienvenue si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!currentUser && !isVerifying) {
      setShowWelcomeModal(true);
    } else {
      setShowWelcomeModal(false);
    }
  }, [currentUser, isVerifying]);

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
      // Réinitialiser l'état admin quand on se déconnecte
      setIsAdminUnlocked(false);
    }
  }, [currentUser, getUserData]);

  // Scroller en haut lors du changement d'onglet ou de catégorie
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedCategory]);

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

  // Gérer le déverrouillage admin après validation du code PIN
  const handleUnlockAdmin = async () => {
    // En local sans utilisateur connecté, connecter automatiquement un admin local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal && !currentUser) {
      // Connexion automatique en tant qu'admin local
      await login('admin@local');
    }
    
    // Déverrouiller l'admin (après validation du PIN)
    setIsAdminUnlocked(true);
    if (saveUserData) {
      saveUserData('admin_unlocked', true);
    }
    
    // Fermer le modal PIN
    setShowPinModal(false);
  };

  // Afficher la landing page en premier si c'est la première visite
  if (showLandingPage) {
    return <LandingPage onClose={handleCloseLandingPage} />;
  }

  // Afficher la page d'onboarding de sélection des apps
  if (showOnboarding) {
    // Afficher un loader pendant le chargement
    if (isLoadingOnboardingApps || allAppsForOnboarding.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <LoadingSpinner message="Chargement des applications..." size="large" />
        </div>
      );
    }
    
    // Toutes les apps disponibles triées par popularité (le tri est déjà fait côté serveur)
    const allApps = allAppsForOnboarding;
    
    return (
      <OnboardingApps 
        allApps={allApps}
        onComplete={handleOnboardingComplete}
        pagination={onboardingPagination}
        onLoadMore={loadMoreOnboardingApps}
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
        allApps={apps}
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
          <LoadingSpinner message="Chargement de TrustiScore..." size="large" />
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

      <main className="max-w-md mx-auto px-4 py-3">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
              <p className="text-[10px] text-rose-700 font-bold">
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
              <p className="text-[10px] text-emerald-700 font-bold">
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
          onSelectApp={setSelectedApp}
          onSelectMigration={setShowMigrationSelector}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          pagination={pagination}
          onLoadMore={loadMoreApps}
          isLoadingAwards={isLoadingAwards}
          isLoadingMyApps={isLoadingMyApps}
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
            setSelectedApp(app);
          }}
          allApps={apps}
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

      {/* Widget de chat Trusti (visible partout sauf pendant la vérification du token, la page de bienvenue, l'onboarding et la console admin) */}
      {!isVerifying && !showWelcomeModal && !showOnboarding && !showAdminModal && <TrustiChatWidget onOpenLandingPage={handleOpenLandingPage} />}

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