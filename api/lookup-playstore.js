// Vercel Serverless Function - Aperçu Play Store pour préremplir le formulaire admin
// (lecture seule, ne touche pas la base — l'enregistrement re-synchronise de
// toute façon nom/icône via enrichFromPlayStore côté service-postgres.js)
import 'dotenv/config';
import gplay from 'google-play-scraper';
import { isAuthorizedAdminRequest } from '../server/adminToken.js';

function extractPackageId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]id=([a-zA-Z0-9._]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  if (!isAuthorizedAdminRequest(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { url } = req.query;
  const packageId = extractPackageId(url);
  if (!packageId) {
    return res.status(400).json({ success: false, error: 'URL ou package name Play Store invalide' });
  }

  try {
    const appInfo = await gplay.app({ appId: packageId });
    if (!appInfo) {
      return res.status(404).json({ success: false, error: 'Application introuvable sur le Play Store' });
    }
    return res.status(200).json({
      success: true,
      name: appInfo.title,
      icon: appInfo.icon,
      developer: appInfo.developer,
      description: appInfo.summary || appInfo.description || '',
      playStoreUrl: appInfo.url || `https://play.google.com/store/apps/details?id=${packageId}`,
    });
  } catch (error) {
    return res.status(404).json({ success: false, error: 'Application introuvable sur le Play Store' });
  }
}
