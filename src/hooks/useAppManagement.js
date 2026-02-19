import { useState, useMemo, useEffect } from 'react';
import { TABS } from '../constants/tabs';

/**
 * Hook personnalisé pour gérer l'état des applications
 * Maintenant avec support de la sauvegarde par utilisateur
 * 
 * Toutes les apps sont des Applications avec un GRADE (A, B, C, D, E)
 * Le filtrage se fait côté front selon les besoins
 */
export const useAppManagement = (currentUser, saveUserData, getUserData, selectedCategory = 'Toutes') => {
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
  
  // État pour les résultats de recherche
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // État de pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
    isLoadingMore: false
  });
  
  // État pour savoir si toutes les apps sont chargées (pour le filtrage par catégorie)
  const [allAppsLoaded, setAllAppsLoaded] = useState(false);

  // État spécifique pour les apps Awards (show_in_awards = 1)
  const [awardsApps, setAwardsApps] = useState([]);
  const [isLoadingAwards, setIsLoadingAwards] = useState(false);
  const [awardsLoaded, setAwardsLoaded] = useState(false);

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
    const loadApps = async (append = false) => {
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        // Utiliser une pagination avec limit=20 pour améliorer les performances
        // et permettre le chargement progressif des applications
        const currentOffset = append ? pagination.offset + pagination.limit : 0;
        const limit = 20; // Charger 20 apps par page
        const url = `${API_URL}/apps?limit=${limit}&offset=${currentOffset}`;
        console.log('🔍 Chargement apps:', { url, append, currentOffset, limit });
        
        const response = await fetch(url);
        const data = await response.json();
        const appsArray = data.success ? data.apps : [];
        
        console.log('📦 Apps reçues:', { 
          count: appsArray.length, 
          total: data.pagination?.total,
          hasMore: data.pagination?.hasMore 
        });
        
        // Normaliser les IDs en strings pour la cohérence
        const normalizedApps = appsArray.map(app => ({
          ...app,
          id: String(app.id),
          replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
          replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
        }));
        
        // Mettre à jour les apps (ajouter ou remplacer)
        if (append) {
          setApps(prev => [...prev, ...normalizedApps]);
        } else {
          setApps(normalizedApps);
        }
        
        // Mettre à jour l'état de pagination
        if (data.pagination) {
          setPagination({
            total: data.pagination.total,
            limit: data.pagination.limit,
            offset: currentOffset,
            hasMore: data.pagination.hasMore,
            isLoadingMore: false
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des applications:', error);
        if (!append) {
          setApps([]);
        }
        setPagination(prev => ({ ...prev, isLoadingMore: false }));
      } finally {
        if (!append) {
          setIsLoadingApps(false);
        }
      }
    };

    loadApps();
    
    // Note: Le rechargement automatique est désactivé pour ne pas interférer avec la pagination
    // Si l'admin modifie des données, l'utilisateur peut rafraîchir la page manuellement
  }, []); // Pas de dépendance à pagination pour éviter les boucles
  
  // Charger les apps Awards quand l'onglet TOP_ALTERNATIVES est actif
  useEffect(() => {
    const loadAwardsApps = async () => {
      // Ne charger que si l'onglet Awards est actif
      if (activeTab !== TABS.TOP_ALTERNATIVES) {
        return;
      }
      
      // Si déjà en train de charger, ne rien faire
      if (isLoadingAwards) {
        return;
      }
      
      console.log('🏆 Chargement des apps Awards (show_in_awards = 1)');
      setIsLoadingAwards(true);
      
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        // Ajouter un timestamp pour éviter le cache
        const url = `${API_URL}/apps?awards=true&_t=${Date.now()}`;
        console.log('🔍 URL Awards:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        const appsArray = data.success ? data.apps : [];
        
        console.log('📦 Apps Awards reçues:', appsArray.length);
        
        // Normaliser les IDs en strings pour la cohérence
        const normalizedApps = appsArray.map(app => ({
          ...app,
          id: String(app.id),
          replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
          replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
        }));
        
        setAwardsApps(normalizedApps);
        setAwardsLoaded(true);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des apps Awards:', error);
        setAwardsApps([]);
      } finally {
        setIsLoadingAwards(false);
      }
    };
    
    loadAwardsApps();
  }, [activeTab]); // Recharger à chaque changement d'onglet
  
  // Charger toutes les apps quand nécessaire :
  // - Une catégorie est sélectionnée (sauf "Toutes")
  // - L'onglet MY_APPS est actif
  useEffect(() => {
    const loadAllAppsForCategory = async () => {
      // Déterminer si on a besoin de charger toutes les apps
      const needsAllApps = 
        selectedCategory !== 'Toutes' || 
        activeTab === TABS.MY_APPS;
      
      // Si on n'a pas besoin de toutes les apps, ne rien faire
      if (!needsAllApps) {
        return;
      }
      
      // Si toutes les apps sont déjà chargées, ne rien faire
      if (allAppsLoaded) {
        console.log('✅ Toutes les apps déjà chargées');
        return;
      }
      
      // S'il n'y a plus d'apps à charger, marquer comme terminé
      if (!pagination.hasMore) {
        console.log('✅ Toutes les apps déjà présentes (pas de hasMore)');
        setAllAppsLoaded(true);
        return;
      }
      
      console.log('🔄 Chargement progressif de TOUTES les apps pour:', {
        selectedCategory: selectedCategory !== 'Toutes' ? selectedCategory : null,
        activeTab
      });
      console.log('📊 État avant chargement:', { 
        appsCount: apps.length, 
        total: pagination.total, 
        hasMore: pagination.hasMore 
      });
      
      setIsLoadingApps(true);
      
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        let allApps = [...apps]; // Commencer avec les apps déjà chargées
        let offset = apps.length;
        const batchSize = 50;
        let hasMore = true;
        
        console.log('🔄 Chargement par lots de', batchSize, 'apps...');
        
        // Charger par lots jusqu'à avoir tout
        while (hasMore && offset < pagination.total) {
          const url = `${API_URL}/apps?limit=${batchSize}&offset=${offset}`;
          console.log(`📦 Chargement lot: offset=${offset}, limit=${batchSize}`);
          
          const response = await fetch(url);
          const data = await response.json();
          const appsArray = data.success ? data.apps : [];
          
          if (appsArray.length === 0) {
            break;
          }
          
          // Normaliser les IDs en strings pour la cohérence
          const normalizedApps = appsArray.map(app => ({
            ...app,
            id: String(app.id),
            replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
            replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
          }));
          
          allApps = [...allApps, ...normalizedApps];
          offset += appsArray.length;
          hasMore = data.pagination?.hasMore || false;
          
          console.log(`✅ Lot chargé: ${appsArray.length} apps (total: ${allApps.length}/${pagination.total})`);
        }
        
        console.log('✅ Chargement terminé:', allApps.length, 'apps au total');
        
        setApps(allApps);
        setAllAppsLoaded(true);
        
        // Mettre à jour la pagination pour indiquer qu'il n'y a plus rien à charger
        setPagination({
          total: pagination.total,
          limit: 0,
          offset: allApps.length,
          hasMore: false,
          isLoadingMore: false
        });
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
      } finally {
        setIsLoadingApps(false);
      }
    };
    
    loadAllAppsForCategory();
  }, [selectedCategory, activeTab]);

  // Détecter quand le chargement initial est terminé
  useEffect(() => {
    if (!isLoadingApps) {
      // Attendre un peu pour une transition fluide
      setTimeout(() => setIsInitialLoading(false), 300);
    }
  }, [isLoadingApps]);

  // Effectuer une recherche API quand searchTerm change
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si la recherche est vide, réinitialiser les résultats
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Lancer la recherche immédiatement (le debounce est déjà fait dans SearchBar)
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const API_URL = import.meta.env.PROD 
          ? '/api'
          : 'http://localhost:3001/api';
        
        const url = `${API_URL}/apps?search=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Normaliser les IDs en strings pour la cohérence
          const normalizedApps = data.apps.map(app => ({
            ...app,
            id: String(app.id),
            replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
            replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
          }));
          
          setSearchResults(normalizedApps);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [searchTerm]);

  // Filtrer les applications selon l'onglet actif et la recherche
  const filteredApps = useMemo(() => {
    // Pour TOP_ALTERNATIVES, utiliser awardsApps (chargées via API spécifique)
    // sauf si une recherche est active
    if (activeTab === TABS.TOP_ALTERNATIVES && !searchTerm.trim()) {
      return awardsApps; // Déjà triées par catégorie dans l'API
    }
    
    // Si une recherche est active, utiliser les résultats de recherche
    const sourceApps = searchTerm.trim() ? searchResults : apps;
    
    let list = [];
    
    if (activeTab === TABS.APPLICATIONS) {
      // Toutes les apps du catalogue
      list = [...sourceApps];
      
      // Trier par grade (A > B > C > D > E) puis par nom
      const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
      list.sort((a, b) => {
        const gradeCompare = (gradeOrder[a.grade] || 999) - (gradeOrder[b.grade] || 999);
        if (gradeCompare !== 0) return gradeCompare;
        return a.name.localeCompare(b.name);
      });
    } else if (activeTab === TABS.MY_APPS) {
      // Filtrer uniquement les apps dans myApps et ajouter les alternatives
      list = sourceApps
        .filter(app => myApps.has(app.id))
        .map(app => {
          // Chercher si une app avec meilleur grade remplace cette app (alternative)
          // On cherche dans TOUTES les apps (pas seulement sourceApps) pour trouver les alternatives
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
      // Si recherche active, filtrer les résultats de recherche par showInAwards
      list = sourceApps.filter(app => app.showInAwards === true);
      
      // Trier par catégorie puis par nom
      list.sort((a, b) => {
        const categoryCompare = (a.category || '').localeCompare(b.category || '');
        if (categoryCompare !== 0) return categoryCompare;
        return a.name.localeCompare(b.name);
      });
    }
    
    return list;
  }, [activeTab, myApps, searchTerm, searchResults, apps, awardsApps]);

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
  
  // Charger plus d'applications
  const loadMoreApps = async () => {
    if (pagination.isLoadingMore || !pagination.hasMore) return;
    
    setPagination(prev => ({ ...prev, isLoadingMore: true }));
    
    try {
      const API_URL = import.meta.env.PROD 
        ? '/api'
        : 'http://localhost:3001/api';
      
      // Charger la page suivante
      const nextOffset = pagination.offset + pagination.limit;
      const response = await fetch(`${API_URL}/apps?limit=${pagination.limit}&offset=${nextOffset}`);
      const data = await response.json();
      const appsArray = data.success ? data.apps : [];
      
      // Normaliser les IDs en strings pour la cohérence
      const normalizedApps = appsArray.map(app => ({
        ...app,
        id: String(app.id),
        replacesAppId: app.replacesAppId ? String(app.replacesAppId) : undefined,
        replacesAppIds: app.replacesAppIds ? app.replacesAppIds.map(id => String(id)) : undefined
      }));
      
      // Ajouter les nouvelles apps à la liste existante
      setApps(prev => [...prev, ...normalizedApps]);
      
      // Mettre à jour l'état de pagination
      if (data.pagination) {
        setPagination({
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: nextOffset,
          hasMore: data.pagination.hasMore,
          isLoadingMore: false
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de plus d\'applications:', error);
      setPagination(prev => ({ ...prev, isLoadingMore: false }));
    }
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
    isSearching,
    isLoadingAwards,
    filteredApps,
    pagination,
    
    // Actions
    setActiveTab,
    setSearchTerm,
    toggleMyApp,
    toggleMigrate,
    setCustomMigration,
    setSelectedApp,
    loadMoreApps,
  };
};
