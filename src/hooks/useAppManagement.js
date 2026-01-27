import { useState, useMemo, useEffect } from 'react';
import { APPS_DATA } from '../constants/appsData';
import { TABS } from '../constants/tabs';
import { fetchTopAppsInFrance, fetchTrustiApps, setupAutoRefresh } from '../utils/apiService';

/**
 * Hook personnalisé pour gérer l'état des applications
 * Maintenant avec support de la sauvegarde par utilisateur
 */
export const useAppManagement = (currentUser, saveUserData, getUserData) => {
  const [activeTab, setActiveTab] = useState(TABS.TOP);
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set());
  const [migratedApps, setMigratedApps] = useState(new Set());
  const [customMigrations, setCustomMigrations] = useState(new Map());
  const [selectedApp, setSelectedApp] = useState(null);
  const [topApps, setTopApps] = useState([]);
  const [trustiApps, setTrustiApps] = useState([]);
  const [isLoadingTopApps, setIsLoadingTopApps] = useState(true);
  const [isLoadingTrustiApps, setIsLoadingTrustiApps] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
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
      // Mode non connecté : liste vide
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

  // Charger les données du top au montage du composant
  useEffect(() => {
    const loadTopApps = async () => {
      try {
        const data = await fetchTopAppsInFrance();
        setTopApps(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Erreur lors du chargement des top apps:', error);
        // En cas d'erreur, utiliser les données statiques
        setTopApps(APPS_DATA.filter(a => a.id < 1000));
      } finally {
        setIsLoadingTopApps(false);
      }
    };

    loadTopApps();

    // Configurer le rafraîchissement automatique toutes les heures
    const cleanup = setupAutoRefresh((data) => {
      setTopApps(data);
      setLastUpdate(new Date());
    }, 60);

    return cleanup;
  }, []);

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
        
        setTrustiApps(customAppsArray);
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

  // Détecter quand le chargement initial est terminé
  useEffect(() => {
    if (!isLoadingTopApps && !isLoadingTrustiApps) {
      // Attendre un peu pour une transition fluide
      setTimeout(() => setIsInitialLoading(false), 300);
    }
  }, [isLoadingTopApps, isLoadingTrustiApps]);

  // Filtrer les applications selon l'onglet actif et la recherche
  const filteredApps = useMemo(() => {
    let list = [...APPS_DATA];
    
    if (activeTab === TABS.TOP) {
      // Utiliser les données live si disponibles, sinon les données statiques
      list = topApps.length > 0 ? topApps : APPS_DATA.filter(a => a.id < 1000);
    } else if (activeTab === TABS.ALTERNATIVES) {
      // Afficher UNIQUEMENT les TrustiApps ajoutées par l'admin (triées alphabétiquement)
      list = [...trustiApps].sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeTab === TABS.MY_APPS) {
      // Combiner les apps statiques ET les apps du top (Play Store) ET TrustiApps
      const allApps = [...APPS_DATA, ...topApps, ...trustiApps];
      
      // Créer un Map pour dédupliquer par ID (le dernier gagne)
      const appsById = new Map();
      allApps.forEach(app => {
        appsById.set(app.id, app);
      });
      
      // Filtrer uniquement les apps dans myApps
      list = Array.from(appsById.values()).filter(app => myApps.has(app.id));
    }
    
    return list.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, myApps, searchTerm, topApps, trustiApps]);

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
    topApps,
    trustiApps,
    isLoadingTopApps,
    isLoadingTrustiApps,
    isInitialLoading,
    lastUpdate,
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
