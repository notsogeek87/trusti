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
  [ProtectionLevel.NORMAL]: 'Standard — accordée automatiquement à l\'installation',
  [ProtectionLevel.DANGEROUS]: 'Sensible — nécessite une confirmation explicite de l\'utilisateur',
  [ProtectionLevel.SIGNATURE]: 'Réservée — limitée aux apps signées par le même développeur que le système',
  [ProtectionLevel.UNKNOWN]: 'Non déterminé',
};

export default ProtectionLevel;
