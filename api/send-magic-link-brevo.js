// Vercel Serverless Function - Send Magic Link with Brevo (Sendinblue)
import 'dotenv/config';
import * as brevo from '@getbrevo/brevo';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Clean up old expired tokens first
    await sql`
      DELETE FROM magic_link_tokens 
      WHERE expires_at < ${Date.now()}
    `;

    // Store token in database
    await sql`
      INSERT INTO magic_link_tokens (token, email, expires_at, used)
      VALUES (${token}, ${email.toLowerCase().trim()}, ${expiresAt}, false)
    `;

    // Create magic link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLink = `${frontendUrl}?token=${token}`;

    // Configure Brevo API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Prepare email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = '🔐 Votre lien de connexion TrustiScore';
    sendSmtpEmail.to = [{ email: email, name: email }];
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'TrustiScore',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@trustiscore.fr'
    };
    
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">TrustiScore</h1>
                      <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Votre lien de connexion sécurisé</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #334155; font-size: 16px; line-height: 1.6;">
                        Bonjour,
                      </p>
                      <p style="margin: 0 0 30px; color: #334155; font-size: 16px; line-height: 1.6;">
                        Cliquez sur le bouton ci-dessous pour vous connecter à TrustiScore :
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              🔓 Se connecter
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                        Ce lien est valable pendant <strong>15 minutes</strong> et ne peut être utilisé qu'une seule fois.
                      </p>
                      
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                        TrustiScore - Évaluez la confidentialité de vos applications
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send email via Brevo
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ 
      success: true, 
      message: 'Email envoyé avec succès via Brevo' 
    });

  } catch (error) {
    console.error('Error sending magic link via Brevo:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error.message 
    });
  }
}
