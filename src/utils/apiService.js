/**
 * Service API pour récupérer les données des applications
 */
import { APPS_DATA } from '../constants/appsData';
import { sanitizeApplication, migrateFromOldFormat } from '../models';

// Détection automatique de l'environnement
const API_URL = import.meta.env.PROD 
  ? '/api'  // Production (Vercel) - utilise les API routes
  : 'http://localhost:3001/api';  // Développement local

/**
 * Normalise et valide une application en utilisant le nouveau modèle
 * Assure la compatibilité avec l'ancien format
 */
const normalizeApp = (appData) => {
  try {
    // Si l'app utilise 'grade' au lieu de 'trustiScore', migrer
    if (appData.grade && !appData.trustiScore) {
      return migrateFromOldFormat(appData);
    }
    
    // Sinon, juste nettoyer et normaliser
    return sanitizeApplication(appData);
  } catch (error) {
    console.warn('Erreur de normalisation pour', appData?.name, ':', error.message);
    // En cas d'erreur, retourner les données telles quelles
    return appData;
  }
};

/**
 * Fetch TrustiApps (apps respectueuses de la vie privée)
 * Source: F-Droid + Exodus Privacy
 */
export const fetchTrustiApps = async () => {
  try {
    const response = await fetch(`${API_URL}/trusti-apps`);
    const data = await response.json();
    
    if (data.success && data.apps.length > 0) {
      // Normaliser les données avec le nouveau modèle
      return data.apps.map(normalizeApp);
    }
    
    // Return fallback data if no apps received
    return APPS_DATA.filter(a => a.id >= 1000).map(normalizeApp);
  } catch (error) {
    console.error('Error fetching trusti apps from backend:', error);
    // Return fallback data in case of error
    return APPS_DATA.filter(a => a.id >= 1000).map(normalizeApp);
  }
};
