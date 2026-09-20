/**
 * Formate une taille en octets pour l'affichage (Ko / Mo), en français.
 * @param {number|null} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return 'Non disponible';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default formatBytes;
