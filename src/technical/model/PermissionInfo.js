import { ProtectionLevel } from './ProtectionLevel.js';
import { DetectionStatus } from './DetectionStatus.js';

/**
 * @typedef {Object} PermissionInfo
 * @property {string} androidName - Nom technique Android (ex. "android.permission.CAMERA")
 * @property {string} readableName - Nom lisible (ex. "Caméra")
 * @property {string} [icon] - Emoji représentatif
 * @property {string} protectionLevel - Un des ProtectionLevel
 * @property {boolean} declared - Toujours true ici : la permission est déclarée dans le manifeste
 * @property {string} granted - Un des DetectionStatus — DETECTED = accordée, NOT_DETECTED = refusée,
 *                               UNKNOWN = statut d'octroi non déterminable pour cette permission
 */

/**
 * Construit un PermissionInfo normalisé à partir d'une entrée brute.
 * @param {{androidName: string, readableName?: string, icon?: string, protectionLevel?: string, granted?: string|boolean|null}} data
 * @returns {PermissionInfo}
 */
export function createPermissionInfo(data) {
  const androidName = data.androidName;
  if (!androidName) {
    throw new Error('PermissionInfo requiert androidName');
  }

  let granted = DetectionStatus.UNKNOWN;
  if (data.granted === true) granted = DetectionStatus.DETECTED;
  else if (data.granted === false) granted = DetectionStatus.NOT_DETECTED;
  else if (data.granted === DetectionStatus.DETECTED || data.granted === DetectionStatus.NOT_DETECTED) {
    granted = data.granted;
  }

  return {
    androidName,
    readableName: data.readableName || androidName,
    icon: data.icon || '🔐',
    protectionLevel: data.protectionLevel || ProtectionLevel.UNKNOWN,
    declared: true,
    granted,
  };
}

/**
 * true si le statut d'octroi de la permission a pu être déterminé.
 */
export function isGrantKnown(permissionInfo) {
  return permissionInfo.granted !== DetectionStatus.UNKNOWN;
}

export default createPermissionInfo;
