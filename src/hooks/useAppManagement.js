import { useState, useMemo } from 'react';
import { APPS_DATA } from '../constants/appsData';
import { TABS } from '../constants/tabs';

/**
 * Hook personnalisé pour gérer l'état des applications
 */
export const useAppManagement = () => {
  const [activeTab, setActiveTab] = useState(TABS.TOP);
  const [searchTerm, setSearchTerm] = useState("");
  const [myApps, setMyApps] = useState(new Set([1, 4, 8, 9]));
  const [migratedApps, setMigratedApps] = useState(new Set([1]));
  const [customMigrations, setCustomMigrations] = useState(
    new Map([[1, "Mistral (Le Chat)"], [8, "Firefox"]])
  );
  const [selectedApp, setSelectedApp] = useState(null);

  // Filtrer les applications selon l'onglet actif et la recherche
  const filteredApps = useMemo(() => {
    let list = [...APPS_DATA];
    
    if (activeTab === TABS.TOP) {
      list = list.filter(a => a.id < 1000);
    } else if (activeTab === TABS.ALTERNATIVES) {
      list = list.filter(a => a.id >= 1000);
    } else if (activeTab === TABS.MY_APPS) {
      list = list.filter(app => myApps.has(app.id));
    }
    
    return list.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, myApps, searchTerm]);

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
