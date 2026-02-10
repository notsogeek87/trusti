import { useState, useMemo, useEffect } from 'react';
import { APPS_DATA } from '../constants/appsData';
import { TABS } from '../constants/tabs';
import { fetchTrustiApps } from '../utils/apiService';

/**
 * Hook personnalisé pour gérer l'état des applications
 * Maintenant avec support de la sauvegarde par utilisateur
 */
export const useAppManagement = (currentUser, saveUserData, getUserData) => {
  const [activeTab, setActiveTab] = useState(TABS.APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set());
  const [migratedApps, setMigratedApps] = useState(new Set());
  const [customMigrations, setCustomMigrations] = useState(new Map());
  const [selectedApp, setSelectedApp] = useState(null);
  const [trustiApps, setTrustiApps] = useState([]);
  const [starApps, setStarApps] = useState([]);
  const [isLoadingTrustiApps, setIsLoadingTrustiApps] = useState(true);
  const [isLoadingStarApps, setIsLoadingStarApps] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger les données de l'utilisateur connecté
  useEffect(() => {
    setIsInitialized(false); // Réinitialiser avant de charger
    
    if (currentUser && getUserData) {
      const userData = getUserData('apps');
      if (userData) {
        // Utilisateur existant avec des données sauvegardées
        setMyApps(new Set(userData.myApps || []));
        setMigratedApps(new Set(userData.migratedApps || []));
        setCustomMigrations(new Map(userData.customMigrations || []));
      } else {
        // Nouvel utilisateur : état vide
        setMyApps(new Set());
        setMigratedApps(new Set());
        setCustomMigrations(new Map());
      }
    } else {
      // Mode non connecté : état vide
      setMyApps(new Set());
      setMigratedApps(new Set());
      setCustomMigrations(new Map());
    }
    
    // Petite temporisation pour s'assurer que les states sont bien définis
    setTimeout(() => setIsInitialized(true), 100);
  }, [currentUser, getUserData]);

  // Sauvegarder les données quand elles changent (mais pas au premier chargement)
  useEffect(() => {
    if (isInitialized && currentUser && saveUserData) {
      saveUserData('apps', {
        myApps: Array.from(myApps),
        migratedApps: Array.from(migratedApps),
        customMigrations: Array.from(customMigrations.entries())
      });
    }
  }, [myApps, migratedApps, customMigrations]);
  // Note: On ne met pas saveUserData et currentUser dans les dépendances pour éviter la boucle

  // Charger les TrustiApps au montage
  useEffect(() => {
    const loadTrustiApps = async () => {
      try {
        // Charger UNIQUEMENT les TrustiApps ajoutées par l'admin
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        const customResponse = await fetch(`${API_URL}/custom-trusti-apps`);
        const customData = await customResponse.json();
        const customAppsArray = customData.success ? customData.apps : [];
        
        // Normaliser les IDs en strings pour la cohérence
        const normalizedApps = customAppsArray.map(app => ({
          ...app,
          id: String(app.id),
          replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
          replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
        }));
        
        setTrustiApps(normalizedApps);
      } catch (error) {
        console.error('Erreur lors du chargement des TrustiApps:', error);
        // En cas d'erreur, liste vide
        setTrustiApps([]);
      } finally {
        setIsLoadingTrustiApps(false);
      }
    };

    loadTrustiApps();
    
    // Recharger régulièrement pour détecter les modifications par l'admin
    const intervalId = setInterval(() => {
      loadTrustiApps();
    }, 10000); // Vérifier toutes les 10 secondes
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Charger les StarApps au montage
  useEffect(() => {
    const loadStarApps = async () => {
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        const response = await fetch(`${API_URL}/star-apps`);
        const data = await response.json();
        const appsArray = data.success ? data.apps : [];
        
        // Normaliser les IDs en strings pour la cohérence
        const normalizedApps = appsArray.map(app => ({
          ...app,
          id: String(app.id)
        }));
        
        setStarApps(normalizedApps);
      } catch (error) {
        console.error('Erreur lors du chargement des StarApps:', error);
        setStarApps([]);
      } finally {
        setIsLoadingStarApps(false);
      }
    };

    loadStarApps();
    
    // Recharger régulièrement pour détecter les modifications par l'admin
    const intervalId = setInterval(() => {
      loadStarApps();
    }, 10000); // Vérifier toutes les 10 secondes
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Détecter quand le chargement initial est terminé
  useEffect(() => {
    if (!isLoadingTrustiApps && !isLoadingStarApps) {
      // Attendre un peu pour une transition fluide
      setTimeout(() => setIsInitialLoading(false), 300);
    }
  }, [isLoadingTrustiApps, isLoadingStarApps]);

  // Filtrer les applications selon l'onglet actif et la recherche
  const filteredApps = useMemo(() => {
    let list = [...APPS_DATA];
    
    if (activeTab === TABS.APPLICATIONS) {
      // Combiner toutes les apps : starApps (D/E) + trustiApps (A/B/C)
      const dEApps = starApps.filter(app => app.grade === 'D' || app.grade === 'E');
      const abcApps = trustiApps.filter(app => app.grade === 'A' || app.grade === 'B' || app.grade === 'C');
      
      // Fusionner et dédupliquer par ID
      const appsById = new Map();
      [...dEApps, ...abcApps].forEach(app => {
        appsById.set(app.id, app);
      });
      
      list = Array.from(appsById.values());
      
      // Trier par grade (A > B > C > D > E) puis par nom
      const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
      list.sort((a, b) => {
        const gradeCompare = (gradeOrder[a.grade] || 999) - (gradeOrder[b.grade] || 999);
        if (gradeCompare !== 0) return gradeCompare;
        return a.name.localeCompare(b.name);
      });
    } else if (activeTab === TABS.MY_APPS) {
      // Combiner les apps statiques ET TrustiApps ET StarApps
      const allApps = [...APPS_DATA, ...trustiApps, ...starApps];
      
      // Créer un Map pour dédupliquer par ID (le dernier gagne)
      const appsById = new Map();
      allApps.forEach(app => {
        appsById.set(app.id, app);
      });
      
      // Filtrer uniquement les apps dans myApps et ajouter les alternatives
      list = Array.from(appsById.values())
        .filter(app => myApps.has(app.id))
        .map(app => {
          // Chercher si une TrustiApp remplace cette app (support ancien et nouveau format)
          const replacement = trustiApps.find(ta => {
            if (ta.replacesAppIds && Array.isArray(ta.replacesAppIds)) {
              return ta.replacesAppIds.includes(app.id);
            }
            return ta.replacesAppId === app.id;
          });
          if (replacement) {
            return {
              ...app,
              alternative: replacement.name,
              altIcon: replacement.icon
            };
          }
          return app;
        });
    }
    
    return list.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, myApps, searchTerm, trustiApps, starApps]);

  // Ajouter/retirer une app de "Mes Apps"
  const toggleMyApp = (e, id) => {
    e.stopPropagation();
    setMyApps(prev => {
      const newList = new Set(prev);
      if (newList.has(id)) {
        newList.delete(id);
      } else {
        newList.add(id);
      }
      return newList;
    });
  };

  // Marquer/démarquer comme migré
  const toggleMigrate = (e, id) => {
    e.stopPropagation();
    setMigratedApps(prev => {
      const newList = new Set(prev);
      if (newList.has(id)) {
        newList.delete(id);
      } else {
        newList.add(id);
      }
      return newList;
    });
  };

  // Définir une migration personnalisée
  const setCustomMigration = (appId, alternativeName) => {
    setCustomMigrations(prev => new Map(prev).set(appId, alternativeName));
  };

  return {
    // État
    activeTab,
    searchTerm,
    myApps,
    migratedApps,
    customMigrations,
    selectedApp,
    trustiApps,
    starApps,
    isLoadingTrustiApps,
    isLoadingStarApps,
    isInitialLoading,
    filteredApps,
    
    // Actions
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleMigrate,
    setCustomMigration,
    setSelectedApp,
  };
};
