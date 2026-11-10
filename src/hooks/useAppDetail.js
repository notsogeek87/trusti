import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';

/**
 * Ouverture / fermeture de la fiche d'une app : remonte en haut à
 * l'ouverture, restaure la position de défilement à la fermeture, et
 * mémorise un parcours de migration à reprendre.
 */
export const useAppDetail = ({ selectedApp, setSelectedApp }) => {
  const savedScrollY = useRef(0);
  const shouldRestoreScroll = useRef(false);

  // Parcours de migration guidée à rouvrir avec la fiche
  const [resumeMigrationId, setResumeMigrationId] = useState(null);
  // Fiche fermée par n'importe quel chemin (bouton retour compris) : on oublie la reprise
  useEffect(() => {
    if (!selectedApp) setResumeMigrationId(null);
  }, [selectedApp]);

  const openAppDetail = useCallback((app) => {
    savedScrollY.current = window.scrollY;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedApp(app);
  }, [setSelectedApp]);

  const closeAppDetail = useCallback(() => {
    setResumeMigrationId(null);
    shouldRestoreScroll.current = true;
    setSelectedApp(null);
  }, [setSelectedApp]);

  const resumeMigration = useCallback((app) => {
    setResumeMigrationId(app.id);
    openAppDetail(app);
  }, [openAppDetail]);

  // useLayoutEffect = synchrone avant le paint, évite le flash « retour en haut »
  useLayoutEffect(() => {
    if (!selectedApp && shouldRestoreScroll.current) {
      shouldRestoreScroll.current = false;
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    }
  }, [selectedApp]);

  return { openAppDetail, closeAppDetail, resumeMigration, resumeMigrationId };
};
