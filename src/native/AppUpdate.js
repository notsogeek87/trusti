import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers AppUpdatePlugin (android/app/src/main/java/eu/trusti/app/AppUpdatePlugin.kt).
 * checkForUpdate() lance une recherche forcée de mise à jour ; si une version existe, la fenêtre
 * native guide l'installation. Résout { status, currentVersion, version?, message? } avec
 * status = 'available' | 'upToDate' | 'busy' | 'disabled' | 'error'.
 * N'existe que dans l'app Android native (voir isNativeAndroid).
 */
const AppUpdate = registerPlugin('AppUpdate');

export default AppUpdate;
