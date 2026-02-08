// Vercel Serverless Function - Verify Token
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token manquant' });
    }

    // Retrieve token from database
    const result = await sql`
      SELECT * FROM magic_link_tokens 
      WHERE token = ${token}
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(401).json({ 
        error: 'Token invalide',
        success: false 
      });
    }

    const tokenData = result[0];

    // Check if token is expired
    if (Date.now() > tokenData.expires_at) {
      // Clean up expired token
      await sql`DELETE FROM magic_link_tokens WHERE token = ${token}`;
      return res.status(401).json({ 
        error: 'Token expiré',
        success: false 
      });
    }

    // Check if token was already used
    if (tokenData.used) {
      return res.status(401).json({ 
        error: 'Token déjà utilisé',
        success: false 
      });
    }

    // Mark token as used
    await sql`
      UPDATE magic_link_tokens 
      SET used = true 
      WHERE token = ${token}
    `;

    // Return success with email
    res.status(200).json({ 
      success: true, 
      email: tokenData.email 
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification du token',
      details: error.message 
    });
  }
}
