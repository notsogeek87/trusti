// Vercel Serverless Function - Custom TrustiApps Management
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers les données de base (depuis le repo Git)
const BASE_DATA_FILE = path.join(__dirname, '../server/data/custom-trusti-apps.json');
// Chemin vers les données temporaires (ajouts admin)
const TEMP_DATA_FILE = '/tmp/custom-trusti-apps-temp.json';

// Helper: Lire les données de base depuis Git
const readBaseApps = () => {
  try {
    if (fs.existsSync(BASE_DATA_FILE)) {
      const data = fs.readFileSync(BASE_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading base apps:', error);
  }
  return [];
};

// Helper: Lire les apps temporaires ajoutées par l'admin
const readTempApps = () => {
  try {
    if (fs.existsSync(TEMP_DATA_FILE)) {
      const data = fs.readFileSync(TEMP_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading temp apps:', error);
  }
  return [];
};

// Helper: Lire TOUTES les apps (base + temporaires)
const readAllApps = () => {
  const baseApps = readBaseApps();
  const tempApps = readTempApps();
  
  // Fusionner et dédupliquer par ID (temp override base)
  const allAppsMap = new Map();
  baseApps.forEach(app => allAppsMap.set(app.id, app));
  tempApps.forEach(app => allAppsMap.set(app.id, app));
  
  return Array.from(allAppsMap.values());
};

// Helper: Écrire les données temporaires
const writeTempApps = (apps) => {
  try {
    fs.writeFileSync(TEMP_DATA_FILE, JSON.stringify(apps, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing temp apps:', error);
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
      // Récupérer toutes les apps (base + temporaires)
      const apps = readAllApps();
      return res.status(200).json({
        success: true,
        apps: apps
      });
    }

    if (req.method === 'POST') {
      // Sauvegarder toutes les apps (on stocke tout en temporaire)
      const { apps } = req.body;
      
      if (!Array.isArray(apps)) {
        return res.status(400).json({
          success: false,
          error: 'Apps must be an array'
        });
      }

      // Séparer les apps de base et les nouvelles
      const baseApps = readBaseApps();
      const baseIds = new Set(baseApps.map(a => a.id));
      
      // Ne garder en temp que les apps qui ne sont pas dans la base
      const tempApps = apps.filter(app => !baseIds.has(app.id));
      
      const success = writeTempApps(tempApps);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Custom apps saved successfully',
          apps: readAllApps()
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to save apps'
        });
      }
    }

    if (req.method === 'DELETE') {
      // Supprimer une app
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required'
        });
      }

      // On ne peut supprimer que les apps temporaires
      const tempApps = readTempApps();
      const filteredApps = tempApps.filter(app => app.id !== id);
      const success = writeTempApps(filteredApps);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'App deleted successfully',
          apps: readAllApps()
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
