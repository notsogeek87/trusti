/**
 * Interface commune à toute source d'application analysable.
 *
 *   Application installée → ApplicationSource → TechnicalAnalyzer → TechnicalAnalysis
 *   APK (fichier)         → ApplicationSource → TechnicalAnalyzer → TechnicalAnalysis
 *
 * Toute implémentation doit exposer `getRawData()` qui résout vers un
 * RawPackageData (voir ./RawPackageData.js). TechnicalAnalyzer ne connaît que
 * cette interface — jamais Capacitor, jamais PackageManager directement.
 */
export class ApplicationSource {
  /** @returns {Promise<import('./RawPackageData').RawPackageData>} */
  // eslint-disable-next-line class-methods-use-this
  async getRawData() {
    throw new Error('ApplicationSource.getRawData() doit être implémentée par la sous-classe');
  }

  /** Identifiant de la provenance, utilisé dans TechnicalAnalysis.source. */
  // eslint-disable-next-line class-methods-use-this
  get kind() {
    return 'unknown';
  }
}

export default ApplicationSource;
