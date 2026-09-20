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
  [DetectionMethod.APK_METADATA]: 'Clé de configuration détectée dans le manifeste',
  [DetectionMethod.MANIFEST]: 'Composant déclaré dans le manifeste de l\'application',
  [DetectionMethod.DEX_SIGNATURE]: 'Signature détectée dans le bytecode de l\'application',
  [DetectionMethod.NATIVE_LIBRARY]: 'Bibliothèque native détectée dans l\'application',
  [DetectionMethod.KNOWN_DATABASE]: 'Correspondance trouvée dans une base de connaissances locale',
  [DetectionMethod.PACKAGE_NAME]: 'Nom de paquet de l\'application',
  [DetectionMethod.UNKNOWN]: 'Méthode de détection non déterminée',
};

export default DetectionMethod;
