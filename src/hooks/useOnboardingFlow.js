import { useState, useEffect, useRef } from 'react';
import { TABS } from '../constants/tabs';
import { hasShareParams } from '../utils/shareUtils';
import { hasCompletedOnboarding, markOnboardingComplete } from '../utils/onboardingStorage';
import { isNativeAndroid } from '../utils/platform';
import { APP_UNINSTALLED_EVENT } from '../utils/uninstallWatcher';
import InstalledApps from '../native/InstalledApps';
import { loadPackagesSnapshot, savePackagesSnapshot, packagesChanged, markRescanPromptHandled, isWebPromptDue } from '../utils/rescanPrompt';

const scrollToTopSoon = () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
};

/**
 * Parcours de sélection des apps : bienvenue et onboarding (une seule fois
 * par appareil), re-scan manuel depuis « Mes Apps », et propositions de
 * re-scan (après une désinstallation, ou à la réouverture de l'app).
 *
 * Le scan natif (APK) remonte aussi les apps confirmées désinstallées, qu'on
 * retire de « Mes Apps ». La sélection manuelle (PWA/web, sans lecture réelle
 * du téléphone) reste purement additive.
 */
export const useOnboardingFlow = ({
  isInitialized,
  myApps,
  addMyApps,
  removeMyApps,
  setActiveTab,
  setSelectedApp,
  closeStorageManager,
  showLandingPage,
}) => {
  // Arrivée via un lien de partage ? (évalué au montage, avant que l'URL ne
  // soit nettoyée). On court-circuite alors le welcome/onboarding pour aller
  // droit à la modal d'import.
  const [arrivedViaShare] = useState(() => hasShareParams());

  // Onboarding une seule fois par appareil, indépendamment de la connexion :
  // PWA/APK sauvegardent en local (voir useAuth).
  const [showWelcomeModal, setShowWelcomeModal] = useState(
    () => !hasCompletedOnboarding() && !arrivedViaShare
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Sur Android natif, l'utilisateur peut basculer du scan auto vers la sélection manuelle
  const [forceManualOnboarding, setForceManualOnboarding] = useState(false);

  const [showRescan, setShowRescan] = useState(false);
  const [forceManualRescan, setForceManualRescan] = useState(false);
  // Rescan accepté depuis une proposition : sur l'APK, le scan natif démarre
  // directement ; sur le web, l'écran des deux choix s'affiche.
  const [rescanFromPrompt, setRescanFromPrompt] = useState(false);
  // Proposition après une désinstallation confirmée depuis Trusti
  const [showRescanPrompt, setShowRescanPrompt] = useState(false);
  // Proposition à la réouverture de l'app (web et APK)
  const [showReopenPrompt, setShowReopenPrompt] = useState(false);

  // Arrivée via lien de partage = engagement suffisant pour ne pas reproposer
  // le welcome/onboarding ensuite sur cet appareil.
  useEffect(() => {
    if (arrivedViaShare) markOnboardingComplete();
  }, [arrivedViaShare]);

  // Mémorise l'état « vu » des apps : packages installés (APK) et date de la
  // dernière proposition/scan, pour ne reproposer un scan que si nécessaire.
  const rememberRescanState = () => {
    markRescanPromptHandled();
    if (!isNativeAndroid) return;
    InstalledApps.getInstalledPackages()
      .then(res => savePackagesSnapshot(res.packages || []))
      .catch(() => {});
  };

  // Web (hors APK) : si aucune app n'est sélectionnée à l'ouverture, on
  // propose directement l'écran de sélection. Une seule fois par session, et
  // jamais par-dessus le welcome ou un lien de partage.
  const autoSelectionShown = useRef(false);
  useEffect(() => {
    if (autoSelectionShown.current || !isInitialized || isNativeAndroid) return;
    if (arrivedViaShare || showWelcomeModal || showOnboarding) return;
    autoSelectionShown.current = true;
    if (myApps.size === 0) setShowOnboarding(true);
  }, [isInitialized, myApps, arrivedViaShare, showWelcomeModal, showOnboarding]);

  // Réouverture de l'app : on propose de relancer un scan seulement si utile
  // (voir utils/rescanPrompt.js : APK = apps réellement changées, web = au
  // plus une fois par semaine). Décidé une seule fois, au chargement : pas
  // pour une première visite, un lien de partage, ni sur le web sans app (la
  // sélection s'ouvre déjà toute seule, voir ci-dessus).
  const reopenPromptDecided = useRef(false);
  useEffect(() => {
    if (reopenPromptDecided.current || !isInitialized) return;
    reopenPromptDecided.current = true;
    if (arrivedViaShare || showWelcomeModal || showOnboarding || showLandingPage || showRescan) return;
    if (!isNativeAndroid && myApps.size === 0) return;
    if (!isNativeAndroid) {
      if (isWebPromptDue()) setShowReopenPrompt(true);
      return;
    }
    InstalledApps.getInstalledPackages()
      .then(res => {
        const current = res.packages || [];
        const previous = loadPackagesSnapshot();
        if (previous === null) {
          // Pas encore de référence (mise à jour de l'app) : on l'enregistre
          // sans déranger l'utilisateur.
          savePackagesSnapshot(current);
          return;
        }
        if (packagesChanged(previous, current)) setShowReopenPrompt(true);
      })
      .catch(() => {});
  }, [isInitialized, myApps, arrivedViaShare, showWelcomeModal, showOnboarding, showLandingPage, showRescan]);

  // Après une désinstallation confirmée depuis Trusti : propose un re-scan
  useEffect(() => {
    const onUninstalled = () => setShowRescanPrompt(true);
    window.addEventListener(APP_UNINSTALLED_EVENT, onUninstalled);
    return () => window.removeEventListener(APP_UNINSTALLED_EVENT, onUninstalled);
  }, []);

  // « Oui, c'est ma première fois »
  const acceptWelcome = () => {
    markOnboardingComplete();
    setShowWelcomeModal(false);
    setShowOnboarding(true);
  };

  // « Non, je connais déjà »
  const declineWelcome = () => {
    markOnboardingComplete();
    setShowWelcomeModal(false);
  };

  const completeOnboarding = (selectedAppIds) => {
    // Sélection faite, passée ou quittée : ne pas la rouvrir d'office (web, aucune app)
    autoSelectionShown.current = true;
    // Ajout simple : une app déjà suivie ne doit pas être retirée
    if (selectedAppIds && selectedAppIds.size > 0) {
      addMyApps([...selectedAppIds].map(String));
    }
    setShowOnboarding(false);
    rememberRescanState();
    // « Mes Apps » dès qu'il y a une app (choisie maintenant ou déjà suivie), sinon le catalogue
    const hasApps = (selectedAppIds && selectedAppIds.size > 0) || myApps.size > 0;
    setActiveTab(hasApps ? TABS.MY_APPS : TABS.APPLICATIONS);
    scrollToTopSoon();
  };

  const startRescan = () => setShowRescan(true);

  const completeRescan = (selectedAppIds, notInstalledIds) => {
    rememberRescanState();
    if (notInstalledIds && notInstalledIds.length > 0) {
      removeMyApps(notInstalledIds);
    }
    if (selectedAppIds && selectedAppIds.size > 0) {
      addMyApps([...selectedAppIds].map(String));
    }
    setShowRescan(false);
    setForceManualRescan(false);
    setRescanFromPrompt(false);
    // Même règle qu'à la fin de l'onboarding
    const remaining = new Set([...myApps].map(String));
    (notInstalledIds || []).forEach(id => remaining.delete(String(id)));
    (selectedAppIds ? [...selectedAppIds] : []).forEach(id => remaining.add(String(id)));
    setActiveTab(remaining.size > 0 ? TABS.MY_APPS : TABS.APPLICATIONS);
  };

  const startRescanFromPrompt = () => {
    setShowRescanPrompt(false);
    setShowReopenPrompt(false);
    setSelectedApp(null);
    closeStorageManager();
    setActiveTab(TABS.MY_APPS);
    setRescanFromPrompt(true);
    setShowRescan(true);
  };

  const dismissRescanPrompt = () => setShowRescanPrompt(false);

  // Refus à la réouverture : on atterrit sur « Mes Apps »
  const dismissReopenPrompt = () => {
    setShowReopenPrompt(false);
    rememberRescanState();
    setActiveTab(TABS.MY_APPS);
  };

  return {
    showWelcomeModal,
    acceptWelcome,
    declineWelcome,
    showOnboarding,
    forceManualOnboarding,
    setForceManualOnboarding,
    completeOnboarding,
    showRescan,
    forceManualRescan,
    setForceManualRescan,
    rescanFromPrompt,
    startRescan,
    completeRescan,
    showRescanPrompt,
    showReopenPrompt,
    startRescanFromPrompt,
    dismissRescanPrompt,
    dismissReopenPrompt,
  };
};
