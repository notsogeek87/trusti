import { useState, useEffect } from 'react';
import { TABS } from '../constants/tabs';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';
import { normalizeApiApps, normalizeApp } from '../utils/appListing';

const AWARDS_TTL = 10 * 60 * 1000;

/**
 * Apps du palmarès (show_in_awards), chargées à chaque passage sur l'onglet.
 */
export const useAwardsApps = (activeTab) => {
  const [awardsApps, setAwardsApps] = useState([]);
  const [isLoadingAwards, setIsLoadingAwards] = useState(false);

  useEffect(() => {
    if (activeTab !== TABS.TOP_ALTERNATIVES || isLoadingAwards) return;

    const loadAwardsApps = async () => {
      setIsLoadingAwards(true);
      try {
        const data = await cachedFetchJSON(`${API_URL}/apps?awards=true`, { ttl: AWARDS_TTL });
        setAwardsApps(normalizeApiApps(data));
      } catch (error) {
        console.error('❌ Erreur lors du chargement des apps Awards:', error);
        setAwardsApps([]);
      } finally {
        setIsLoadingAwards(false);
      }
    };
    loadAwardsApps();
  }, [activeTab]);

  return { awardsApps, isLoadingAwards };
};

/**
 * Données complètes des apps de « Mes Apps », chargées par leurs IDs quand
 * l'onglet est actif, ou qu'un autre écran en a besoin (`needsMyAppsData`,
 * ex : l'espace de stockage, qui liste « Mes Apps » depuis n'importe quel onglet).
 *
 * Les apps supprimées du catalogue (absentes de la réponse) sont signalées
 * via `onMissingApps`, pour les retirer au lieu d'afficher un « Chargement… »
 * éternel.
 */
export const useMyAppsData = ({ activeTab, myApps, needsMyAppsData, onMissingApps }) => {
  const [myAppsData, setMyAppsData] = useState([]);
  const [isLoadingMyApps, setIsLoadingMyApps] = useState(false);

  useEffect(() => {
    const isNeeded = activeTab === TABS.MY_APPS || needsMyAppsData;
    if (!isNeeded || myApps.size === 0 || isLoadingMyApps) return;

    const loadMyApps = async () => {
      setIsLoadingMyApps(true);
      try {
        const ids = Array.from(myApps);
        const data = await cachedFetchJSON(`${API_URL}/apps?ids=${encodeURIComponent(ids.join(','))}`);
        const loaded = normalizeApiApps(data);
        setMyAppsData(loaded);

        // Seulement si l'appel a réussi : sinon toutes les apps sembleraient absentes
        if (data.success) {
          const knownIds = new Set(loaded.map(app => app.id));
          const missingIds = ids.map(String).filter(id => !knownIds.has(id));
          if (missingIds.length > 0) onMissingApps(missingIds);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement de Mes Apps:', error);
        setMyAppsData([]);
      } finally {
        setIsLoadingMyApps(false);
      }
    };
    loadMyApps();
  }, [activeTab, myApps, needsMyAppsData]);

  return { myAppsData, isLoadingMyApps };
};

/**
 * Recherche dans tout le catalogue via l'API (le debounce est fait dans
 * SearchBar). La réponse d'une recherche dépassée est ignorée : une réponse
 * lente à « fa » ne doit pas écraser celle de « facebook ».
 */
export const useAppSearch = (searchTerm) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${API_URL}/apps?search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        if (cancelled) return;
        if (data.success) setSearchResults(data.apps.map(normalizeApp));
      } catch (error) {
        if (cancelled) return;
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    performSearch();
    return () => { cancelled = true; };
  }, [searchTerm]);

  return { searchResults, isSearching };
};
