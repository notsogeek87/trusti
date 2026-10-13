import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers InstalledAppsPlugin (android/app/src/main/java/com/trusti/app/InstalledAppsPlugin.java).
 * getInstalledPackages() renvoie { packages: string[] } — les package names du catalogue
 * Trusti (android/app/src/main/res/values/trusti_catalog.xml) qui sont installés sur l'appareil.
 * uninstallPackage({ packageName }) ouvre la boîte de dialogue système de désinstallation pour
 * ce paquet (aucune désinstallation silencieuse, confirmation utilisateur native requise).
 * hasUsageAccess() renvoie { granted: boolean } — accès spécial "Usage" requis pour lire la
 * taille disque des autres apps (voir getAppSizes), à activer manuellement par l'utilisateur.
 * openUsageAccessSettings() ouvre l'écran système correspondant (aucun retour fiable : rappeler
 * hasUsageAccess() ensuite pour vérifier).
 * getAppSizes() renvoie { sizes: { [packageName]: bytes } } — taille (APK + données + cache) de
 * chaque app du catalogue installée ; liste vide si l'accès "Usage" n'est pas accordé ou sur une
 * version d'Android trop ancienne (< 8.0).
 * hasFullScan() renvoie { available: boolean } : vrai uniquement dans les APK des releases GitHub (la
 * permission QUERY_ALL_PACKAGES est retirée du build Google Play). getAllInstalledApps() renvoie alors
 * { apps: [{ packageName, label, system, launchable }] } : toutes les apps installées, lues en local.
 * N'existe et ne répond que dans l'app Android native ; ne pas appeler en dehors (voir isNativeAndroid).
 */
const InstalledApps = registerPlugin('InstalledApps');

export default InstalledApps;
