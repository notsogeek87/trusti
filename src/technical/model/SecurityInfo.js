import { DetectionStatus } from './DetectionStatus.js';

/**
 * @typedef {Object} SecurityInfo
 * Caractéristiques de sécurité détectées — jamais un verdict ("sécurisée" /
 * "non sécurisée"), uniquement des paramètres factuels tels que déclarés dans
 * le manifeste ou la signature de l'APK.
 *
 * @property {boolean} dataAvailable
 * @property {number|null} targetSdkVersion
 * @property {number|null} minSdkVersion
 * @property {string} debuggable - DetectionStatus
 * @property {string} allowBackup - DetectionStatus
 * @property {string} usesCleartextTraffic - DetectionStatus (déclaratif : reflète le drapeau du
 *   manifeste, qui peut être affiné par un Network Security Config par domaine non analysé ici)
 * @property {string} networkSecurityConfigPresent - DetectionStatus (toujours UNKNOWN : aucun champ
 *   public de l'API Android n'expose la présence d'un Network Security Config personnalisé)
 * @property {string} customPinnedCertificates - DetectionStatus (toujours UNKNOWN pour l'instant :
 *   nécessiterait de parser le XML du Network Security Config, non fait dans cette version)
 * @property {number|null} exportedComponentCount
 * @property {string[]} signingCertificatesSha256
 * @property {string} hasMultipleSigners - DetectionStatus
 * @property {string} signatureScheme - DetectionStatus (toujours UNKNOWN : la version du schéma de
 *   signature APK v1/v2/v3 n'est pas exposée par l'API publique PackageManager)
 */

const boolToStatus = (value) => {
  if (value === true) return DetectionStatus.DETECTED;
  if (value === false) return DetectionStatus.NOT_DETECTED;
  return DetectionStatus.UNKNOWN;
};

/**
 * @param {Object|null} rawSecurity - rawData.security
 * @param {Object|null} rawAppInfo - rawData.appInfo (pour targetSdk/minSdk)
 * @param {Object|null} rawComponentCounts - rawData.componentCounts
 * @returns {SecurityInfo}
 */
export function createSecurityInfo(rawSecurity, rawAppInfo, rawComponentCounts) {
  const dataAvailable = !!rawSecurity;
  const counts = rawComponentCounts || {};
  const exportedComponentCount = rawComponentCounts
    ? (counts.exportedActivities || 0) + (counts.exportedServices || 0) +
      (counts.exportedReceivers || 0) + (counts.exportedProviders || 0)
    : null;

  return {
    dataAvailable,
    targetSdkVersion: rawAppInfo?.targetSdkVersion ?? null,
    minSdkVersion: rawAppInfo?.minSdkVersion ?? null,
    debuggable: dataAvailable ? boolToStatus(rawSecurity.debuggable) : DetectionStatus.UNKNOWN,
    allowBackup: dataAvailable ? boolToStatus(rawSecurity.allowBackup) : DetectionStatus.UNKNOWN,
    usesCleartextTraffic: dataAvailable ? boolToStatus(rawSecurity.usesCleartextTraffic) : DetectionStatus.UNKNOWN,
    networkSecurityConfigPresent: DetectionStatus.UNKNOWN,
    customPinnedCertificates: DetectionStatus.UNKNOWN,
    exportedComponentCount,
    signingCertificatesSha256: rawSecurity?.signingCertificatesSha256 || [],
    hasMultipleSigners: dataAvailable ? boolToStatus(rawSecurity.hasMultipleSigners) : DetectionStatus.UNKNOWN,
    signatureScheme: DetectionStatus.UNKNOWN,
  };
}

export default createSecurityInfo;
