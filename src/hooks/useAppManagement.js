import { useState, useMemo, useEffect } from 'react';
import { TABS } from '../constants/tabs';

/**
 * Hook personnalisé pour gérer l'état des applications
 * Maintenant avec support de la sauvegarde par utilisateur
 * 
 * Toutes les apps sont des Applications avec un GRADE (A, B, C, D, E)
 * Le filtrage se fait côté front selon les besoins
 */
export const useAppManagement = (currentUser, saveUserData, getUserData) => {
  const [activeTab, setActiveTab] = useState(TABS.APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set());
  const [migratedApps, setMigratedApps] = useState(new Set());
  const [customMigrations, setCustomMigrations] = useState(new Map());
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Liste unifiée de toutes les applications
  const [apps, setApps] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
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

  // Charger toutes les applications au montage
  useEffect(() => {
    const loadApps = async () => {
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        const response = await fetch(`${API_URL}/apps`);
        const data = await response.json();
        const appsArray = data.success ? data.apps : [];
        
        // Normaliser les IDs en strings pour la cohérence
        const normalizedApps = appsArray.map(app => ({
          ...app,
          id: String(app.id),
          replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
          replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
        }));
        
        setApps(normalizedApps);
      } catch (error) {
        console.error('Erreur lors du chargement des applications:', error);
        setApps([]);
      } finally {
        setIsLoadingApps(false);
      }
    };

    loadApps();
    
    // Recharger régulièrement pour détecter les modifications par l'admin
    const intervalId = setInterval(() => {
      loadApps();
    }, 30000); // Vérifier toutes les 30 secondes
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Détecter quand le chargement initial est terminé
  useEffect(() => {
    if (!isLoadingApps) {
      // Attendre un peu pour une transition fluide
      setTimeout(() => setIsInitialLoading(false), 300);
    }
  }, [isLoadingApps]);

  // Filtrer les applications selon l'onglet actif et la recherche
  const filteredApps = useMemo(() => {
    let list = [];
    
    if (activeTab === TABS.APPLICATIONS) {
      // Toutes les apps du catalogue
      list = [...apps];
      
      // Trier par grade (A > B > C > D > E) puis par nom
      const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
      list.sort((a, b) => {
        const gradeCompare = (gradeOrder[a.grade] || 999) - (gradeOrder[b.grade] || 999);
        if (gradeCompare !== 0) return gradeCompare;
        return a.name.localeCompare(b.name);
      });
    } else if (activeTab === TABS.MY_APPS) {
      // Filtrer uniquement les apps dans myApps et ajouter les alternatives
      list = apps
        .filter(app => myApps.has(app.id))
        .map(app => {
          // Chercher si une app avec meilleur grade remplace cette app (alternative)
          const replacement = apps.find(replacementApp => {
            // L'app de remplacement doit avoir un meilleur grade (A, B, C)
            const goodGrades = ['A', 'B', 'C'];
            if (!goodGrades.includes(replacementApp.grade)) {
              return false;
            }
            
            // Vérifier si elle remplace cette app
            if (replacementApp.replacesAppIds && Array.isArray(replacementApp.replacesAppIds)) {
              return replacementApp.replacesAppIds.includes(app.id);
            }
            return replacementApp.replacesAppId === app.id;
          });
          
          if (replacement) {
            return {
              ...app,
              alternative: replacement.name,
              altIcon: replacement.icon,
              altGrade: replacement.grade
            };
          }
          return app;
        });
      
      // Trier par grade (E > D > C > B > A - du plus mauvais au meilleur) puis par nom
      const gradeOrder = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5 };
      list.sort((a, b) => {
        const gradeCompare = (gradeOrder[a.grade] || 999) - (gradeOrder[b.grade] || 999);
        if (gradeCompare !== 0) return gradeCompare;
        return a.name.localeCompare(b.name);
      });
    } else if (activeTab === TABS.TOP_ALTERNATIVES) {
      // Filtrer uniquement les apps avec showInAwards activé
      list = apps.filter(app => app.showInAwards === true);
      
      // Trier par catégorie puis par nom
      list.sort((a, b) => {
        const categoryCompare = (a.category || '').localeCompare(b.category || '');
        if (categoryCompare !== 0) return categoryCompare;
        return a.name.localeCompare(b.name);
      });
    }
    
    return list.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, myApps, searchTerm, apps]);

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
    apps,
    isLoadingApps,
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
