/**
 * Cache client (localStorage) pour les appels GET au catalogue.
 *
 * But : réduire le nombre d'appels réseau vers l'API quand l'app a beaucoup
 * d'utilisateurs (le catalogue ne change pas à chaque seconde). Le cache
 * persiste entre les ouvertures de l'app (localStorage survit au redémarrage,
 * contrairement à une simple variable en mémoire).
 */
const CACHE_PREFIX = 'trusti_cache_v1:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage plein ou indisponible (navigation privée) : tant pis, pas de cache
  }
};

/**
 * Fetch avec cache localStorage. Retourne le JSON parsé.
 * @param {string} url - URL à appeler, sert aussi de clé de cache
 * @param {Object} [options]
 * @param {number} [options.ttl] - Durée de validité du cache en ms (défaut 5 min)
 */
export const cachedFetchJSON = async (url, { ttl = DEFAULT_TTL } = {}) => {
  const cached = readCache(url);
  if (cached && Date.now() - cached.ts < ttl) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    writeCache(url, data);
    return data;
  } catch (error) {
    // En cas d'erreur réseau, retomber sur une entrée expirée plutôt que rien
    if (cached) return cached.data;
    throw error;
  }
};

/**
 * Invalide toutes les entrées de cache dont l'URL commence par ce préfixe
 * (ex: après une mutation admin qui rend une réponse cachée obsolète).
 */
export const invalidateCache = (urlPrefix = '') => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX) && k.slice(CACHE_PREFIX.length).startsWith(urlPrefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};
