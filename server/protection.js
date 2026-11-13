// Protections de l'API pour le serveur conteneur (Hyperfluid) :
// - limite de débit par adresse IP (fenêtre glissante simple, en mémoire) ;
// - micro-cache des lectures publiques (GET), vidé à chaque écriture.
// Vercel a son propre cache CDN : ces protections ne concernent que server/production.js.
// Un seul pod aujourd'hui : la mémoire locale suffit (à revoir si plusieurs réplicas).

/**
 * Limiteur : au plus `max` requêtes par `windowMs` pour une même clé (IP).
 * `now` est injectable pour les tests.
 */
export function createRateLimiter({ windowMs, max, now = () => Date.now() }) {
  const hits = new Map(); // clé -> { start, count }

  function check(key) {
    const t = now();
    const entry = hits.get(key);
    if (!entry || t - entry.start >= windowMs) {
      hits.set(key, { start: t, count: 1 });
      return { allowed: true, retryAfterSec: 0 };
    }
    entry.count += 1;
    if (entry.count <= max) return { allowed: true, retryAfterSec: 0 };
    return { allowed: false, retryAfterSec: Math.ceil((entry.start + windowMs - t) / 1000) };
  }

  function sweep() {
    const t = now();
    for (const [key, entry] of hits) if (t - entry.start >= windowMs) hits.delete(key);
  }

  function middleware(req, res, next) {
    const { allowed, retryAfterSec } = check(req.ip || 'inconnue');
    if (allowed) return next();
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({ success: false, error: 'Trop de requêtes, réessayez plus tard.' });
  }

  const timer = setInterval(sweep, Math.max(windowMs, 60_000));
  timer.unref?.();

  return { check, sweep, middleware, size: () => hits.size };
}

/**
 * Micro-cache des réponses GET réussies, par URL complète, pendant `ttlMs`.
 * Toute requête non-GET sur l'API vide le cache (les données ont pu changer).
 */
export function createApiCache({ ttlMs, maxEntries = 500, now = () => Date.now() }) {
  const store = new Map(); // url -> { at, status, body }

  function clear() {
    store.clear();
  }

  function middleware(req, res, next) {
    if (req.method !== 'GET') {
      if (req.method !== 'OPTIONS') clear();
      return next();
    }
    const key = req.originalUrl;
    const hit = store.get(key);
    if (hit && now() - hit.at < ttlMs) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(hit.status).json(hit.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        if (store.size >= maxEntries) store.delete(store.keys().next().value);
        store.set(key, { at: now(), status: 200, body });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };
    return next();
  }

  return { middleware, clear, size: () => store.size };
}
