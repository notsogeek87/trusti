/**
 * Jeton de session admin côté client.
 *
 * Émis par le serveur (api/verify-admin-otp.js) après vérification réelle
 * d'un code OTP envoyé à ADMIN_EMAIL. Stocké en localStorage et envoyé en
 * Authorization: Bearer sur les requêtes de mutation admin. Le serveur est
 * seul juge de sa validité (signature + expiration) : le décodage ici ne
 * sert qu'à l'affichage (ex. ne pas redemander le PIN inutilement).
 */
const TOKEN_KEY = 'trusti_admin_token';

export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage indisponible (navigation privée, etc.)
  }
}

export function clearAdminToken() {
  setAdminToken(null);
}

function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

/**
 * Lecture non authentifiée du jeton stocké, pour décider si on peut sauter
 * le PinModal. Ne prouve rien en soi : le serveur revalide toujours la
 * signature et l'expiration à chaque appel protégé.
 */
export function getAdminTokenEmail() {
  const token = getAdminToken();
  if (!token) return null;
  const [payload] = token.split('.');
  if (!payload) return null;
  try {
    const { email, expiresAt } = JSON.parse(base64UrlDecode(payload));
    if (!email || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
    return String(email).toLowerCase().trim();
  } catch {
    return null;
  }
}

export function adminAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * fetch() qui ajoute automatiquement le jeton admin, et l'efface si le
 * serveur répond 401 (jeton expiré/invalide) pour forcer un nouveau PIN.
 */
export async function adminFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), ...adminAuthHeaders() };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearAdminToken();
  }
  return res;
}
