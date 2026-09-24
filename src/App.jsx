import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/tabs';
import { CATEGORIES, FAVORITES_FILTER } from './constants/categories';
import { Sparkles, Share2, RefreshCw, Star } from 'lucide-react';
import { ViewModeContext } from './contexts/ViewModeContext';
import { AgeModeContext } from './contexts/AgeModeContext';
import { parseShareParams, clearShareParams, hasShareParams } from './utils/shareUtils';
import { getAdminTokenEmail, clearAdminToken, setAdminToken } from './utils/adminAuth';
import { hasCompletedOnboarding, markOnboardingComplete } from './utils/onboardingStorage';
import { AGE_MODE, getAgeMode, hasSetAgeMode, setAgeMode } from './utils/ageMode';
import { getMyAppsSortPref, setMyAppsSortPref, sortMyApps } from './utils/myAppsSort';

// Layout
import Header from './components/layout/Header';

// UI Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import Navigation from './components/layout/Navigation';

// UI Components
import SearchBar from './components/ui/SearchBar';
import ExplainerPanel from './components/ExplainerPanel';
import AppsList from './components/AppsList';
import MyAppsSummary from './components/MyAppsSummary';
import MyAppsSortMenu from './components/MyAppsSortMenu';
import LandingPage from './components/LandingPage';
import TrustiChatWidget from './components/TrustiChatWidget';
import OnboardingApps from './components/OnboardingApps';
import OnboardingAppsNative from './components/OnboardingAppsNative';
import { isNativeAndroid } from './utils/platform';

// Modals
import AppDetailModal from './components/modals/AppDetailModal';
import ShareModal from './components/modals/ShareModal';
import TrustiShareModal from './components/modals/TrustiShareModal';
import ImportAppsModal from './components/modals/ImportAppsModal';
import MigrationSelectorModal from './components/modals/MigrationSelectorModal';
import LoginModal from './components/modals/LoginModal';
import AdminAppsModal from './components/modals/AdminAppsModal';
import PinModal from './components/modals/PinModal';
import WelcomeModal from './components/modals/WelcomeModal';
import AgePromptModal from './components/modals/AgePromptModal';
import StoragePage from './components/StoragePage';

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
  } = useAuth();

  // Wrapper pour logout qui réinitialise aussi l'état admin
  const logout = () => {
    setIsAdminUnlocked(false);
    clearAdminToken();
    authLogout();
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

  // Demande d'âge (+ ou - 15 ans) : posée une seule fois, avant tout le
  // reste (même la landing page/l'onboarding), pour déterminer le style
  // graphique à appliquer. Sauvegardée par appareil, comme l'onboarding.
  const [ageMode, setAgeModeState] = useState(() => getAgeMode() || AGE_MODE.ADULT);
  const [showAgePrompt, setShowAgePrompt] = useState(() => !hasSetAgeMode());

  const handleAgeSelect = (mode) => {
    setAgeMode(mode);
    setAgeModeState(mode);
    setShowAgePrompt(false);
  };

  // Applique le style graphique "moins de 15 ans" globalement (y compris aux
  // modales/écrans qui ne sont pas dans l'arbre React sous ce composant).
  useEffect(() => {
    document.documentElement.classList.toggle('theme-kids', ageMode === AGE_MODE.KID);
  }, [ageMode]);

  // Est-on arrivé via un lien de partage ? (évalué une seule fois au montage,
  // avant que l'URL ne soit nettoyée). Dans ce cas on court-circuite le
  // welcome/onboarding pour aller droit à la modal d'import.
  const [arrivedViaShare] = useState(() => hasShareParams());

  // Onboarding (welcome + sélection/scan des apps) : une seule fois par
  // appareil, indépendamment de la connexion — PWA/APK sauvegardent en local
  // (voir useAuth) donc pas besoin de compte pour retrouver ses choix.
  const [showWelcomeModal, setShowWelcomeModal] = useState(
    () => !hasCompletedOnboarding() && !arrivedViaShare
  );

  // État pour la page d'onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Sur Android natif, l'utilisateur peut basculer du scan auto vers la sélection manuelle classique
  const [forceManualOnboarding, setForceManualOnboarding] = useState(false);

  // Arrivée via lien de partage = engagement suffisant pour ne pas reproposer
  // le welcome/onboarding ensuite sur cet appareil.
  useEffect(() => {
    if (arrivedViaShare) markOnboardingComplete();
  }, [arrivedViaShare]);

  // Handler pour "Oui, c'est ma première fois"
  const handleFirstTimeYes = () => {
    markOnboardingComplete();
    setShowWelcomeModal(false);
    // Afficher la page d'onboarding de sélection des apps
    setShowOnboarding(true);
  };

  // Handler pour "Non, je connais déjà"
  const handleFirstTimeNo = () => {
    markOnboardingComplete();
    setShowWelcomeModal(false);
    setShowLoginModal(true);
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

  // Re-scan manuel depuis "Mes Apps" : relance le scan (Android natif) ou la
  // sélection manuelle (PWA/web) pour repérer de nouvelles apps installées
  // sans repasser par tout l'onboarding. Le scan natif remonte aussi les apps
  // du catalogue confirmées désinstallées (package non retrouvé) pour qu'on
  // les retire de "Mes Apps" — sinon la liste n'est jamais vraiment "à jour".
  // La sélection manuelle (PWA/web, sans lecture réelle du téléphone) reste
  // purement additive, faute de moyen de vérifier ce qui est désinstallé.
  const [showRescan, setShowRescan] = useState(false);
  const [forceManualRescan, setForceManualRescan] = useState(false);

  const handleRescanComplete = (selectedAppIds, notInstalledIds) => {
    if (notInstalledIds && notInstalledIds.length > 0) {
      removeMyApps(notInstalledIds);
    }
    if (selectedAppIds && selectedAppIds.size > 0) {
      addMyApps([...selectedAppIds].map(String));
    }
    setShowRescan(false);
    setForceManualRescan(false);
  };

  // État pour le filtre de catégorie dans l'onglet Applications
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // État pour le filtre migrée / à migrer dans l'onglet Mes Apps
  const [migrationFilter, setMigrationFilter] = useState('all');

  // État pour le filtre avec/sans alternative connue dans l'onglet Mes Apps.
  // Par défaut on masque les apps sans alternative connue (rien à proposer
  // à l'utilisateur pour elles), pour que la liste reste actionnable.
  const [alternativeFilter, setAlternativeFilter] = useState('with');

  // Réglage de tri de l'onglet "Mes Apps" (discret, persisté en local) :
  // TrustiScore décroissant par défaut, comme historiquement.
  const [mySort, setMySort] = useState(() => getMyAppsSortPref());
  useEffect(() => {
    setMyAppsSortPref(mySort);
  }, [mySort]);

  // Gestion de l'espace de stockage (voir StorageManagerModal) — déclaré avant
  // useAppManagement pour pouvoir lui signaler qu'il a besoin des données
  // complètes de "Mes Apps" même si l'onglet actif est différent.
  const [showStorageManager, setShowStorageManager] = useState(false);

  // Gestion de l'état des applications (avec sauvegarde utilisateur)
  const {
    activeTab,
    searchTerm,
    myApps,
    favoriteApps,
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
    myAppsData,
    pagination,
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleFavorite,
    addMyApps,
    removeMyApps,
    clearMyApps,
    clearMigrations,
    toggleMigrate,
    setCustomMigration,
    importMigrations,
    setSelectedApp,
    loadMoreApps,
  } = useAppManagement(currentUser, saveUserData, getUserData, selectedCategory, showStorageManager);

  // Une app "Mes Apps" est considérée migrée si elle est déjà au top (grade A)
  // ou si l'alternative recommandée est déjà utilisée.
  const isAppMigrated = (app) => app.grade === 'A' || app.alternativeAdopted === true;

  // Une app est considérée comme ayant une alternative dès lors qu'elle est
  // déjà au top (grade A, aucune alternative nécessaire), qu'une alternative
  // recommandée existe, ou qu'une migration personnalisée a été choisie.
  const appHasAlternative = (app) =>
    app.grade === 'A' || !!app.alternative || !!customMigrations.get(app.id);

  // Compteurs pour le filtre migrée / à migrer (sur la liste non filtrée par ce critère)
  const migrationCounts = useMemo(() => {
    if (activeTab !== TABS.MY_APPS) return { migrated: 0, todo: 0 };
    const realApps = filteredApps.filter(app => !app.isLoadingSkeleton);
    const migrated = realApps.filter(isAppMigrated).length;
    return { migrated, todo: realApps.length - migrated };
  }, [activeTab, filteredApps]);

  // Compteurs pour le filtre avec / sans alternative (sur la liste non filtrée par ce critère)
  const alternativeCounts = useMemo(() => {
    if (activeTab !== TABS.MY_APPS) return { with: 0, without: 0 };
    const realApps = filteredApps.filter(app => !app.isLoadingSkeleton);
    const withAlt = realApps.filter(appHasAlternative).length;
    return { with: withAlt, without: realApps.length - withAlt };
  }, [activeTab, filteredApps, customMigrations]);

  // Ordre d'ajout à "Mes Apps" (le Set préserve l'ordre d'insertion), utilisé
  // par le tri "Date d'ajout".
  const myAppsOrder = useMemo(
    () => new Map(Array.from(myApps).map((id, index) => [String(id), index])),
    [myApps]
  );

  // Toutes les apps de "Mes Apps", triées selon le réglage choisi (utilisé
  // par la liste affichée ci-dessous, mais aussi par le partage : le lien
  // "Partager mon TrustiScore" doit refléter le même ordre que ce que
  // l'utilisateur voit).
  const myAppsSorted = useMemo(() => {
    const relevant = filteredApps.filter(app => myApps.has(app.id));
    return sortMyApps(relevant, mySort, myAppsOrder);
  }, [filteredApps, myApps, mySort, myAppsOrder]);

  // Liste effectivement affichée dans "Mes Apps" : version triée ci-dessus,
  // avec en plus les filtres migrée / à migrer et avec / sans alternative.
  const myAppsDisplayed = useMemo(() => {
    if (activeTab !== TABS.MY_APPS) return filteredApps;
    if (migrationFilter === 'all' && alternativeFilter === 'all') return myAppsSorted;
    return myAppsSorted.filter(app => {
      if (app.isLoadingSkeleton) return false;
      if (migrationFilter !== 'all' && (migrationFilter === 'migrated') !== isAppMigrated(app)) {
        return false;
      }
      if (alternativeFilter !== 'all' && (alternativeFilter === 'with') !== appHasAlternative(app)) {
        return false;
      }
      return true;
    });
  }, [activeTab, filteredApps, myAppsSorted, migrationFilter, alternativeFilter, customMigrations]);

  // Import via lien de partage (?apps=... et/ou ?mig=...)
  const [pendingImport, setPendingImport] = useState(null);

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

  // Déverrouiller l'admin si un jeton de session valide existe déjà pour cet
  // utilisateur (évite de redemander le PIN à chaque visite). Le jeton n'est
  // obtenu qu'après vérification OTP réelle (voir handleUnlockAdmin) : on ne
  // peut pas se fier à /api/check-admin seul pour accorder l'accès, il ne
  // fait que comparer un email fourni par le client sans preuve d'identité.
  useEffect(() => {
    if (!currentUser) {
      setIsAdminUnlocked(false);
      return;
    }
    const email = (currentUser?.email || currentUser || '').toLowerCase();
    const tokenEmail = getAdminTokenEmail();
    setIsAdminUnlocked(!!tokenEmail && tokenEmail === email);
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

  // Appliquer les apps sélectionnées en onboarding après connexion
  useEffect(() => {
    if (!currentUser) return;
    const pending = localStorage.getItem('trusti_pending_onboarding_apps');
    if (!pending) return;
    try {
      const pendingIds = JSON.parse(pending);
      localStorage.removeItem('trusti_pending_onboarding_apps');
      if (pendingIds.length > 0) {
        // Délai > 100ms (délai interne de useAppManagement pour setIsInitialized)
        // pour que la sauvegarde se déclenche après le chargement initial
        setTimeout(() => addMyApps(pendingIds.map(String)), 150);
      }
    } catch {}
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Détecter un lien de partage au chargement (?apps=... et/ou ?mig=...)
  // et ouvrir la modal d'import, puis nettoyer l'URL.
  useEffect(() => {
    const { appIds, migrations } = parseShareParams();
    if (appIds.length > 0 || migrations.length > 0) {
      setPendingImport({ appIds, migrations });
      clearShareParams();
    }
  }, []);

  // Appliquer une sélection partagée en attente après connexion
  useEffect(() => {
    if (!currentUser) return;
    const pending = localStorage.getItem('trusti_pending_shared_selection');
    if (!pending) return;
    try {
      const { appIds = [], migrations = [] } = JSON.parse(pending);
      localStorage.removeItem('trusti_pending_shared_selection');
      // Délai > 100ms (setIsInitialized dans useAppManagement) pour que la
      // sauvegarde utilisateur se déclenche après le chargement initial.
      setTimeout(() => {
        if (appIds.length > 0) addMyApps(appIds.map(String));
        if (migrations.length > 0) importMigrations(migrations);
      }, 150);
    } catch {}
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Confirmer l'import depuis la modal de partage.
  // On applique directement, sans forcer la connexion. Si l'utilisateur n'est
  // pas connecté, on garde la sélection en attente pour la ré-appliquer s'il se
  // connecte plus tard (via le useEffect ci-dessus), mais sans popup imposée.
  const handleImportShared = ({ appIds = [], migrations = [] }) => {
    if (appIds.length > 0) addMyApps(appIds.map(String));
    if (migrations.length > 0) importMigrations(migrations);
    if (!currentUser) {
      localStorage.setItem(
        'trusti_pending_shared_selection',
        JSON.stringify({ appIds, migrations })
      );
    }
    setActiveTab(TABS.MY_APPS);
    setPendingImport(null);
  };

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

  // Gérer le bouton retour matériel Android (app native Capacitor).
  // Dans le WebView natif, ce bouton ne déclenche PAS l'événement navigateur
  // "popstate" : il émet l'événement natif Capacitor "backButton". Sans
  // écouteur dessus, le comportement par défaut est de fermer l'app
  // directement, même si un détail d'app ou une modale est ouvert.
  useEffect(() => {
    if (!isNativeAndroid) return;

    let listenerHandle;
    let cancelled = false;

    CapacitorApp.addListener('backButton', () => {
      if (selectedApp) {
        shouldRestoreScroll.current = true;
        setSelectedApp(null);
        return;
      }

      if (showStorageManager) {
        setShowStorageManager(false);
        return;
      }

      if (showMigrationSelector) {
        setShowMigrationSelector(null);
        return;
      }

      if (activeTab === TABS.MY_APPS) {
        setActiveTab(TABS.APPLICATIONS);
        return;
      }

      CapacitorApp.exitApp();
    }).then((handle) => {
      if (cancelled) {
        handle.remove();
      } else {
        listenerHandle = handle;
      }
    });

    return () => {
      cancelled = true;
      listenerHandle?.remove();
    };
  }, [selectedApp, showStorageManager, showMigrationSelector, activeTab, setSelectedApp, setShowMigrationSelector, setActiveTab]);

  // Appelé par PinModal après validation serveur réussie
  const handleUnlockAdmin = async (token) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && !currentUser) {
      await login('admin@local');
    }
    setAdminToken(token);
    setIsAdminUnlocked(true);
    setShowPinModal(false);
  };

  const isMobile = useIsSmallViewport();

  // Demande d'âge : priorité sur tout le reste, y compris la landing page.
  if (showAgePrompt) {
    return <AgePromptModal onSelect={handleAgeSelect} />;
  }

  // Afficher la landing page en premier si c'est la première visite
  if (showLandingPage) {
    return (
      <AgeModeContext.Provider value={ageMode}>
        <LandingPage onClose={handleCloseLandingPage} />
      </AgeModeContext.Provider>
    );
  }

  // Afficher la page d'onboarding de sélection des apps
  if (showOnboarding) {
    // Pas de proposition de connexion sur l'app mobile (fonctionnalité retirée) :
    // l'onboarding natif reste toujours en mode invité (voir useAuth).
    const onSignUp = (isNativeAndroid || currentUser) ? undefined : () => setShowLoginModal(true);
    if (isNativeAndroid && !forceManualOnboarding) {
      return (
        <AgeModeContext.Provider value={ageMode}>
          <OnboardingAppsNative
            onComplete={handleOnboardingComplete}
            onSignUp={onSignUp}
            onManualSelection={() => setForceManualOnboarding(true)}
          />
        </AgeModeContext.Provider>
      );
    }
    return (
      <AgeModeContext.Provider value={ageMode}>
        <OnboardingApps onComplete={handleOnboardingComplete} onSignUp={onSignUp} />
      </AgeModeContext.Provider>
    );
  }

  // Re-scan manuel (déclenché depuis "Mes Apps") : même écran que l'onboarding
  // mais purement additif, sans welcome/redirection de compte.
  if (showRescan) {
    if (isNativeAndroid && !forceManualRescan) {
      return (
        <AgeModeContext.Provider value={ageMode}>
          <OnboardingAppsNative
            onComplete={handleRescanComplete}
            onManualSelection={() => setForceManualRescan(true)}
          />
        </AgeModeContext.Provider>
      );
    }
    return (
      <AgeModeContext.Provider value={ageMode}>
        <OnboardingApps onComplete={handleRescanComplete} />
      </AgeModeContext.Provider>
    );
  }

  // Affichage du détail d'une application
  if (selectedApp) {
    return (
      <AgeModeContext.Provider value={ageMode}>
      <ViewModeContext.Provider value={isMobile}>
        <AppDetailModal
          key={selectedApp?.id}
          app={selectedApp}
          isInMyApps={myApps.has(selectedApp.id)}
          onToggleMyApp={toggleMyApp}
          onClose={closeAppDetail}
          onSelectApp={openAppDetail}
          allApps={apps}
        />
      </ViewModeContext.Provider>
      </AgeModeContext.Provider>
    );
  }

  // Écran dédié "Espace de stockage" (page à part entière, pas une popup)
  if (showStorageManager) {
    return (
      <StoragePage
        onClose={() => setShowStorageManager(false)}
        myAppsCount={myApps.size}
        migrationsCount={migratedApps.size}
        myAppsData={myAppsData}
        isLoadingMyAppsData={isLoadingMyApps}
        onClearMyApps={clearMyApps}
        onClearMigrations={clearMigrations}
      />
    );
  }

  // Vue principale
  return (
    <AgeModeContext.Provider value={ageMode}>
    <ViewModeContext.Provider value={isMobile}>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <>
      {/* Écran de chargement initial */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-purple-50">
          <div style={{ animation: 'splashFadeIn 0.5s ease-out both' }}>
            <img src="/assets/logo.png" alt="TrustiScore" className="w-28 h-28 mb-3 drop-shadow-lg" />
          </div>

          <p className="text-2xl font-black text-slate-800 tracking-tight mb-1" style={{ animation: 'splashFadeIn 0.5s 0.1s ease-out both', opacity: 0 }}>
            TrustiScore
          </p>
          <p className="text-sm text-slate-400 font-medium mb-10" style={{ animation: 'splashFadeIn 0.5s 0.2s ease-out both', opacity: 0 }}>
            {ageMode === AGE_MODE.KID
              ? 'Ton copain pour bien choisir tes applis ! 🚀'
              : 'Votre guide pour maîtriser vos apps et vos données'}
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
        onOpenStorageManager={() => setShowStorageManager(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onShowLandingPage={() => setShowLandingPage(true)}
        isAdminUnlocked={isAdminUnlocked}
        onRequestAdminUnlock={() => setShowPinModal(true)}
      />

      {/* items-start casserait le sticky du menu : sans stretch, la colonne du
          menu ne fait que la hauteur d'un écran (h-screen) et n'a donc aucune
          marge pour rester "collée" au scroll — elle disparaît avec le reste
          dès qu'on dépasse un écran de contenu (visible en tablette/paysage,
          où le menu latéral remplace la barre du bas). */}
      <div className={isMobile ? '' : 'flex'}>
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myAppsCount={myApps.size}
      />
      <main className={isMobile
        ? 'max-w-md mx-auto px-4 py-3 pb-24'
        : 'flex-1 min-w-0 px-6 py-3 pb-6'
      }>
        {activeTab !== TABS.MY_APPS && (
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        )}

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
                  {['Toutes', FAVORITES_FILTER, ...CATEGORIES].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all inline-flex items-center gap-1
                        ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        }
                      `}
                    >
                      {category === FAVORITES_FILTER && (
                        <Star size={11} className={selectedCategory === category ? 'fill-current' : ''} />
                      )}
                      {category}
                      {category === FAVORITES_FILTER && favoriteApps.size > 0 && (
                        <span>({favoriteApps.size})</span>
                      )}
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
        {activeTab === TABS.MY_APPS && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 leading-tight">Mes applications</h2>
                  {isLoadingMyApps && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent shrink-0"></div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {myApps.size > 0
                    ? `${myApps.size} application${myApps.size > 1 ? 's' : ''} · ${migratedApps.size} migrée${migratedApps.size > 1 ? 's' : ''}`
                    : 'Relance un scan pour repérer tes apps'}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {myApps.size > 1 && (
                  <MyAppsSortMenu
                    sortBy={mySort.sortBy}
                    direction={mySort.direction}
                    onChange={setMySort}
                  />
                )}
                <button
                  onClick={() => setShowRescan(true)}
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  aria-label="Actualiser"
                  title="Relancer un scan pour actualiser ton TrustiScore avec tes apps récentes"
                >
                  <RefreshCw size={16} />
                </button>
                {myApps.size > 0 && (
                  <button
                    onClick={() => setShowTrustiShareModal(true)}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                    aria-label="Partager"
                    title="Partager mon TrustiScore"
                  >
                    <Share2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {migratedApps.size > 0 && (
              <button
                onClick={() => setShowShareModal(true)}
                className="mt-2 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
              >
                Partager aussi mes migrations ({migratedApps.size})
              </button>
            )}
          </div>
        )}

        {/* Résumé TrustiScore du téléphone + progression des migrations */}
        {activeTab === TABS.MY_APPS && !searchTerm.trim() && (
          <MyAppsSummary apps={filteredApps} />
        )}

        {/* Recherche : positionnée sous le résumé, car elle porte sur les apps listées ci-dessous */}
        {activeTab === TABS.MY_APPS && (
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        )}

        {/* Filtre migrée / à migrer */}
        {activeTab === TABS.MY_APPS && myApps.size > 0 && !searchTerm.trim() && (
          <div className="flex gap-1.5 mb-4">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'todo', label: `À migrer (${migrationCounts.todo})` },
              { id: 'migrated', label: `Migrées (${migrationCounts.migrated})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setMigrationFilter(id)}
                className={`flex-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  migrationFilter === id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filtre avec / sans alternative connue */}
        {activeTab === TABS.MY_APPS && myApps.size > 0 && !searchTerm.trim() && (
          <div className="flex gap-1.5 mb-4">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'with', label: `Avec alternative (${alternativeCounts.with})` },
              { id: 'without', label: `Sans alternative (${alternativeCounts.without})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setAlternativeFilter(id)}
                className={`flex-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  alternativeFilter === id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {label}
              </button>
            ))}
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
            <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
              Nos conseils d'apps avec un TrustiScore respectueux (A, B ou C) par catégorie
            </p>
          </div>
        )}

        {/* Panneau explicatif */}
        {showExplainer && (
          <ExplainerPanel onClose={() => setShowExplainer(false)} />
        )}

        {/* Liste des applications */}
        <AppsList
          apps={activeTab === TABS.MY_APPS ? myAppsDisplayed : filteredApps}
          activeTab={activeTab}
          myApps={myApps}
          favoriteApps={favoriteApps}
          migratedApps={migratedApps}
          customMigrations={customMigrations}
          onToggleMyApp={toggleMyApp}
          onToggleFavorite={toggleFavorite}
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
          sortedAppIds={myAppsSorted.map(app => app.id)}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Modal de partage des TrustiApp */}
      {showTrustiShareModal && (
        <TrustiShareModal
          selectedApps={myAppsSorted}
          customMigrations={customMigrations}
          allApps={apps}
          onClose={() => setShowTrustiShareModal(false)}
        />
      )}

      {/* Modal d'import via lien de partage */}
      {pendingImport && (
        <ImportAppsModal
          appIds={pendingImport.appIds}
          migrations={pendingImport.migrations}
          isLoggedIn={Boolean(currentUser)}
          onConfirm={handleImportShared}
          onClose={() => setPendingImport(null)}
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

      {/* Modal de connexion (fonctionnalité retirée sur l'app mobile) */}
      {!isNativeAndroid && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={(email) => { login(email); setShowLoginModal(false); }}
        />
      )}

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

      {/* Widget de chat Trusti (visible partout sauf pendant la vérification du token, la page de bienvenue, l'onboarding, le chargement initial et la console admin) */}
      {!showWelcomeModal && !showOnboarding && !showRescan && !showAdminModal && !isLoadingApps && <TrustiChatWidget onOpenLandingPage={handleOpenLandingPage} />}

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
    </ViewModeContext.Provider>
    </AgeModeContext.Provider>
  );
};

export default App;