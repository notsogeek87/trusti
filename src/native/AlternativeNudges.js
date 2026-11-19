import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers AlternativeNudgesPlugin (android/app/src/main/java/eu/trusti/app/AlternativeNudgesPlugin.java),
 * point d'entrée du moteur de notifications Android (NotificationEngineWorker, voir
 * docs/guides/notifications.md). Une seule tâche de fond décide quoi notifier, avec un budget
 * commun à tous les types.
 *
 * - sync({ enabled, candidates }) : suggestions d'alternatives (voir src/utils/alternativeNudges.js).
 * - syncGradeAlerts({ enabled, apiUrl, apps: [{ appId }] }) : changements de note des apps suivies.
 * - syncEngine({ apiUrl, eventsEnabled, installAlertsEnabled, migrationRemindersEnabled, digestEnabled,
 *   migrations? }) : événements, nouvelles apps D/E installées, relances de migration, mode bilan
 *   mensuel (voir src/hooks/useNotificationCenter.js). Sans `migrations`, la dernière liste est gardée.
 * - getNotificationState() -> { history: [{ key, kind, appId, appName, title, text, at, priority }], muted: [appId] }
 * - consumeCompletedMigrations() -> { items: [{ appId, altName }] } : migrations vues terminées par le
 *   téléphone (alternative installée, app quittée désinstallée), à marquer comme faites.
 * - unmuteAll() : réactive les apps mises en sourdine depuis une notification.
 * - checkPermission() / requestPermission() -> { display: 'granted' | 'denied' | 'prompt' }
 *   (permission POST_NOTIFICATIONS, Android 13+).
 * - consumeOpenRequest() -> { appId?, action? } si Trusti a été ouvert depuis une notification ;
 *   l'événement 'openApp' ({ appId, action? }) signale un toucher quand Trusti était déjà ouvert.
 *   action : 'resumeMigration' pour ouvrir directement le parcours de migration.
 * N'existe que dans l'app Android native (voir isNativeAndroid).
 */
const AlternativeNudges = registerPlugin('AlternativeNudges');

export default AlternativeNudges;
