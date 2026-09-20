import { GOOGLE_SIGNATURES } from './google.js';
import { TRACKING_SIGNATURES } from './tracking.js';
import { DEVTOOLS_SIGNATURES } from './devtools.js';

/**
 * Registre combiné de toutes les signatures connues, une seule fois. Pour
 * ajouter un nouveau SDK : ajouter une entrée dans le fichier de la famille
 * correspondante (ou en créer une nouvelle et l'inclure ici) — jamais besoin
 * de toucher aux analyzers ni au moteur de détection.
 */
export const ALL_SIGNATURES = [
  ...GOOGLE_SIGNATURES,
  ...TRACKING_SIGNATURES,
  ...DEVTOOLS_SIGNATURES,
];

export { GOOGLE_SIGNATURES, TRACKING_SIGNATURES, DEVTOOLS_SIGNATURES };
export default ALL_SIGNATURES;
