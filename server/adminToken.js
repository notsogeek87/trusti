/**
 * Authentification des routes d'écriture de l'API.
 *
 * Il n'y a plus de connexion ni d'interface d'administration : le catalogue
 * n'est modifiable que par des appels serveur à serveur (n8n, scripts) qui
 * portent l'en-tête `x-api-key` égal à la variable d'environnement API_KEY.
 * Sans API_KEY configurée, toute écriture est refusée (fail-closed).
 */
import crypto from 'crypto';

/** Comparaison en temps constant (évite de deviner la clé par mesure du temps de réponse). */
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function isAuthorizedAdminRequest(req) {
  const expected = process.env.API_KEY;
  if (!expected) return false;
  const provided = req.headers['x-api-key'];
  if (!provided || typeof provided !== 'string') return false;
  return safeEqual(provided, expected);
}
