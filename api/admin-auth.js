// Rate limiting in-memory (resets on cold start — intentional for serverless)
const attempts = new Map();

const LOCKOUT_DURATION = 30 * 1000;
const MAX_ATTEMPTS = 3;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
  const now = Date.now();

  const record = attempts.get(ip) || { count: 0, lockedUntil: 0 };

  if (record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Trop de tentatives. Réessayez dans ${retryAfter} secondes.`,
      retryAfter,
    });
  }

  const { pin } = req.body || {};

  if (!pin) {
    return res.status(400).json({ success: false, error: 'PIN manquant' });
  }

  const adminPin = process.env.ADMIN_PIN;

  // Dev bypass: if ADMIN_PIN not configured, accept any non-empty PIN
  if (!adminPin) {
    attempts.delete(ip);
    return res.status(200).json({ success: true });
  }

  if (pin === adminPin) {
    attempts.delete(ip);
    return res.status(200).json({ success: true });
  }

  // Wrong PIN — increment counter
  const newCount = record.count + 1;
  const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION : 0;
  attempts.set(ip, { count: newCount, lockedUntil });

  const remaining = MAX_ATTEMPTS - newCount;
  const error = remaining > 0
    ? `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
    : 'Trop de tentatives. Réessayez dans 30 secondes.';

  return res.status(401).json({
    success: false,
    error,
    retryAfter: lockedUntil > 0 ? 30 : 0,
  });
}
