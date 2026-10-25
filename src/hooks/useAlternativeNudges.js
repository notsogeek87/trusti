import { useEffect, useState } from 'react';
import AlternativeNudges from '../native/AlternativeNudges';
import { isNativeAndroid } from '../utils/platform';
import {
  buildNudgeCandidates,
  isMyAppsListSettled,
  wasNudgePermissionAsked,
  markNudgePermissionAsked,
} from '../utils/alternativeNudges';

/**
 * Suggestions d'alternatives par notification (Android natif uniquement).
 * - À chaque affichage complet de « Mes Apps », recalcule les apps à suggérer et les transmet
 *   au natif, qui décide seul (même Trusti fermé) quand envoyer une notification.
 * - Demande la permission de notifier une seule fois, dès qu'une suggestion est possible.
 * - Renvoie l'id de l'app ouverte depuis une notification (null sinon) et de quoi l'acquitter.
 *
 * @param {{ myAppsList: object[], isMyAppsTab: boolean, migratedApps: Set<string>,
 *   customMigrations: Map<string, string>, enabled: boolean }} params
 */
export const useAlternativeNudges = ({ myAppsList, isMyAppsTab, migratedApps, customMigrations, enabled }) => {
  const [openRequestId, setOpenRequestId] = useState(null);
  const [candidates, setCandidates] = useState(null);

  // Toucher une notification : au démarrage à froid, puis quand Trusti est déjà ouvert
  useEffect(() => {
    if (!isNativeAndroid) return undefined;
    let cancelled = false;
    let handle = null;
    AlternativeNudges.consumeOpenRequest()
      .then(({ appId }) => { if (!cancelled && appId) setOpenRequestId(appId); })
      .catch(() => {});
    AlternativeNudges.addListener('openApp', ({ appId }) => {
      if (appId) setOpenRequestId(appId);
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

  // Synchronisation vers le natif, puis demande unique de la permission
  useEffect(() => {
    // Sans candidates encore calculées, on ne transmet qu'une désactivation
    if (!isNativeAndroid || (!candidates && enabled)) return;
    AlternativeNudges.sync({ enabled, candidates: candidates || [] }).catch((error) => {
      console.error('Synchronisation des suggestions impossible:', error);
    });

    if (enabled && candidates?.length > 0 && !wasNudgePermissionAsked()) {
      markNudgePermissionAsked();
      AlternativeNudges.checkPermission()
        .then(({ display }) => (display === 'prompt' ? AlternativeNudges.requestPermission() : null))
        .catch(() => {});
    }
  }, [candidates, enabled]);

  return {
    openRequestId,
    clearOpenRequest: () => setOpenRequestId(null),
  };
};
