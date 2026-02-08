import express from 'express';
import { Resend } from 'resend';
import crypto from 'crypto';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Stockage temporaire des tokens (en mémoire)
// En production, utilisez Redis ou une base de données
const magicTokens = new Map();

// Nettoyer les tokens expirés toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of magicTokens.entries()) {
    if (now > data.expiresAt) {
      magicTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

/**
 * POST /api/auth/send-magic-link
 * Envoie un lien magique à l'email fourni
 */
router.post('/send-magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Email invalide'
      });
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes

    // Stocker le token
    magicTokens.set(token, {
      email: email.toLowerCase().trim(),
      expiresAt,
      used: false
    });

    // Créer le lien magique
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://trusti.vercel.app'
      : 'http://localhost:5173';
    
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Envoyer l'email avec Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'TrustiScore <onboarding@resend.dev>',
      to: [email],
      subject: 'Connexion à TrustiScore 🔐',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 800; }
              .content { padding: 40px 30px; }
              .content p { color: #475569; line-height: 1.6; margin: 16px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin: 24px 0; }
              .button:hover { opacity: 0.9; }
              .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; }
              .footer a { color: #4f46e5; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 TrustiScore</h1>
              </div>
              <div class="content">
                <h2 style="color: #0f172a; margin-top: 0;">Connexion à votre compte</h2>
                <p>Bonjour,</p>
                <p>Cliquez sur le bouton ci-dessous pour vous connecter à TrustiScore :</p>
                <div style="text-align: center;">
                  <a href="${magicLink}" class="button">Se connecter à TrustiScore</a>
                </div>
                <p style="font-size: 14px; color: #64748b;">
                  Ce lien est valable pendant <strong>15 minutes</strong> et ne peut être utilisé qu'une seule fois.
                </p>
                <p style="font-size: 14px; color: #64748b;">
                  Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
                </p>
              </div>
              <div class="footer">
                <p>TrustiScore - Évaluez la confidentialité de vos applications</p>
                <p><a href="${baseUrl}">trusti.vercel.app</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      });
    }

    res.json({
      success: true,
      message: 'Un lien de connexion a été envoyé à votre adresse email'
    });

  } catch (error) {
    console.error('Send magic link error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/auth/verify-token
 * Vérifie un token magic link
 */
router.get('/verify-token', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token manquant'
      });
    }

    const tokenData = magicTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    if (tokenData.used) {
      return res.status(400).json({
        success: false,
        error: 'Ce lien a déjà été utilisé'
      });
    }

    if (Date.now() > tokenData.expiresAt) {
      magicTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Ce lien a expiré'
      });
    }

    // Marquer le token comme utilisé
    tokenData.used = true;

    // Retourner l'email de l'utilisateur
    res.json({
      success: true,
      email: tokenData.email
    });

    // Supprimer le token après 5 secondes
    setTimeout(() => {
      magicTokens.delete(token);
    }, 5000);

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

export default router;
