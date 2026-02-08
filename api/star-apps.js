// Vercel Serverless Function - Star Apps Management
import dbService from '../server/database/service-postgres.js';

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
      // Récupérer toutes les apps de type 'star'
      const apps = await dbService.getAppsByType('star');
      return res.status(200).json({
        success: true,
        apps: apps
      });
    }

    if (req.method === 'POST') {
      // Créer une nouvelle star app
      const appData = { ...req.body, appType: 'star' };
      const newApp = await dbService.createApp(appData);
      
      return res.status(200).json({
        success: true,
        message: 'Star app created successfully',
        app: newApp
      });
    }

    if (req.method === 'PUT') {
      // Mettre à jour une star app existante
      const { id, ...appData } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required'
        });
      }

      const updatedApp = await dbService.updateApp(id, { ...appData, appType: 'star' });
      
      if (updatedApp) {
        return res.status(200).json({
          success: true,
          message: 'Star app updated successfully',
          app: updatedApp
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'App not found'
        });
      }
    }

    if (req.method === 'DELETE') {
      // Supprimer une star app
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required'
        });
      }

      const success = await dbService.deleteApp(id);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Star app deleted successfully'
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'App not found'
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
