import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { TABS } from '../constants/tabs';
import { isNativeAndroid } from '../utils/platform';
import { runBackHandler } from '../utils/backHandlers';

/**
 * Bouton retour du navigateur (popstate) et bouton retour matériel Android
 * (événement Capacitor « backButton », que le WebView natif émet à la place
 * de popstate ; sans écouteur, l'app se fermerait même avec une fiche ouverte).
 *
 * Un écran plein (onboarding, import, proposition de rescan) enregistré via
 * utils/backHandlers prend la main en premier. Ensuite, dans l'ordre : le
 * sélecteur de migration, la fiche d'une app, puis (Android) les écrans et
 * modales listés dans `closables`, enfin « Mes Apps » ramène au catalogue.
 *
 * @param {object} params
 * @param {Array<[boolean, () => void]>} params.closables écrans fermables par
 *   le retour Android, dans l'ordre de priorité : [ouvert, fermer]
 */
export const useBackNavigation = ({
  activeTab,
  setActiveTab,
  selectedApp,
  closeAppDetail,
  showMigrationSelector,
  closeMigrationSelector,
  closables,
}) => {
  // Les écouteurs sont posés une fois et lisent l'état courant ici
  const latest = useRef();
  latest.current = { activeTab, setActiveTab, selectedApp, closeAppDetail, showMigrationSelector, closeMigrationSelector, closables };

  // Retour navigateur
  useEffect(() => {
    const handleBackButton = (event) => {
      // Écran plein : on réarme l'historique pour que le retour suivant reste dans l'app
      if (runBackHandler()) {
        window.history.pushState({ page: 'trusti' }, '');
        return;
      }
      const s = latest.current;
      if (s.showMigrationSelector) {
        event.preventDefault();
        s.closeMigrationSelector();
        return;
      }
      if (s.selectedApp) {
        event.preventDefault();
        s.closeAppDetail();
        return;
      }
      if (s.activeTab === TABS.MY_APPS) {
        event.preventDefault();
        s.setActiveTab(TABS.APPLICATIONS);
      }
      // Sinon, comportement par défaut
    };

    if (window.history.state === null) {
      window.history.pushState({ page: 'trusti' }, '');
    }
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  // Une entrée d'historique par fiche, sélecteur ou passage sur « Mes Apps »
  useEffect(() => {
    if (selectedApp || showMigrationSelector || activeTab === TABS.MY_APPS) {
      window.history.pushState({ page: 'trusti' }, '');
    }
  }, [selectedApp, showMigrationSelector, activeTab]);

  // Retour matériel Android
  useEffect(() => {
    if (!isNativeAndroid) return;

    let listenerHandle;
    let cancelled = false;

    CapacitorApp.addListener('backButton', () => {
      if (runBackHandler()) return;
      const s = latest.current;
      if (s.showMigrationSelector) {
        s.closeMigrationSelector();
        return;
      }
      if (s.selectedApp) {
        s.closeAppDetail();
        return;
      }
      const open = s.closables.find(([isOpen]) => isOpen);
      if (open) {
        open[1]();
        return;
      }
      if (s.activeTab === TABS.MY_APPS) {
        s.setActiveTab(TABS.APPLICATIONS);
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
  }, []);
};
