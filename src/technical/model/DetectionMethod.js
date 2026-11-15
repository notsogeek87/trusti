import { t } from '../../i18n/index.js';
/**
 * Méthode ayant permis une détection technique — toujours attachée à une
 * DetectionMetadata (voir DetectionMetadata.js) pour que chaque information
 * affichée puisse expliquer sa provenance.
 */
export const DetectionMethod = Object.freeze({
  APK_METADATA: 'APK_METADATA', // clé <meta-data> du manifeste
  MANIFEST: 'MANIFEST', // composant déclaré dans AndroidManifest.xml (service/receiver/provider/activity)
  DEX_SIGNATURE: 'DEX_SIGNATURE', // signature trouvée dans le bytecode (classes.dex) — non utilisé tant que le scan DEX n'est pas implémenté
  NATIVE_LIBRARY: 'NATIVE_LIBRARY', // bibliothèque native (.so) présente dans l'APK
  KNOWN_DATABASE: 'KNOWN_DATABASE', // correspondance dans une base de connaissances locale (ex. open source, écosystème)
  PACKAGE_NAME: 'PACKAGE_NAME', // nom de paquet lui-même
  UNKNOWN: 'UNKNOWN',
});

export const DETECTION_METHOD_LABEL = {
  [DetectionMethod.APK_METADATA]: t('technical.models.method.APK_METADATA'),
  [DetectionMethod.MANIFEST]: t('technical.models.method.MANIFEST'),
  [DetectionMethod.DEX_SIGNATURE]: t('technical.models.method.DEX_SIGNATURE'),
  [DetectionMethod.NATIVE_LIBRARY]: t('technical.models.method.NATIVE_LIBRARY'),
  [DetectionMethod.KNOWN_DATABASE]: t('technical.models.method.KNOWN_DATABASE'),
  [DetectionMethod.PACKAGE_NAME]: t('technical.models.method.PACKAGE_NAME'),
  [DetectionMethod.UNKNOWN]: t('technical.models.method.UNKNOWN'),
};

export default DetectionMethod;
