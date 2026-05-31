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
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Rate limit: 3 OTP max par email sur 5 minutes
    const recentResult = await sql`
      SELECT COUNT(*) AS count FROM magic_link_tokens
      WHERE email = ${cleanEmail}
        AND LENGTH(token) = 6
        AND expires_at > ${Date.now() - 5 * 60 * 1000}
    `;
    if (parseInt(recentResult[0].count) >= 3) {
      return res.status(429).json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' });
    }

    // Générer le code à 6 chiffres
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Supprimer les anciens codes pour cet email
    await sql`
      DELETE FROM magic_link_tokens
      WHERE email = ${cleanEmail} AND LENGTH(token) = 6
    `;

    // Nettoyer les tokens expirés
    await sql`DELETE FROM magic_link_tokens WHERE expires_at < ${Date.now()}`;

    // Stocker le code
    await sql`
      INSERT INTO magic_link_tokens (token, email, expires_at, used)
      VALUES (${code}, ${cleanEmail}, ${expiresAt}, false)
    `;

    // Dev sans Brevo → console
    if (!process.env.BREVO_API_KEY) {
      console.log(`\n🔑 Code OTP pour ${cleanEmail} : ${code}\n`);
      return res.status(200).json({ success: true });
    }

    // Envoyer via Brevo
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `${code} est votre code TrustiScore`;
    sendSmtpEmail.to = [{ email: cleanEmail }];
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'TrustiScore',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr',
    };

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
            <tr><td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 24px;text-align:center;">
                    <p style="margin:0;color:#fff;font-size:28px;font-weight:800;">TrustiScore</p>
                    <p style="margin:8px 0 0;color:#e0e7ff;font-size:13px;">Votre code de connexion</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 32px;text-align:center;">
                    <p style="margin:0 0 24px;color:#334155;font-size:15px;">Utilisez ce code pour vous connecter :</p>
                    <div style="display:inline-block;background:#f1f5f9;border-radius:12px;padding:20px 40px;margin:0 0 24px;">
                      <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#1e293b;font-family:'Courier New',monospace;">${code}</p>
                    </div>
                    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Ce code expire dans <strong>10 minutes</strong>.</p>
                    <p style="margin:0;color:#94a3b8;font-size:12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;">TrustiScore — Évaluez la confidentialité de vos applications</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: "Erreur lors de l'envoi du code" });
  }
}
