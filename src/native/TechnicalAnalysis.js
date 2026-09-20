import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers TechnicalAnalysisPlugin
 * (android/app/src/main/java/com/trusti/app/TechnicalAnalysisPlugin.java).
 *
 * analyzePackage({ packageName }) renvoie un RawPackageData brut (voir
 * src/technical/source/RawPackageData.js) : infos générales, permissions
 * déclarées/accordées, composants du manifeste (services/receivers/providers/
 * activities) et clés de méta-données. Purement local — aucune donnée n'est
 * envoyée à un serveur par ce plugin.
 *
 * N'existe et ne répond que dans l'app Android native (voir isNativeAndroid) ;
 * requiert que le paquet demandé fasse partie des <queries> déclarées dans le
 * manifeste (même contrainte que InstalledAppsPlugin).
 */
const TechnicalAnalysisPlugin = registerPlugin('TechnicalAnalysis');

export default TechnicalAnalysisPlugin;
