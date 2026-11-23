import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_URL, appsUrl } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';
import { isNativeAndroid } from '../utils/platform';
import AlternativeNudges from '../native/AlternativeNudges';
import { getMigrationsInProgress } from '../utils/migrationGuide';
import { getAllMigrationGuideStates, getMigrationGuideTimestamps } from '../utils/migrationGuideStorage';
import { isMyAppsListSettled } from '../utils/alternativeNudges';
import {
  buildInboxItems,
  buildMonthlyDigest,
  buildMigrationSync,
  initialInboxState,
  unreadItems,
  markRead,
  loadInboxState,
  saveInboxState,
} from '../utils/notificationInbox';

const CACHE_TTL = 60 * 60 * 1000; // 1 h : les notes changent au plus quelques fois par semaine
// 5 min : un événement publié doit apparaître au prochain lancement (le cache local survit au
// redémarrage de l'app) ; le serveur et le CDN cachent déjà la réponse (30 s et 5 min).
const EVENTS_CACHE_TTL = 5 * 60 * 1000;

/**
 * Centre de notifications (web et APK) : boîte de réception de la cloche du header, et
 * synchronisation du moteur de notifications Android (NotificationEngineWorker).
 *
 * - Deux requêtes publiques, les mêmes pour tous (événements et changements de note des
 *   90 derniers jours) ; le tri entre « mes apps » et le reste se fait sur l'appareil.
 * - Sur l'APK : réglages et parcours de migration en cours transmis au natif, historique
 *   des notifications envoyées (installations, migrations terminées, bilans) relu pour la
 *   boîte de réception, migrations détectées comme terminées remontées via onMigrationsCompleted.
 *
 * @param {{
 *   myApps: Set<string>, ready: boolean,
 *   myAppsList: object[], isMyAppsTab: boolean, migratedApps: Set<string>, catalogApps: object[],
 *   settings: { events: boolean, installs: boolean, migrationReminders: boolean, digest: boolean },
 *   onMigrationsCompleted: (items: Array<{appId: string, altName: string|null}>) => void,
 * }} params
 */
export const useNotificationCenter = ({
  myApps, ready, myAppsList, isMyAppsTab, migratedApps, catalogApps, settings, onMigrationsCompleted,
}) => {
  const [events, setEvents] = useState(null);
  const [gradeChanges, setGradeChanges] = useState(null);
  const [nativeHistory, setNativeHistory] = useState([]);
  const [migrations, setMigrations] = useState(null);
  const [state, setState] = useState(() => loadInboxState());
  const hasApps = myApps.size > 0;

  // Retour au premier plan (APK : l'app reprend sans recharger le JS) : on relit les données
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') setRefreshTick(n => n + 1); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Données publiques : au lancement et à chaque retour dans l'app (caches 5 min / 1 h)
  useEffect(() => {
    if (!ready || !hasApps) return undefined;
    let cancelled = false;
    Promise.allSettled([
      cachedFetchJSON(`${API_URL}/app-events`, { ttl: EVENTS_CACHE_TTL }),
      cachedFetchJSON(appsUrl('grade_changes_since=true'), { ttl: CACHE_TTL }),
    ]).then(([ev, gr]) => {
      if (cancelled) return;
      // Échec (hors ligne, table pas encore créée) : on garde la liste connue, sinon liste vide
      if (ev.status === 'fulfilled' && Array.isArray(ev.value?.events)) setEvents(ev.value.events);
      else setEvents(prev => prev || []);
      if (gr.status === 'fulfilled' && Array.isArray(gr.value?.changes)) setGradeChanges(gr.value.changes);
      else setGradeChanges(prev => prev || []);
    });
    return () => { cancelled = true; };
  }, [ready, hasApps, refreshTick]);

  // APK : historique des notifications natives et migrations terminées détectées par le téléphone
  const completedRef = useRef(onMigrationsCompleted);
  completedRef.current = onMigrationsCompleted;
  const refreshNative = useCallback(() => {
    if (!isNativeAndroid) return;
    AlternativeNudges.getNotificationState()
      .then(({ history }) => setNativeHistory(Array.isArray(history) ? history : []))
      .catch(() => {});
    AlternativeNudges.consumeCompletedMigrations()
      .then(({ items }) => { if (Array.isArray(items) && items.length > 0) completedRef.current?.(items); })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (ready) refreshNative();
  }, [ready, refreshNative]);

  // Parcours de migration en cours (recalculés à chaque affichage complet de « Mes Apps »)
  useEffect(() => {
    if (!isMyAppsTab || !isMyAppsListSettled(myAppsList)) return;
    const timestamps = getMigrationGuideTimestamps();
    const states = Object.fromEntries(Object.entries(getAllMigrationGuideStates())
      .map(([id, s]) => [id, { ...s, updatedAt: timestamps[id] || null }]));
    const mine = (myAppsList || []).filter(app => myApps.has(app.id));
    const next = buildMigrationSync(getMigrationsInProgress(states, mine, { migratedApps, catalogApps }), catalogApps);
    setMigrations(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [isMyAppsTab, myAppsList, myApps, migratedApps, catalogApps]);

  // APK : réglages et migrations -> moteur natif
  useEffect(() => {
    if (!isNativeAndroid || !ready) return;
    AlternativeNudges.syncEngine({
      apiUrl: API_URL,
      eventsEnabled: settings.events && hasApps,
      installAlertsEnabled: settings.installs,
      migrationRemindersEnabled: settings.migrationReminders,
      digestEnabled: settings.digest,
      // null tant que « Mes Apps » n'a pas été affiché : le natif garde alors la dernière liste connue
      ...(migrations ? { migrations } : {}),
    }).catch((error) => console.error('Synchronisation des notifications impossible:', error));
  }, [ready, hasApps, settings.events, settings.installs, settings.migrationReminders, settings.digest, migrations]);

  const items = useMemo(() => buildInboxItems({
    events, gradeChanges, myAppIds: myApps, migrations, nativeHistory,
  }), [events, gradeChanges, myApps, migrations, nativeHistory]);

  // Premier passage : ce qui existe déjà est considéré comme lu (pas de badge « 12 » d'emblée)
  const loaded = events !== null && gradeChanges !== null;
  useEffect(() => {
    if (state || !loaded) return;
    const first = initialInboxState(items);
    saveInboxState(first);
    setState(first);
  }, [state, loaded, items]);

  const unread = useMemo(() => unreadItems(items, state), [items, state]);
  const unreadKeys = useMemo(() => new Set(unread.map(i => i.key)), [unread]);
  const digest = useMemo(() => buildMonthlyDigest(items), [items]);

  const markAllRead = useCallback(() => {
    if (unread.length === 0) return;
    const next = markRead(state, unread);
    saveInboxState(next);
    setState(next);
  }, [state, unread]);

  return { items, unreadKeys, unreadCount: unread.length, digest, markAllRead, refreshNative };
};

export default useNotificationCenter;
