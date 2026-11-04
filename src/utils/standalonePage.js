/**
 * Pages autonomes de Trusti, servies hors de l'app principale selon un
 * paramètre d'adresse (pas de router dans le projet).
 *
 * - `?organisation`         : évaluation du parc applicatif (page historique, inchangée)
 * - `?organisations`        : rubrique « Organisations » (choix du parcours)
 * - `?creer-organisation`   : « Créer mon organisation » (en préparation)
 */
export const STANDALONE_PAGES = Object.freeze({
  EVALUATE_ORGANISATION: 'organisation',
  ORGANISATIONS: 'organisations',
  CREATE_ORGANISATION: 'creer-organisation',
});

/** Adresses des pages autonomes, à utiliser dans les liens. */
export const STANDALONE_URLS = Object.freeze({
  EVALUATE_ORGANISATION: '/?organisation',
  ORGANISATIONS: '/?organisations',
  CREATE_ORGANISATION: '/?creer-organisation',
});

/**
 * Détermine la page autonome demandée par l'adresse.
 * `?organisation` garde la priorité pour préserver le fonctionnement historique.
 * @param {string} search - `window.location.search`
 * @returns {string|null} une valeur de STANDALONE_PAGES, ou null pour l'app principale
 */
export const resolveStandalonePage = (search = '') => {
  const params = new URLSearchParams(search);
  if (params.has(STANDALONE_PAGES.EVALUATE_ORGANISATION)) return STANDALONE_PAGES.EVALUATE_ORGANISATION;
  if (params.has(STANDALONE_PAGES.ORGANISATIONS)) return STANDALONE_PAGES.ORGANISATIONS;
  if (params.has(STANDALONE_PAGES.CREATE_ORGANISATION)) return STANDALONE_PAGES.CREATE_ORGANISATION;
  return null;
};
