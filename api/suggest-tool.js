// Route API - suggestion d'un outil absent du catalogue
// (bouton « Il manque un outil » de la page ?organisation). Publique, sans
// compte : aucune donnée personnelle n'est demandée ni conservée.
import dbService from '../server/database/service-postgres.js';
import { validateSuggestion } from '../server/toolSuggestion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const check = validateSuggestion(body);
  if (!check.ok) {
    if (check.silent) return res.status(200).json({ success: true });
    return res.status(400).json({ success: false, error: check.error });
  }

  try {
    const saved = await dbService.saveToolSuggestion(check.value);
    if (!saved) {
      return res.status(429).json({ success: false, error: 'Trop de suggestions en attente, réessayez plus tard.' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('suggest-tool error:', error);
    return res.status(500).json({ success: false, error: 'Enregistrement impossible pour le moment.' });
  }
}
