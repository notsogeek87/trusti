/**
 * Service API pour récupérer les données des applications
 */
import { sanitizeApplication, migrateFromOldFormat } from '../models';
import { API_URL } from './apiConfig';

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
    
    // Retourner un tableau vide si aucune app reçue
    return [];
  } catch (error) {
    console.error('Error fetching trusti apps from backend:', error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
};
