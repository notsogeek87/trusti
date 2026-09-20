/**
 * Contrat de données brutes partagé entre toute ApplicationSource (app installée
 * aujourd'hui, APK externe demain) et le TechnicalAnalyzer. Le moteur d'analyse
 * ne dépend JAMAIS de la provenance : il consomme uniquement cette forme.
 *
 * Ce fichier documente le contrat (utilisé aussi comme référence pour l'implémentation
 * native côté Android, voir android/app/src/main/java/com/trusti/app/TechnicalAnalysisPlugin.java)
 * et fournit un validateur/normaliseur léger.
 *
 * @typedef {Object} RawPackageData
 * @property {string} packageName
 * @property {boolean} componentsAvailable - false si le système n'a pas pu fournir la
 *   liste des composants du manifeste (permissions restreintes, source APK non encore
 *   parsée, etc.) — dans ce cas les tableaux components/metaDataKeys peuvent être vides
 *   sans que cela signifie "aucun composant".
 * @property {Object} appInfo - voir ApplicationInfo, champs bruts avant normalisation
 * @property {Array<{name: string, protectionLevel?: string, granted?: boolean|null}>} permissions
 * @property {{services: string[], receivers: string[], providers: string[], activities: string[]}} components
 *   Noms de classes pleinement qualifiés déclarés dans le manifeste (ex.
 *   "com.google.firebase.messaging.FirebaseMessagingService").
 * @property {string[]} metaDataKeys - Clés <meta-data> déclarées (app-level + par composant).
 *   On ne conserve que les clés, jamais les valeurs (peuvent contenir des identifiants/API keys).
 * @property {{activities: number, services: number, receivers: number, providers: number,
 *   exportedActivities: number, exportedServices: number, exportedReceivers: number,
 *   exportedProviders: number}|null} componentCounts - null si non déterminable.
 * @property {{totalSizeBytes: number, apkSizeBytes: number, dexCount: number,
 *   nativeLibraryCount: number, architectures: string[], isSplitApk: boolean,
 *   splitCount: number}|null} composition - null si non déterminable (ex. APK illisible).
 * @property {{debuggable: boolean, allowBackup: boolean, usesCleartextTraffic: boolean,
 *   networkSecurityConfigPresent: boolean, signingCertificatesSha256: string[],
 *   hasMultipleSigners: boolean|null}|null} security - null si non déterminable.
 */

const EMPTY_COMPONENTS = { services: [], receivers: [], providers: [], activities: [] };

/**
 * Normalise une charge brute (ex. reçue du pont Capacitor) vers un RawPackageData
 * complet, en comblant les champs manquants de façon explicite plutôt que de planter.
 * @param {Object} raw
 * @returns {RawPackageData}
 */
export function normalizeRawPackageData(raw = {}) {
  return {
    packageName: raw.packageName,
    componentsAvailable: raw.componentsAvailable !== false,
    appInfo: raw.appInfo || {},
    permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
    components: {
      services: raw.components?.services || EMPTY_COMPONENTS.services,
      receivers: raw.components?.receivers || EMPTY_COMPONENTS.receivers,
      providers: raw.components?.providers || EMPTY_COMPONENTS.providers,
      activities: raw.components?.activities || EMPTY_COMPONENTS.activities,
    },
    metaDataKeys: Array.isArray(raw.metaDataKeys) ? raw.metaDataKeys : [],
    componentCounts: raw.componentCounts || null,
    composition: raw.composition || null,
    security: raw.security || null,
  };
}

export default normalizeRawPackageData;
