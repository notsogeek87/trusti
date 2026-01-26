/**
 * Service API pour récupérer les données des applications
 */
import { APPS_DATA } from '../constants/appsData';

// Détection automatique de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'  // Production (Vercel) - utilise les API routes
  : 'http://localhost:3001/api';  // Développement local

/**
 * Fetch top apps from backend API
 */
export const fetchTopAppsInFrance = async () => {
  try {
    const response = await fetch(`${API_URL}/top-apps`);
    const data = await response.json();
    
    if (data.success && data.apps.length > 0) {
      return data.apps;
    }
    
    // Return fallback data if no apps received
    return APPS_DATA;
  } catch (error) {
    console.error('Error fetching top apps from backend:', error);
    // Return fallback data in case of error
    return APPS_DATA;
  }
};

/**
 * Rafraîchit les données périodiquement
 */
export const setupAutoRefresh = (callback, intervalMinutes = 60) => {
  const intervalId = setInterval(async () => {
    const data = await fetchTopAppsInFrance();
    callback(data);
  }, intervalMinutes * 60 * 1000);
  
  return () => clearInterval(intervalId);
};
