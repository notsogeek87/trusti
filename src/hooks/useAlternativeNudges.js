import { useEffect, useState } from 'react';
import AlternativeNudges from '../native/AlternativeNudges';
import { isNativeAndroid } from '../utils/platform';
import { buildNudgeCandidates, isMyAppsListSettled } from '../utils/alternativeNudges';

/**
 * Suggestions d'alternatives par notification (Android natif uniquement).
 * - À chaque affichage complet de « Mes Apps », recalcule les apps à suggérer et les transmet
 *   au natif, qui décide seul (même Trusti fermé) quand envoyer une notification.
 * - Renvoie l'app ouverte depuis une notification ({ appId, action }, null sinon) et de quoi l'acquitter.
 *
 * @param {{ myAppsList: object[], isMyAppsTab: boolean, migratedApps: Set<string>,
 *   customMigrations: Map<string, string>, enabled: boolean }} params
 */
export const useAlternativeNudges = ({ myAppsList, isMyAppsTab, migratedApps, customMigrations, enabled }) => {
  // { appId, action? } : action 'resumeMigration' (bouton « Reprendre » / « Démarrer la migration »)
  const [openRequest, setOpenRequest] = useState(null);
  const [candidates, setCandidates] = useState(null);

  // Toucher une notification : au démarrage à froid, puis quand Trusti est déjà ouvert
  useEffect(() => {
    if (!isNativeAndroid) return undefined;
    let cancelled = false;
    let handle = null;
    AlternativeNudges.consumeOpenRequest()
      .then(({ appId, action }) => { if (!cancelled && appId) setOpenRequest({ appId, action: action || null }); })
      .catch(() => {});
    AlternativeNudges.addListener('openApp', ({ appId, action }) => {
      if (appId) setOpenRequest({ appId, action: action || null });
    }).then((h) => {
      if (cancelled) h.remove(); else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, []);

  // Liste « Mes Apps » complète : on recalcule les candidates (même valeur gardée si rien ne change)
  useEffect(() => {
    if (!isNativeAndroid || !isMyAppsTab || !isMyAppsListSettled(myAppsList)) return;
    const next = buildNudgeCandidates(myAppsList, { migratedApps, customMigrations });
    setCandidates(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [myAppsList, isMyAppsTab, migratedApps, customMigrations]);

  // Synchronisation vers le natif (la permission est demandée par useNotificationPermission)
  useEffect(() => {
    // Sans candidates encore calculées, on ne transmet qu'une désactivation
    if (!isNativeAndroid || (!candidates && enabled)) return;
    AlternativeNudges.sync({ enabled, candidates: candidates || [] }).catch((error) => {
      console.error('Synchronisation des suggestions impossible:', error);
    });
  }, [candidates, enabled]);

  return {
    openRequest,
    clearOpenRequest: () => setOpenRequest(null),
  };
};
