import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppManagement } from './hooks/useAppManagement';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { useAlternativeNudges } from './hooks/useAlternativeNudges';
import { useGradeChanges } from './hooks/useGradeChanges';
import { useIsSmallViewport } from './hooks/useIsSmallViewport';
import { usePreferenceToggle } from './hooks/usePreferenceToggle';
import { useMyAppsView } from './hooks/useMyAppsView';
import { useAppDetail } from './hooks/useAppDetail';
import { useShareLinks } from './hooks/useShareLinks';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { useBackNavigation } from './hooks/useBackNavigation';
import { TABS } from './constants/tabs';
import { ViewModeContext } from './contexts/ViewModeContext';
import { useToast } from './contexts/ToastContext';
import { areNudgesEnabled, setNudgesEnabled } from './utils/alternativeNudges';
import { areGradeAlertsEnabled, setGradeAlertsEnabled } from './utils/gradeChanges';
import { getMigrationsInProgress } from './utils/migrationGuide';
import { getAllMigrationGuideStates, removeMigrationGuideState, saveMigrationGuideState } from './utils/migrationGuideStorage';
import { isNativeAndroid } from './utils/platform';

// Layout
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import SplashScreen from './components/layout/SplashScreen';

// Écrans et sections
import SearchBar from './components/ui/SearchBar';
import ExplainerPanel from './components/ExplainerPanel';
import AppsList from './components/AppsList';
import CategoryFilterBar from './components/CategoryFilterBar';
import AwardsHeader from './components/AwardsHeader';
import MyAppsHeader from './components/MyAppsHeader';
import MyAppsSummary from './components/MyAppsSummary';
import DataHygieneCard from './components/DataHygieneCard';
import GradeChangesCard from './components/GradeChangesCard';
import MigrationsInProgressCard from './components/MigrationsInProgressCard';
import MyAppsFilterMenu from './components/MyAppsFilterMenu';
import MyAppsFilterNotice from './components/MyAppsFilterNotice';
import LandingPage from './components/LandingPage';
import AppsSelectionScreen from './components/AppsSelectionScreen';
import RescanPrompts from './components/RescanPrompts';
import StoragePage from './components/StoragePage';

// Modales
import AppDetailModal from './components/modals/AppDetailModal';
import ShareModal from './components/modals/ShareModal';
import TrustiShareModal from './components/modals/TrustiShareModal';
import ImportAppsModal from './components/modals/ImportAppsModal';
import MigrationSelectorModal from './components/modals/MigrationSelectorModal';
import WelcomeModal from './components/modals/WelcomeModal';

/**
 * Composant principal de l'application Trusti : assemble l'état (hooks) et
 * choisit l'écran affiché (landing, sélection des apps, fiche, stockage ou
 * vue principale à onglets).
 */
const App = () => {
  const { getUserData, saveUserData } = useAuth();
  const toast = useToast();
  const isMobile = useIsSmallViewport();

  // La landing page ne s'affiche que sur demande
  const [showLandingPage, setShowLandingPage] = useState(false);

  // Filtre de catégorie de l'onglet Applications
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // Écran « Espace de stockage » : déclaré avant useAppManagement, qui a
  // besoin de savoir qu'il faut les données complètes de « Mes Apps » même si
  // l'onglet actif est différent.
  const [showStorageManager, setShowStorageManager] = useState(false);
  const closeStorageManager = useCallback(() => setShowStorageManager(false), []);

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
    isInitialized,
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
  } = useAppManagement(saveUserData, getUserData, selectedCategory, showStorageManager);

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

  const flow = useOnboardingFlow({
    isInitialized,
    myApps,
    addMyApps,
    removeMyApps,
    setActiveTab,
    setSelectedApp,
    closeStorageManager,
    showLandingPage,
  });

  const myAppsView = useMyAppsView({ activeTab, filteredApps, myApps, customMigrations });
  const { myAppsSorted, myAppsDisplayed } = myAppsView;

  const { openAppDetail, closeAppDetail, resumeMigration, resumeMigrationId } = useAppDetail({
    selectedApp,
    setSelectedApp,
  });

  const { pendingImport, confirmImport, cancelImport } = useShareLinks({
    openAppDetail,
    closeStorageManager,
    addMyApps,
    importMigrations,
    setActiveTab,
    toast,
  });

  // Suggestions d'alternatives par notification (Android natif)
  const [nudgesEnabled, toggleNudges] = usePreferenceToggle(areNudgesEnabled, setNudgesEnabled);
  const { openRequestId: nudgeOpenId, clearOpenRequest: clearNudgeOpen } = useAlternativeNudges({
    myAppsList: filteredApps,
    isMyAppsTab: activeTab === TABS.MY_APPS && !searchTerm.trim(),
    migratedApps,
    customMigrations,
    enabled: nudgesEnabled,
  });

  // Notes de « Mes Apps » qui ont changé depuis la dernière visite (web et APK)
  const [gradeAlertsEnabled, toggleGradeAlerts] = usePreferenceToggle(areGradeAlertsEnabled, setGradeAlertsEnabled);
  const { changes: gradeChanges, dismiss: dismissGradeChanges } = useGradeChanges({
    myApps,
    ready: isInitialized,
    active: activeTab === TABS.MY_APPS && isInitialized,
    alertsEnabled: gradeAlertsEnabled,
  });

  // Parcours de migration guidée commencés et pas terminés (relus à chaque
  // fermeture de fiche, où le parcours a pu avancer, et après un abandon)
  const [migrationGuidesVersion, setMigrationGuidesVersion] = useState(0);
  const migrationsInProgress = useMemo(() => {
    if (activeTab !== TABS.MY_APPS || selectedApp) return [];
    const mine = filteredApps.filter(app => myApps.has(app.id));
    return getMigrationsInProgress(getAllMigrationGuideStates(), mine, { migratedApps, catalogApps: apps });
  }, [activeTab, selectedApp, filteredApps, myApps, migratedApps, apps, migrationGuidesVersion]);

  // Abandon d'un parcours depuis la carte : annulable, et relançable depuis la fiche
  const abandonMigration = (app) => {
    const previous = removeMigrationGuideState(app.id);
    setMigrationGuidesVersion(v => v + 1);
    toast.success('Migration abandonnée', {
      label: 'Annuler',
      onClick: () => {
        saveMigrationGuideState(app.id, previous);
        setMigrationGuidesVersion(v => v + 1);
      },
    });
  };

  // Ouverture depuis une notification de suggestion : on passe sur « Mes Apps »
  // (qui charge les données de l'app et son alternative), puis on ouvre sa fiche.
  useEffect(() => {
    if (!nudgeOpenId) return;
    if (activeTab !== TABS.MY_APPS || searchTerm) {
      setSearchTerm('');
      setActiveTab(TABS.MY_APPS);
      return;
    }
    setShowStorageManager(false);
    const target = filteredApps.find(app => String(app.id) === nudgeOpenId);
    if (target && !target.isLoadingSkeleton) {
      clearNudgeOpen();
      openAppDetail(target);
    } else if (!myApps.has(nudgeOpenId)) {
      // Retirée de « Mes Apps » depuis la notification : rien à ouvrir
      clearNudgeOpen();
    }
  }, [nudgeOpenId, activeTab, searchTerm, filteredApps, myApps]);

  // Remonter en haut au changement d'onglet ou de catégorie
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedCategory]);

  // Réinitialiser la catégorie en quittant l'onglet Applications
  useEffect(() => {
    if (activeTab !== TABS.APPLICATIONS) {
      setSelectedCategory('Toutes');
    }
  }, [activeTab]);

  const closeMigrationSelector = useCallback(() => setShowMigrationSelector(null), [setShowMigrationSelector]);

  useBackNavigation({
    activeTab,
    setActiveTab,
    selectedApp,
    closeAppDetail,
    showMigrationSelector,
    closeMigrationSelector,
    closables: [
      [showStorageManager, closeStorageManager],
      [showShareModal, () => setShowShareModal(false)],
      [showTrustiShareModal, () => setShowTrustiShareModal(false)],
      [!!pendingImport, cancelImport],
      [showExplainer, () => setShowExplainer(false)],
    ],
  });

  // Retrait d'une app de « Mes Apps » : toujours annulable
  const handleToggleMyApp = (e, id) => {
    const wasInMyApps = myApps.has(id);
    toggleMyApp(e, id);
    if (wasInMyApps) {
      toast.success('App retirée de Mes Apps', {
        label: 'Annuler',
        onClick: () => toggleMyApp({ stopPropagation: () => {} }, id),
      });
    }
  };

  const rescanPrompts = !flow.showRescan && (
    <RescanPrompts
      showAfterUninstall={flow.showRescanPrompt}
      showOnReopen={flow.showReopenPrompt}
      onScan={flow.startRescanFromPrompt}
      onDismissAfterUninstall={flow.dismissRescanPrompt}
      onDismissOnReopen={flow.dismissReopenPrompt}
    />
  );

  const migrationSelector = showMigrationSelector && (
    <MigrationSelectorModal
      currentAppId={showMigrationSelector}
      currentSelection={customMigrations.get(showMigrationSelector)}
      onSelect={(altName) => setCustomMigration(showMigrationSelector, altName)}
      onClose={closeMigrationSelector}
      onSelectApp={(app) => {
        closeMigrationSelector();
        openAppDetail(app);
      }}
      allApps={apps}
    />
  );

  if (showLandingPage) {
    return <LandingPage onClose={() => setShowLandingPage(false)} />;
  }

  // Onboarding : sélection des apps à la première visite
  if (flow.showOnboarding) {
    return (
      <AppsSelectionScreen
        manual={flow.forceManualOnboarding}
        onManualChange={flow.setForceManualOnboarding}
        onComplete={flow.completeOnboarding}
      />
    );
  }

  // Re-scan (depuis « Mes Apps » ou une proposition) : même écran, sans welcome
  if (flow.showRescan) {
    return (
      <AppsSelectionScreen
        manual={flow.forceManualRescan}
        onManualChange={flow.setForceManualRescan}
        onComplete={flow.completeRescan}
        autoStart={flow.rescanFromPrompt}
      />
    );
  }

  if (selectedApp) {
    return (
      <ViewModeContext.Provider value={isMobile}>
        <AppDetailModal
          key={selectedApp?.id}
          app={selectedApp}
          isInMyApps={myApps.has(selectedApp.id)}
          onToggleMyApp={handleToggleMyApp}
          onChangeAlternative={setShowMigrationSelector}
          onClose={closeAppDetail}
          onSelectApp={openAppDetail}
          onCompleteMigration={(from, to) => importMigrations([{ id: from.id, customAlt: to?.name }])}
          allApps={apps}
          resumeMigration={resumeMigrationId === selectedApp.id}
        />
        {rescanPrompts}
        {migrationSelector}
      </ViewModeContext.Provider>
    );
  }

  // Écran dédié « Espace de stockage » (page à part entière, pas une popup)
  if (showStorageManager) {
    return (
      <StoragePage
        onClose={closeStorageManager}
        myAppsCount={myApps.size}
        migrationsCount={migratedApps.size}
        myAppsData={myAppsData}
        isLoadingMyAppsData={isLoadingMyApps}
        onClearMyApps={clearMyApps}
        onClearMigrations={clearMigrations}
        onSelectApp={openAppDetail}
        nudgesEnabled={nudgesEnabled}
        onToggleNudges={toggleNudges}
        gradeAlertsEnabled={gradeAlertsEnabled}
        onToggleGradeAlerts={toggleGradeAlerts}
      />
    );
  }

  const isMyAppsTab = activeTab === TABS.MY_APPS;
  const showMyAppsCards = isMyAppsTab && !searchTerm.trim();

  // Vue principale
  return (
    <ViewModeContext.Provider value={isMobile}>
      <div className="min-h-screen bg-transparent font-sans text-slate-900">
        {isInitialLoading && <SplashScreen />}

        <Header
          onOpenStorageManager={() => setShowStorageManager(true)}
          onShowLandingPage={() => setShowLandingPage(true)}
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
            {!isMyAppsTab && (
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} isSearching={isSearching} />
            )}

            <div key={activeTab} style={{ animation: 'tabFadeIn 0.18s ease-out' }}>
              {activeTab === TABS.APPLICATIONS && (
                <CategoryFilterBar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  favoritesCount={favoriteApps.size}
                  isLoading={isLoadingApps}
                />
              )}

              {isMyAppsTab && (
                <MyAppsHeader
                  count={myApps.size}
                  isLoading={isLoadingMyApps}
                  onRescan={flow.startRescan}
                  onShare={() => setShowTrustiShareModal(true)}
                />
              )}

              {/* Bilan en une seule carte : TrustiScore du téléphone + migrations,
                  puis une ligne compacte d'hygiène numérique (mots de passe) */}
              {showMyAppsCards && (
                <>
                  <MyAppsSummary
                    apps={filteredApps}
                    onShareMigrations={migratedApps.size > 0 ? () => setShowShareModal(true) : undefined}
                  >
                    {myApps.size > 0 && <DataHygieneCard myApps={filteredApps} catalogApps={apps} />}
                  </MyAppsSummary>
                  <GradeChangesCard
                    changes={gradeChanges}
                    apps={filteredApps}
                    onSelectApp={openAppDetail}
                    onDismiss={dismissGradeChanges}
                  />
                  <MigrationsInProgressCard items={migrationsInProgress} onResume={resumeMigration} onAbandon={abandonMigration} />
                </>
              )}

              {/* Recherche + réglages (tri, filtres) sur une seule ligne, sous le
                  bilan, car ils portent sur les apps listées ci-dessous */}
              {isMyAppsTab && (
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} isSearching={isSearching} className="" />
                  </div>
                  {myApps.size > 0 && (
                    <MyAppsFilterMenu
                      sort={myAppsView.mySort}
                      onSortChange={myAppsView.setMySort}
                      migrationFilter={myAppsView.migrationFilter}
                      onMigrationFilterChange={myAppsView.setMigrationFilter}
                      alternativeFilter={myAppsView.alternativeFilter}
                      onAlternativeFilterChange={myAppsView.setAlternativeFilter}
                      migrationCounts={myAppsView.migrationCounts}
                      alternativeCounts={myAppsView.alternativeCounts}
                    />
                  )}
                </div>
              )}

              {isMyAppsTab && myApps.size > 0 && myAppsDisplayed.length < myAppsSorted.length && (
                <MyAppsFilterNotice
                  shown={myAppsDisplayed.length}
                  total={myAppsSorted.length}
                  migrationFilter={myAppsView.migrationFilter}
                  alternativeFilter={myAppsView.effectiveAlternativeFilter}
                  onShowAll={myAppsView.resetFilters}
                />
              )}

              {activeTab === TABS.TOP_ALTERNATIVES && <AwardsHeader isLoading={isLoadingApps} />}

              {showExplainer && (
                <ExplainerPanel onClose={() => setShowExplainer(false)} />
              )}

              <AppsList
                apps={isMyAppsTab ? myAppsDisplayed : filteredApps}
                activeTab={activeTab}
                myApps={myApps}
                favoriteApps={favoriteApps}
                migratedApps={migratedApps}
                customMigrations={customMigrations}
                onToggleMyApp={handleToggleMyApp}
                onToggleFavorite={toggleFavorite}
                onToggleMigrate={toggleMigrate}
                onSelectApp={openAppDetail}
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

        {showShareModal && (
          <ShareModal
            migratedApps={migratedApps}
            customMigrations={customMigrations}
            allApps={apps}
            sortedAppIds={myAppsSorted.map(app => app.id)}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {showTrustiShareModal && (
          <TrustiShareModal
            selectedApps={myAppsSorted}
            customMigrations={customMigrations}
            allApps={apps}
            onClose={() => setShowTrustiShareModal(false)}
          />
        )}

        {/* Import via lien de partage */}
        {pendingImport && (
          <ImportAppsModal
            appIds={pendingImport.appIds}
            migrations={pendingImport.migrations}
            onConfirm={confirmImport}
            onClose={cancelImport}
          />
        )}

        {migrationSelector}

        {flow.showWelcomeModal && (
          <WelcomeModal
            onFirstTimeYes={flow.acceptWelcome}
            // Sur l'APK, le scan est obligatoire : pas de bouton pour l'esquiver
            onFirstTimeNo={isNativeAndroid ? undefined : flow.declineWelcome}
          />
        )}

        {rescanPrompts}

        {/* Widget de chat Trusti masqué (composant TrustiChatWidget conservé, à réactiver ici) */}

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
  );
};

export default App;
