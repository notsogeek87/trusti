import { ApplicationSource } from './ApplicationSource.js';
import { normalizeRawPackageData } from './RawPackageData.js';
import TechnicalAnalysisPlugin from '../../native/TechnicalAnalysis.js';

/**
 * ApplicationSource pour une application déjà installée sur l'appareil.
 * S'appuie sur le plugin Capacitor natif TechnicalAnalysisPlugin — n'existe
 * et ne répond que dans l'app Android empaquetée (voir isNativeAndroid).
 */
export class InstalledApplicationSource extends ApplicationSource {
  /** @param {string} packageName */
  constructor(packageName) {
    super();
    this.packageName = packageName;
  }

  get kind() {
    return 'installed';
  }

  async getRawData() {
    const raw = await TechnicalAnalysisPlugin.analyzePackage({ packageName: this.packageName });
    return normalizeRawPackageData(raw);
  }
}

export default InstalledApplicationSource;
