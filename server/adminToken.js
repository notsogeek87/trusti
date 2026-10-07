/**
 * Jetons de session admin (HMAC signé, sans dépendance externe).
 *
 * Émis uniquement après vérification réelle d'un code OTP (voir
 * api/verify-admin-otp.js). Un jeton prouve que son porteur a complété
 * ce flux pour l'email qu'il contient ; il expire après TOKEN_TTL_MS.
 */
import crypto from 'crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

/**
 * Email admin configuré, ou null.
 * Sans ADMIN_EMAIL, tout email est accepté (pratique en dev) — sauf en
 * production Vercel où l'accès admin est refusé (fail-closed) pour éviter
 * qu'un oubli de configuration ouvre l'administration à tout le monde.
 */
export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.toLowerCase().trim() || null;
}

export function isAdminEmail(email) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    if (process.env.VERCEL_ENV === 'production') {
      console.error('ADMIN_EMAIL non défini en production : accès admin refusé');
      return false;
    }
    return true;
  }
  return String(email || '').toLowerCase().trim() === adminEmail;
}

/** Code OTP à 6 chiffres, généré avec un RNG cryptographique. */
export function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.API_KEY;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET (ou API_KEY) doit être défini pour signer les sessions admin');
  }
  return secret;
}

function base64UrlEncode(buffer) {
  return buffer.toString('base64url');
}

export function createAdminToken(email) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = base64UrlEncode(Buffer.from(JSON.stringify({ email, expiresAt })));
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  try {
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const { email, expiresAt } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!email || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
    return { email: String(email).toLowerCase().trim() };
  } catch {
    return null;
  }
}

/**
 * Autorise une requête de mutation si :
 * - elle porte un x-api-key correct (intégrations externes type n8n), ou
 * - elle porte un jeton admin (Authorization: Bearer ...) valide et non expiré,
 *   pour l'email admin configuré (voir isAdminEmail).
 */
export function isAuthorizedAdminRequest(req) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && process.env.API_KEY && apiKey === process.env.API_KEY) {
    return true;
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return false;

  const claims = verifyAdminToken(token);
  if (!claims) return false;

  return isAdminEmail(claims.email);
}
