// Vercel Serverless Function - Apps Management (Trusti & Star)
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
    // Extraire le type depuis l'URL ou le body
    const { type } = req.query; // ?type=trusti ou ?type=star
    
    if (req.method === 'GET') {
      // GET /api/apps?type=trusti
      // GET /api/apps?type=star
      // GET /api/apps (toutes les apps)
      
      let apps;
      if (type) {
        apps = await dbService.getAppsByType(type);
      } else {
        apps = await dbService.getAllApps();
      }
      
      return res.status(200).json({
        success: true,
        apps: apps
      });
    }

    if (req.method === 'POST') {
      // POST /api/apps?type=trusti
      // POST /api/apps (type dans le body)
      const appData = req.body;
      const appType = type || appData.appType || 'regular';
      
      const newApp = await dbService.createApp({ ...appData, appType });
      
      return res.status(200).json({
        success: true,
        message: 'App created successfully',
        app: newApp
      });
    }

    if (req.method === 'PUT') {
      // PUT /api/apps?id=xxx
      const { id } = req.query;
      const appData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'App ID is required'
        });
      }

      const updatedApp = await dbService.updateApp(id, appData);
      
      if (updatedApp) {
        return res.status(200).json({
          success: true,
          message: 'App updated successfully',
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
      // DELETE /api/apps?id=xxx
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
          message: 'App deleted successfully'
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'App not found'
        });
      }
    }

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
