import { t } from '../i18n/index.js';
/**
 * Formate une taille en octets pour l'affichage (Ko / Mo), dans la langue de l'interface.
 * @param {number|null} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return t('common.unavailable');
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ${t('common.units.KB')}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('common.units.MB')}`;
}

export default formatBytes;
