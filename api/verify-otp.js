import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Rate limiting tentatives incorrectes (en mémoire, par email)
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();
    const now = Date.now();

    // Rate limit par email
    const record = failedAttempts.get(cleanEmail) || { count: 0, lockedUntil: 0 };
    if (record.lockedUntil > now) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000 / 60);
      return res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${retryAfter} min.` });
    }

    // Chercher le code en DB
    const result = await sql`
      SELECT * FROM magic_link_tokens
      WHERE email = ${cleanEmail}
        AND token = ${cleanCode}
        AND LENGTH(token) = 6
        AND used = false
      LIMIT 1
    `;

    if (result.length === 0) {
      // Incrémenter les échecs
      const newCount = record.count + 1;
      const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;
      failedAttempts.set(cleanEmail, { count: newCount, lockedUntil });
      const remaining = MAX_ATTEMPTS - newCount;
      return res.status(401).json({
        error: remaining > 0
          ? `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
          : 'Trop de tentatives. Compte bloqué 15 minutes.',
      });
    }

    const tokenData = result[0];

    // Vérifier expiration
    if (now > tokenData.expires_at) {
      await sql`DELETE FROM magic_link_tokens WHERE token = ${cleanCode} AND email = ${cleanEmail}`;
      return res.status(401).json({ error: 'Code expiré. Demandez un nouveau code.' });
    }

    // Marquer comme utilisé
    await sql`
      UPDATE magic_link_tokens SET used = true
      WHERE token = ${cleanCode} AND email = ${cleanEmail}
    `;

    // Réinitialiser le compteur d'échecs
    failedAttempts.delete(cleanEmail);

    return res.status(200).json({ success: true, email: cleanEmail });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
}
