/**
 * Langues de l'interface.
 *
 * Une langue n'entre dans ENABLED_LANGUAGES (et donc dans le sélecteur) que lorsque
 * sa traduction est complète : tests/technical/i18n.test.js échoue sinon.
 */
export const DEFAULT_LANGUAGE = 'fr';
export const LANGUAGES = ['fr', 'en', 'de'];
export const ENABLED_LANGUAGES = ['fr', 'en', 'de'];

export const LANGUAGE_NAMES = { fr: 'Français', en: 'English', de: 'Deutsch' };
