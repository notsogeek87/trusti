/**
 * @typedef {Object} CompositionInfo
 * Composition technique de l'application (taille, DEX, bibliothèques natives,
 * architectures, split APK, nombre de composants). Purement descriptif — ne
 * dit rien sur la sécurité, la qualité ou l'intention de l'éditeur.
 *
 * Tout champ reste `null` quand l'information n'a pas pu être déterminée
 * (`dataAvailable` indique si le bloc source était présent du tout).
 *
 * @property {boolean} dataAvailable
 * @property {number|null} totalSizeBytes
 * @property {number|null} apkSizeBytes
 * @property {number|null} dexCount
 * @property {number|null} nativeLibraryCount
 * @property {string[]} architectures - sous-ensemble de ['arm64-v8a','armeabi-v7a','x86','x86_64']
 * @property {boolean|null} isSplitApk
 * @property {number|null} splitCount
 * @property {number|null} activityCount
 * @property {number|null} serviceCount
 * @property {number|null} receiverCount
 * @property {number|null} providerCount
 * @property {number|null} exportedComponentCount
 */

const ARCH_LABELS = {
  'arm64-v8a': 'ARM64',
  'armeabi-v7a': 'ARMv7',
  x86: 'x86',
  x86_64: 'x86_64',
};

/**
 * @param {Object|null} rawComposition - rawData.composition
 * @param {Object|null} rawComponentCounts - rawData.componentCounts
 * @returns {CompositionInfo}
 */
export function createCompositionInfo(rawComposition, rawComponentCounts) {
  const dataAvailable = !!rawComposition;
  const counts = rawComponentCounts || {};

  const exportedComponentCount = rawComponentCounts
    ? (counts.exportedActivities || 0) + (counts.exportedServices || 0) +
      (counts.exportedReceivers || 0) + (counts.exportedProviders || 0)
    : null;

  return {
    dataAvailable,
    totalSizeBytes: rawComposition?.totalSizeBytes ?? null,
    apkSizeBytes: rawComposition?.apkSizeBytes ?? null,
    dexCount: rawComposition?.dexCount ?? null,
    nativeLibraryCount: rawComposition?.nativeLibraryCount ?? null,
    architectures: rawComposition?.architectures || [],
    isSplitApk: rawComposition?.isSplitApk ?? null,
    splitCount: rawComposition?.splitCount ?? null,
    activityCount: rawComponentCounts ? (counts.activities ?? null) : null,
    serviceCount: rawComponentCounts ? (counts.services ?? null) : null,
    receiverCount: rawComponentCounts ? (counts.receivers ?? null) : null,
    providerCount: rawComponentCounts ? (counts.providers ?? null) : null,
    exportedComponentCount,
  };
}

export function architectureLabel(archKey) {
  return ARCH_LABELS[archKey] || archKey;
}

export const KNOWN_ARCHITECTURES = Object.keys(ARCH_LABELS);

export default createCompositionInfo;
