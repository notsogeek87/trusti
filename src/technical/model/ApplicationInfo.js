/**
 * @typedef {Object} ApplicationInfo
 * Informations générales de l'application, récupérées lorsque l'API Android le permet.
 * Tout champ non déterminable reste `null` — ne jamais inventer une valeur.
 *
 * @property {string} name
 * @property {string} packageName
 * @property {string|null} versionName
 * @property {number|null} versionCode
 * @property {number|null} minSdkVersion
 * @property {number|null} targetSdkVersion
 * @property {number|null} sizeBytes
 * @property {boolean|null} isSystemApp
 * @property {number|null} firstInstallTime - timestamp ms
 * @property {number|null} lastUpdateTime - timestamp ms
 * @property {string|null} installerPackageName
 * @property {string|null} apkPath
 * @property {string[]} splitApkPaths
 */

const EMPTY = null;

/**
 * Normalise les infos générales brutes (venant du plugin natif ou d'une future
 * source APK) vers un ApplicationInfo propre.
 * @param {Object} raw
 * @returns {ApplicationInfo}
 */
export function createApplicationInfo(raw = {}) {
  return {
    name: raw.name || raw.packageName || 'Application inconnue',
    packageName: raw.packageName,
    versionName: raw.versionName ?? EMPTY,
    versionCode: raw.versionCode ?? EMPTY,
    minSdkVersion: raw.minSdkVersion ?? EMPTY,
    targetSdkVersion: raw.targetSdkVersion ?? EMPTY,
    sizeBytes: raw.sizeBytes ?? EMPTY,
    isSystemApp: raw.isSystemApp ?? EMPTY,
    firstInstallTime: raw.firstInstallTime ?? EMPTY,
    lastUpdateTime: raw.lastUpdateTime ?? EMPTY,
    installerPackageName: raw.installerPackageName ?? EMPTY,
    apkPath: raw.apkPath ?? EMPTY,
    splitApkPaths: Array.isArray(raw.splitApkPaths) ? raw.splitApkPaths : [],
  };
}

export default createApplicationInfo;
