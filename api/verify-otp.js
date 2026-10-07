import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { getOtpLock, registerOtpFailure, clearOtpFailures } from '../server/otpRateLimit.js';

const sql = neon(process.env.DATABASE_URL);

const MAX_ATTEMPTS = 5;

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

    // Rate limit par email (persistant en base, fiable sur instances serverless multiples)
    const lock = await getOtpLock(sql, cleanEmail);
    if (lock.lockedUntil > now) {
      const retryAfter = Math.ceil((lock.lockedUntil - now) / 1000 / 60);
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
      const { count } = await registerOtpFailure(sql, cleanEmail, { maxAttempts: MAX_ATTEMPTS });
      const remaining = MAX_ATTEMPTS - count;
      return res.status(401).json({
        error: remaining > 0
          ? `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
          : 'Trop de tentatives. Compte bloqué 15 minutes.',
      });
    }

    const tokenData = result[0];

    // Vérifier expiration
    if (now > Number(tokenData.expires_at)) {
      await sql`DELETE FROM magic_link_tokens WHERE token = ${cleanCode} AND email = ${cleanEmail}`;
      return res.status(401).json({ error: 'Code expiré. Demandez un nouveau code.' });
    }

    // Consommation atomique : deux requêtes concurrentes ne peuvent pas
    // valider le même code.
    const consumed = await sql`
      UPDATE magic_link_tokens SET used = true
      WHERE token = ${cleanCode} AND email = ${cleanEmail} AND used = false
      RETURNING token
    `;
    if (consumed.length === 0) {
      return res.status(401).json({ error: 'Code déjà utilisé. Demandez un nouveau code.' });
    }

    // Réinitialiser le compteur d'échecs
    await clearOtpFailures(sql, cleanEmail);

    return res.status(200).json({ success: true, email: cleanEmail });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
}
