import { SignatureDatabase } from './SignatureDatabase.js';
import { ALL_SIGNATURES } from './signatures/index.js';

/**
 * Façade interrogeant l'ensemble des signatures connues (SDK au sens large :
 * Google, trackers, outils développeur...). Utilisée pour la section
 * "SDK détectés", qui est un superset des sections Google et Trackers.
 */
export const SdkDatabase = new SignatureDatabase(ALL_SIGNATURES);

export default SdkDatabase;
