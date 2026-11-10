/**
 * Logique pure de chargement des icônes d'apps (sans React ni Capacitor),
 * testable sous Node. Utilisée par src/components/ui/AppIconImage.jsx.
 */

/** Nombre de nouvelles tentatives après un premier échec de chargement. */
export const ICON_MAX_RETRIES = 2;
/** Délai (ms) avant la tentative n (1, 2…). */
export const ICON_RETRY_DELAYS = [400, 1500];
/** Durée (ms) pendant laquelle un échec définitif n'est pas retenté. */
export const ICON_FAILED_TTL = 5 * 60 * 1000;

// Mémoire partagée par toutes les instances (module-level) : une icône déjà
// affichée n'est pas re-téléchargée à chaque frappe dans la recherche, et une
// icône en échec définitif n'est pas retentée à chaque rendu.
const loadedUrls = new Set();
const failedUrls = new Map(); // url -> timestamp de l'échec définitif

// Les URLs play-lh sans suffixe de taille renvoient l'image pleine résolution
// (~140 Ko). Sur mobile, avec une dizaine d'icônes chargées d'un coup, certaines
// échouent. On demande une vignette légère (=s96-rw, ~4 Ko).
// Les autres URLs (SVG distants, PNG…) sont renvoyées telles quelles.
export function sizedIconUrl(url) {
  if (typeof url === 'string' && /^https:\/\/play-lh\.googleusercontent\.com\/[^=?]+$/.test(url)) {
    return `${url}=s96-rw`;
  }
  return url;
}

const GOOGLE_IMAGE_HOST = /^https:\/\/[^/]*googleusercontent\.com\//;

/**
 * URL à charger pour la tentative `attempt` (0 = première).
 * Tentative 1 : même URL dans un nouvel élément <img>.
 * Tentatives suivantes : cache-buster en query string pour contourner une
 * réponse en échec gardée en cache, sauf pour les URLs Google (le suffixe
 * =s96-rw ne supporte pas de query string).
 */
export function iconAttemptUrl(url, attempt = 0) {
  const base = sizedIconUrl(url);
  if (typeof base !== 'string' || attempt < 2 || GOOGLE_IMAGE_HOST.test(base)) return base;
  const [noHash, hash] = base.split('#');
  const sep = noHash.includes('?') ? '&' : '?';
  return `${noHash}${sep}_r=${attempt}${hash !== undefined ? `#${hash}` : ''}`;
}

export function markIconLoaded(url) {
  if (!url) return;
  loadedUrls.add(url);
  failedUrls.delete(url);
}

export function markIconFailed(url, now = Date.now()) {
  if (!url) return;
  failedUrls.set(url, now);
}

export function isIconLoaded(url) {
  return !!url && loadedUrls.has(url);
}

export function isIconFailed(url, now = Date.now()) {
  if (!url) return false;
  const at = failedUrls.get(url);
  if (at === undefined) return false;
  if (now - at > ICON_FAILED_TTL) {
    failedUrls.delete(url);
    return false;
  }
  return true;
}

/** Fichier local embarqué pour une URL, uniquement si le manifeste le déclare. */
export function bundledIconFile(manifest, url) {
  if (!manifest || typeof manifest !== 'object' || typeof url !== 'string') return null;
  if (!Object.prototype.hasOwnProperty.call(manifest, url)) return null;
  const file = manifest[url];
  return typeof file === 'string' && file ? file : null;
}

/** Réinitialise la mémoire (tests uniquement). */
export function resetIconCache() {
  loadedUrls.clear();
  failedUrls.clear();
}
