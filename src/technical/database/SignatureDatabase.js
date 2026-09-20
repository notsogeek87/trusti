import { Confidence } from '../model/Confidence.js';
import { DetectionMethod } from '../model/DetectionMethod.js';
import { createDetectionEntry } from '../model/DetectionEntry.js';

/**
 * Moteur générique de détection par signature — partagé par GoogleDatabase,
 * SdkDatabase et TrackerDatabase. Ne connaît rien du contenu des signatures,
 * uniquement comment les comparer aux composants du manifeste d'une app.
 *
 * Méthode de détection : présence d'un préfixe de classe connu parmi les
 * composants déclarés (services/receivers/providers/activities), ou présence
 * d'une clé de méta-données connue. Les deux sont considérés comme des
 * signaux forts (le composant/la clé doit être explicitement déclaré dans le
 * manifeste pour que le système d'exploitation en tienne compte) → confiance
 * HIGH dans les deux cas.
 */
export class SignatureDatabase {
  /** @param {Array} signatures - liste d'entrées de signature (voir signatures/*.js) */
  constructor(signatures) {
    this.signatures = signatures;
  }

  /**
   * @param {import('../source/RawPackageData').RawPackageData} rawData
   * @returns {import('../model/DetectionEntry').DetectionEntry[]}
   */
  detect(rawData) {
    const allComponents = [
      ...(rawData.components?.services || []),
      ...(rawData.components?.receivers || []),
      ...(rawData.components?.providers || []),
      ...(rawData.components?.activities || []),
    ];
    const metaDataKeys = rawData.metaDataKeys || [];

    const detected = [];
    for (const signature of this.signatures) {
      const matchedComponent = (signature.packagePrefixes || []).length
        ? allComponents.find((className) =>
            signature.packagePrefixes.some((prefix) => className.startsWith(prefix))
          )
        : undefined;

      const matchedMetaData = !matchedComponent && (signature.metaDataKeys || []).length
        ? metaDataKeys.find((key) => signature.metaDataKeys.includes(key))
        : undefined;

      if (matchedComponent) {
        detected.push(
          createDetectionEntry(signature, {
            confidence: Confidence.HIGH,
            detectionMethod: `Composant déclaré dans le manifeste de l'application (${matchedComponent})`,
            method: DetectionMethod.MANIFEST,
            source: matchedComponent,
          })
        );
      } else if (matchedMetaData) {
        detected.push(
          createDetectionEntry(signature, {
            confidence: Confidence.HIGH,
            detectionMethod: `Clé de configuration détectée dans le manifeste (${matchedMetaData})`,
            method: DetectionMethod.APK_METADATA,
            source: matchedMetaData,
          })
        );
      }
    }
    return detected;
  }
}

export default SignatureDatabase;
