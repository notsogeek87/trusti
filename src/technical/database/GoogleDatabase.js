import { SignatureDatabase } from './SignatureDatabase.js';
import { ALL_SIGNATURES } from './signatures/index.js';

/**
 * Façade interrogeant uniquement les signatures de produits Google.
 * La présence d'une dépendance Google signifie uniquement "une référence à ce
 * produit a été détectée" — jamais "l'app ne fonctionne pas sans Google".
 */
export const GoogleDatabase = new SignatureDatabase(
  ALL_SIGNATURES.filter((s) => s.isGoogleProduct)
);

export default GoogleDatabase;
