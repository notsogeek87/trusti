// Vercel Serverless Function - Vérification OTP admin (émet un jeton de session)
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { getOtpLock, registerOtpFailure, clearOtpFailures } from '../server/otpRateLimit.js';
import { createAdminToken } from '../server/adminToken.js';

const sql = neon(process.env.DATABASE_URL);

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

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    if (adminEmail && cleanEmail !== adminEmail) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const lock = await getOtpLock(sql, cleanEmail);
    if (lock.lockedUntil > now) {
      const retryAfter = Math.ceil((lock.lockedUntil - now) / 1000 / 60);
      return res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${retryAfter} min.` });
    }

    const result = await sql`
      SELECT * FROM magic_link_tokens
      WHERE email = ${cleanEmail}
        AND token = ${cleanCode}
        AND LENGTH(token) = 6
        AND used = false
      LIMIT 1
    `;

    if (result.length === 0) {
      const { count } = await registerOtpFailure(sql, cleanEmail);
      const remaining = 5 - count;
      return res.status(401).json({
        error: remaining > 0
          ? `Code incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
          : 'Trop de tentatives. Compte bloqué 15 minutes.',
      });
    }

    const tokenData = result[0];

    if (now > tokenData.expires_at) {
      await sql`DELETE FROM magic_link_tokens WHERE token = ${cleanCode} AND email = ${cleanEmail}`;
      return res.status(401).json({ error: 'Code expiré. Demandez un nouveau code.' });
    }

    await sql`
      UPDATE magic_link_tokens SET used = true
      WHERE token = ${cleanCode} AND email = ${cleanEmail}
    `;
    await clearOtpFailures(sql, cleanEmail);

    const token = createAdminToken(cleanEmail);
    return res.status(200).json({ success: true, email: cleanEmail, token });
  } catch (error) {
    console.error('Error verifying admin OTP:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
}
