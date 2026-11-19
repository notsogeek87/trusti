import { useCallback, useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import AlternativeNudges from '../native/AlternativeNudges';
import { isNativeAndroid } from '../utils/platform';
import {
  shouldOfferPermission,
  markAsked,
  markLater,
  loadPromptState,
  savePromptState,
} from '../utils/notificationPermission';

/**
 * Permission de notifier (APK) : état courant, carte d'explication à proposer, réglages Android.
 * L'état est relu à chaque retour dans Trusti (la personne a pu changer d'avis dans les réglages).
 *
 * @param {{ hasApps: boolean, anyEnabled: boolean }} params
 *   hasApps : « Mes Apps » contient au moins une app ; anyEnabled : un type de notification est actif
 * @returns {{ permission: 'granted'|'denied'|'prompt'|null, showOffer: boolean,
 *   accept: () => Promise<void>, later: () => void, openSettings: () => void }}
 */
export const useNotificationPermission = ({ hasApps, anyEnabled }) => {
  const [permission, setPermission] = useState(null);
  const [state, setState] = useState(() => loadPromptState());

  const refresh = useCallback(() => {
    if (!isNativeAndroid) return;
    AlternativeNudges.checkPermission()
      .then(({ display }) => setPermission(display))
      .catch(() => setPermission(null));
  }, []);

  useEffect(() => {
    if (!isNativeAndroid) return undefined;
    refresh();
    let handle = null;
    let cancelled = false;
    CapacitorApp.addListener('resume', refresh).then((h) => {
      if (cancelled) h.remove(); else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [refresh]);

  const showOffer = shouldOfferPermission({ isNative: isNativeAndroid, permission, hasApps, anyEnabled, state });

  const accept = useCallback(async () => {
    const next = markAsked(state);
    savePromptState(next);
    setState(next);
    try {
      const { display } = await AlternativeNudges.requestPermission();
      setPermission(display);
    } catch {
      refresh();
    }
  }, [state, refresh]);

  const later = useCallback(() => {
    const next = markLater(state);
    savePromptState(next);
    setState(next);
  }, [state]);

  const openSettings = useCallback(() => {
    AlternativeNudges.openSettings().catch(() => {});
  }, []);

  return { permission, showOffer, accept, later, openSettings };
};

export default useNotificationPermission;
