import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers SystemCleanerPlugin (android/app/src/main/java/eu/trusti/app/SystemCleanerPlugin.java).
 * getAccessState() renvoie { supported, granted } — "Accès à tous les fichiers" (Android 11+),
 * absent du build Play Store (voir src/release/AndroidManifest.xml).
 * openAccessSettings() ouvre l'écran système ; rappeler getAccessState() au retour.
 * scan({ filters }) renvoie { results: [{ id, count, bytes, preview: string[] }], truncated } ;
 * ne supprime rien. Les filtres viennent de src/cleaner/filters.js.
 * deleteFilters({ ids }) supprime ce que le dernier scan a trouvé pour ces filtres (aucun chemin
 * ne transite par le JS) et renvoie { deleted, failed, freedBytes }.
 * N'existe que dans l'app Android native (voir isNativeAndroid).
 */
const SystemCleaner = registerPlugin('SystemCleaner');

export default SystemCleaner;
