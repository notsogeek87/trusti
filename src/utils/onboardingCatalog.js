import { API_URL } from './apiConfig';

// Catalogue complet de l'onboarding, chargé une seule fois par session et
// partagé entre l'import par capture d'écran et la recherche du mode manuel.
let catalogPromise = null;

/**
 * @returns {Promise<Array<object>>} apps du catalogue, les plus populaires d'abord
 */
export function loadOnboardingCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(`${API_URL}/apps?onboarding=true`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error('catalog fetch failed');
        return [...data.apps].sort((a, b) => (a.popularity ?? 9999) - (b.popularity ?? 9999));
      })
      .catch(err => {
        catalogPromise = null; // permet de réessayer au prochain appel
        throw err;
      });
  }
  return catalogPromise;
}
