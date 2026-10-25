import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers AlternativeNudgesPlugin (android/app/src/main/java/eu/trusti/app/AlternativeNudgesPlugin.java).
 * sync({ enabled, candidates }) transmet les apps à suggérer (voir src/utils/alternativeNudges.js)
 * et programme (ou annule) la tâche périodique qui envoie au plus une notification par semaine.
 * checkPermission() / requestPermission() résolvent { display: 'granted' | 'denied' | 'prompt' }
 * (permission POST_NOTIFICATIONS, Android 13+).
 * consumeOpenRequest() renvoie { appId? } si Trusti a été ouvert depuis une notification ;
 * l'événement 'openApp' ({ appId }) signale un toucher quand Trusti était déjà ouvert.
 * N'existe que dans l'app Android native (voir isNativeAndroid).
 */
const AlternativeNudges = registerPlugin('AlternativeNudges');

export default AlternativeNudges;
