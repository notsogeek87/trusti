/**
 * Clés des partenaires de l'API /api/v1 (table `api_partners`, voir
 * server/database/migrations/2026-11-19-api-partners.sql).
 *
 * La base ne garde que l'empreinte SHA-256 de chaque clé : une fuite de la table
 * ne donne pas les clés. Une clé est générée par scripts/create-partner-key.js et
 * transmise une seule fois au partenaire.
 */
import crypto from 'node:crypto';

export const KEY_PREFIX = 'tsk_';
export const DEFAULT_RATE_PER_MINUTE = 60;

/** Nouvelle clé aléatoire (192 bits). */
export function generateKey() {
  return KEY_PREFIX + crypto.randomBytes(24).toString('base64url');
}

export function hashKey(key) {
  return crypto.createHash('sha256').update(String(key)).digest('hex');
}

/** Clé lue dans « Authorization: Bearer <clé> », ou null si absente ou mal formée. */
export function extractKey(authorization) {
  if (typeof authorization !== 'string') return null;
  const m = authorization.match(/^Bearer\s+(\S+)\s*$/i);
  if (!m) return null;
  const key = m[1];
  return key.startsWith(KEY_PREFIX) && key.length >= 20 && key.length <= 100 ? key : null;
}

/**
 * Résout une clé en partenaire actif, avec un petit cache mémoire (y compris
 * pour les clés inconnues, pour ne pas solliciter la base à chaque essai).
 * Une clé désactivée en base est refusée au plus tard après `ttlMs`.
 *
 * @param {{ query: (hash: string) => Promise<object|null>, touch?: (id) => Promise<void>, ttlMs?: number, now?: () => number }} opts
 *   query : renvoie { id, name, rate_per_minute } pour une empreinte active, sinon null.
 *   touch : note la dernière utilisation (au plus une fois par `ttlMs` et par partenaire).
 */
export function createPartnerResolver({ query, touch = null, ttlMs = 60_000, maxEntries = 1000, now = () => Date.now() }) {
  const cache = new Map(); // empreinte -> { at, partner }

  return async function resolve(key) {
    if (!key) return null;
    const hash = hashKey(key);
    const hit = cache.get(hash);
    if (hit && now() - hit.at < ttlMs) return hit.partner;

    const row = await query(hash);
    const partner = row
      ? { id: String(row.id), name: row.name, ratePerMinute: Number(row.rate_per_minute) || DEFAULT_RATE_PER_MINUTE }
      : null;
    if (cache.size >= maxEntries) cache.delete(cache.keys().next().value);
    cache.set(hash, { at: now(), partner });
    if (partner && touch) touch(partner.id).catch(() => {});
    return partner;
  };
}

/** Requêtes réelles sur la table api_partners. Table absente : aucune clé valide. */
export function partnerQueries(sql) {
  return {
    async query(hash) {
      try {
        const rows = await sql`
          SELECT id, name, rate_per_minute FROM api_partners
          WHERE key_hash = ${hash} AND active = TRUE
          LIMIT 1
        `;
        return rows[0] || null;
      } catch (error) {
        if (error?.code === '42P01' || /api_partners.*(does not exist|n'existe pas)/.test(String(error?.message))) return null;
        throw error;
      }
    },
    async touch(id) {
      await sql`UPDATE api_partners SET last_used_at = now() WHERE id = ${id}`;
    },
  };
}
