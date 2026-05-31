import 'dotenv/config';
import * as brevo from '@getbrevo/brevo';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const cleanEmail = email.toLowerCase().trim();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    // Vérifier que l'email est autorisé (dev bypass si ADMIN_EMAIL non défini)
    if (adminEmail && cleanEmail !== adminEmail) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Générer le code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await sql`DELETE FROM magic_link_tokens WHERE email = ${cleanEmail} AND LENGTH(token) = 6`;
    await sql`DELETE FROM magic_link_tokens WHERE expires_at < ${Date.now()}`;
    await sql`INSERT INTO magic_link_tokens (token, email, expires_at, used) VALUES (${code}, ${cleanEmail}, ${expiresAt}, false)`;

    // Dev sans Brevo → console
    if (!process.env.BREVO_API_KEY) {
      console.log(`\n🔑 Code admin pour ${cleanEmail} : ${code}\n`);
      return res.status(200).json({ success: true });
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const mail = new brevo.SendSmtpEmail();
    mail.subject = `${code} — Code administrateur TrustiScore`;
    mail.to = [{ email: cleanEmail }];
    mail.sender = {
      name: process.env.BREVO_FROM_NAME || 'TrustiScore',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr',
    };
    mail.htmlContent = `
      <!DOCTYPE html><html><body style="margin:0;padding:40px 20px;font-family:sans-serif;background:#f8fafc;">
        <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;text-align:center;box-shadow:0 4px 6px rgba(0,0,0,.08);">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Code administrateur</p>
          <p style="margin:16px 0;font-size:48px;font-weight:900;letter-spacing:12px;font-family:'Courier New',monospace;color:#1e293b;">${code}</p>
          <p style="margin:0;font-size:13px;color:#94a3b8;">Valable 10 minutes · Ne partagez pas ce code</p>
        </div>
      </body></html>
    `;
    await apiInstance.sendTransacEmail(mail);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('admin-auth error:', error);
    return res.status(500).json({ error: "Erreur lors de l'envoi du code" });
  }
}
