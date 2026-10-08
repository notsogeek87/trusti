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

// Supprime les entrées du cache plus vieilles que maxAge (toutes si 0)
const pruneCache = (maxAge) => {
  const now = Date.now();
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((k) => {
      try {
        const { ts } = JSON.parse(localStorage.getItem(k)) || {};
        if (!maxAge || !Number.isFinite(ts) || now - ts > maxAge) localStorage.removeItem(k);
      } catch {
        localStorage.removeItem(k);
      }
    });
};

const writeCache = (key, data) => {
  const value = JSON.stringify({ data, ts: Date.now() });
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    // localStorage plein : les entrées (une par URL, recherche et pagination
    // comprises) ne sont jamais supprimées sinon. On purge le cache du
    // catalogue puis on réessaie une fois.
    try {
      pruneCache(0);
      localStorage.setItem(CACHE_PREFIX + key, value);
    } catch {
      // Indisponible (navigation privée) ou toujours plein : pas de cache
    }
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
    // Ne jamais mettre en cache une erreur serveur : sinon une panne de
    // quelques secondes viderait le catalogue pendant toute la durée du TTL.
    if (!response.ok || data?.success === false) {
      if (cached) return cached.data;
      return data;
    }
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
