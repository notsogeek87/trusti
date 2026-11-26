/**
 * Langues de l'interface.
 *
 * Une langue n'entre dans ENABLED_LANGUAGES (et donc dans le sélecteur) que lorsque
 * sa traduction est complète : tests/technical/i18n.test.js échoue sinon.
 */
export const DEFAULT_LANGUAGE = 'fr';
export const LANGUAGES = ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt'];
export const ENABLED_LANGUAGES = ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt'];

/**
 * Langue proposée quand celle du téléphone n'est pas prise en charge (suédois, grec…) :
 * l'anglais est compris par plus de monde que le français. Le français reste la langue
 * source et le repli des clés manquantes.
 */
export const FALLBACK_LANGUAGE = 'en';

export const LANGUAGE_NAMES = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
};
