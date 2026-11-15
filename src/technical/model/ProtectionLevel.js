import { t } from '../../i18n/index.js';
/**
 * Niveau de protection d'une permission Android, tel que défini par le système
 * (android.content.pm.PermissionInfo.protectionLevel). UNKNOWN couvre les
 * permissions personnalisées ou celles que le système n'a pas pu résoudre.
 */
export const ProtectionLevel = Object.freeze({
  NORMAL: 'NORMAL',
  DANGEROUS: 'DANGEROUS',
  SIGNATURE: 'SIGNATURE',
  UNKNOWN: 'UNKNOWN',
});

export const PROTECTION_LEVEL_LABEL = {
  [ProtectionLevel.NORMAL]: t('technical.models.protection.NORMAL'),
  [ProtectionLevel.DANGEROUS]: t('technical.models.protection.DANGEROUS'),
  [ProtectionLevel.SIGNATURE]: t('technical.models.protection.SIGNATURE'),
  [ProtectionLevel.UNKNOWN]: t('technical.models.protection.UNKNOWN'),
};

export default ProtectionLevel;
