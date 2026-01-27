// Vercel Serverless Function - Custom TrustiApps Management
import fs from 'fs';
import path from 'path';

const DATA_FILE = '/tmp/custom-trusti-apps.json';

// Helper: Lire les données
const readCustomApps = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading custom apps:', error);
  }
  return [];
};

// Helper: Écrire les données
const writeCustomApps = (apps) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing custom apps:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Récupérer toutes les apps personnalisées
      const apps = readCustomApps();
      return res.status(200).json({
        success: true,
        apps: apps
      });
    }

    if (req.method === 'POST') {
      // Ajouter ou mettre à jour les apps (bulk save)
      const { apps } = req.body;
      
      if (!Array.isArray(apps)) {
        return res.status(400).json({
          success: false,
          error: 'Apps must be an array'
        });
      }

      const success = writeCustomApps(apps);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Custom apps saved successfully',
          apps: apps
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to save apps'
        });
      }
    }

    if (req.method === 'DELETE') {
      // Supprimer une app spécifique
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required'
        });
      }

      const apps = readCustomApps();
      const filteredApps = apps.filter(app => app.id !== id);
      const success = writeCustomApps(filteredApps);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'App deleted successfully',
          apps: filteredApps
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete app'
        });
      }
    }

    // Méthode non supportée
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
