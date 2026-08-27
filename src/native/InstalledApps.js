import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers InstalledAppsPlugin (android/app/src/main/java/app/trusti/mobile/InstalledAppsPlugin.java).
 * getInstalledPackages() renvoie { packages: string[] } — les package names du catalogue
 * Trusti (android/app/src/main/res/values/trusti_catalog.xml) qui sont installés sur l'appareil.
 * N'existe et ne répond que dans l'app Android native ; ne pas appeler en dehors (voir isNativeAndroid).
 */
const InstalledApps = registerPlugin('InstalledApps');

export default InstalledApps;
