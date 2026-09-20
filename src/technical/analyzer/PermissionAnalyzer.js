import { createPermissionInfo } from '../model/PermissionInfo.js';
import { lookupPermission } from '../database/PermissionCatalog.js';
import { ProtectionLevel } from '../model/ProtectionLevel.js';

const RAW_TO_PROTECTION_LEVEL = {
  normal: ProtectionLevel.NORMAL,
  dangerous: ProtectionLevel.DANGEROUS,
  signature: ProtectionLevel.SIGNATURE,
};

/**
 * Construit la liste des PermissionInfo à partir des permissions brutes
 * déclarées dans le manifeste. Ne fait jamais l'hypothèse qu'une permission
 * déclarée est utilisée : `declared` et `granted` restent deux informations
 * distinctes (voir spec §5).
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/PermissionInfo').PermissionInfo[]}
 */
export function analyzePermissions(rawData) {
  return (rawData.permissions || []).map((raw) => {
    const { readableName, icon } = lookupPermission(raw.name);
    return createPermissionInfo({
      androidName: raw.name,
      readableName,
      icon,
      protectionLevel: RAW_TO_PROTECTION_LEVEL[raw.protectionLevel] || ProtectionLevel.UNKNOWN,
      granted: raw.granted,
    });
  });
}

export default analyzePermissions;
