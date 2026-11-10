// Règles du Markdown autorisé dans les textes venus de la base (guides de migration…),
// partagées par le composant RichText et les tests (tests/technical/richText.test.js).
//
// Autorisé : **gras**, *italique*, `code`, [lien](https://…) et retour à la ligne.
// Ignoré (le texte est gardé, pas la mise en forme) : titres, images, tableaux, listes,
// citations. Le HTML brut est supprimé, jamais interprété.
export const RICH_TEXT_ELEMENTS = ['p', 'strong', 'em', 'code', 'a', 'br'];

/** Liens : https uniquement (pas de javascript:, data:, http: ni liens relatifs). */
export const safeUrl = (url) => (/^https:\/\/\S+$/i.test(String(url || '')) ? url : '');

/** Options communes de react-markdown (sans les composants d'affichage). */
export const RICH_TEXT_OPTIONS = {
  allowedElements: RICH_TEXT_ELEMENTS,
  unwrapDisallowed: true,
  skipHtml: true,
  urlTransform: safeUrl,
};
