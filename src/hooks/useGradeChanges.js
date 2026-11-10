import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';
import { isNativeAndroid } from '../utils/platform';
import AlternativeNudges from '../native/AlternativeNudges';
import {
  sinceForState,
  pendingGradeChanges,
  initialState,
  acknowledge,
  loadGradeChangesState,
  saveGradeChangesState,
} from '../utils/gradeChanges';

const CACHE_TTL = 60 * 60 * 1000; // 1 h : les notes changent au plus quelques fois par semaine

/**
 * Changements de note des apps de « Mes Apps » depuis la dernière visite (web et APK).
 * Une requête publique (la même pour tous) ; le filtre sur les apps suivies se fait en local.
 *
 * Sur l'APK, transmet aussi les ids suivis au natif (GradeChangeWorker), qui notifie les
 * changements même Trusti fermé.
 *
 * @param {{ myApps: Set<string>, ready: boolean, active: boolean, alertsEnabled: boolean }} params
 *   ready : « Mes Apps » chargé depuis le stockage ; active : onglet « Mes Apps » affiché ; alertsEnabled : réglage des notifications (APK)
 * @returns {{ changes: object[], dismiss: () => void }}
 */
export const useGradeChanges = ({ myApps, ready, active, alertsEnabled }) => {
  const [catalogChanges, setCatalogChanges] = useState(null);
  const [state, setState] = useState(() => loadGradeChangesState());

  useEffect(() => {
    if (!active || catalogChanges || myApps.size === 0) return undefined;
    let cancelled = false;
    const since = sinceForState(state);
    cachedFetchJSON(`${API_URL}/apps?grade_changes_since=${since}`, { ttl: CACHE_TTL })
      .then((data) => {
        if (cancelled || !Array.isArray(data?.changes)) return;
        setCatalogChanges(data.changes);
        if (!state) {
          const first = initialState(data.changes);
          saveGradeChangesState(first);
          setState(first);
        }
      })
      .catch(() => {}); // hors connexion : pas de carte, on réessaiera
    return () => { cancelled = true; };
  }, [active, catalogChanges, myApps.size]); // eslint-disable-line react-hooks/exhaustive-deps

  // APK : apps suivies -> natif (seulement les ids ; noms et notes viennent de l'API)
  const trackedKey = [...myApps].map(String).sort().join(',');
  useEffect(() => {
    if (!isNativeAndroid || !ready) return;
    const apps = trackedKey ? trackedKey.split(',').map(appId => ({ appId })) : [];
    AlternativeNudges.syncGradeAlerts({ enabled: alertsEnabled && apps.length > 0, apiUrl: API_URL, apps })
      .catch((error) => console.error('Synchronisation des alertes de note impossible:', error));
  }, [trackedKey, alertsEnabled, ready]);

  const changes = pendingGradeChanges(catalogChanges, myApps, state);

  const dismiss = useCallback(() => {
    const next = acknowledge(state, changes);
    saveGradeChangesState(next);
    setState(next);
  }, [state, changes]);

  return { changes, dismiss };
};

export default useGradeChanges;
