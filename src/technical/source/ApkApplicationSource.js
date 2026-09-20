import { ApplicationSource } from './ApplicationSource.js';

/**
 * ApplicationSource pour un fichier APK sélectionné manuellement par
 * l'utilisateur ("+ Analyser une APK", voir spec §11).
 *
 * NON IMPLÉMENTÉ — architecture préparée uniquement pour cette première
 * version. Un parsing fiable d'AndroidManifest.xml (binaire, format AXML) et
 * des ressources compilées depuis un fichier APK arbitraire nécessite soit
 * une lib de parsing dédiée côté natif Android (ex. PackageManager
 * .getPackageArchiveInfo(...) sur le fichier une fois copié en local — piste
 * la plus simple, à valider), soit un parseur AXML en JS si l'analyse doit
 * rester possible hors app Android. Tant que ce choix n'est pas tranché et
 * testé, cette classe échoue explicitement plutôt que de renvoyer des
 * données partielles ou incorrectes.
 *
 * Le reste du moteur (TechnicalAnalyzer, analyzers, databases) est déjà
 * écrit pour être totalement agnostique de la source : le jour où
 * getRawData() est implémentée ici (via un nouveau plugin natif, ex.
 * `analyzeApkFile(uri)`), aucune autre couche n'a besoin de changer.
 */
export class ApkApplicationSource extends ApplicationSource {
  /** @param {string} apkUri - URI/chemin du fichier APK sélectionné par l'utilisateur */
  constructor(apkUri) {
    super();
    this.apkUri = apkUri;
  }

  get kind() {
    return 'apk';
  }

  // eslint-disable-next-line class-methods-use-this
  async getRawData() {
    throw new Error(
      "L'analyse d'un fichier APK externe n'est pas encore implémentée. " +
      'Architecture préparée (ApplicationSource, TechnicalAnalyzer) — voir ApkApplicationSource.'
    );
  }
}

export default ApkApplicationSource;
