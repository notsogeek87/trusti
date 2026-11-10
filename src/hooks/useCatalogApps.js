import { useState, useEffect } from 'react';
import { TABS } from '../constants/tabs';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';
import { normalizeApiApps } from '../utils/appListing';

const PAGE_SIZE = 20;
const FULL_LOAD_BATCH_SIZE = 50;

// Tri par grade (même ordre que l'affichage du catalogue) : chaque page
// s'ajoute à la fin sans réordonner les cartes déjà visibles, et l'offset
// pointe toujours dans le même ordre.
const pageUrl = (limit, offset) => `${API_URL}/apps?limit=${limit}&offset=${offset}&sortBy=grade`;

/**
 * Catalogue des apps, chargé par pages (défilement infini). Il est chargé en
 * entier dès qu'une catégorie est choisie ou que « Mes Apps » est ouvert
 * (filtre côté client, et recherche des alternatives).
 */
export const useCatalogApps = ({ activeTab, selectedCategory }) => {
  const [apps, setApps] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [allAppsLoaded, setAllAppsLoaded] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
    hasMore: false,
    isLoadingMore: false,
  });

  // Première page au montage. Pas de rechargement automatique ensuite (il
  // interférerait avec la pagination) : rafraîchir la page suffit.
  useEffect(() => {
    const loadFirstPage = async () => {
      try {
        const data = await cachedFetchJSON(pageUrl(PAGE_SIZE, 0));
        setApps(normalizeApiApps(data));
        if (data.pagination) {
          setPagination({
            total: data.pagination.total,
            limit: data.pagination.limit,
            offset: 0,
            hasMore: data.pagination.hasMore,
            isLoadingMore: false,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des applications:', error);
        setApps([]);
        setPagination(prev => ({ ...prev, isLoadingMore: false }));
      } finally {
        setIsLoadingApps(false);
      }
    };
    loadFirstPage();
  }, []);

  // Chargement complet quand une catégorie est choisie ou sur « Mes Apps »
  useEffect(() => {
    const loadAll = async () => {
      const needsAllApps = selectedCategory !== 'Toutes' || activeTab === TABS.MY_APPS;
      if (!needsAllApps || allAppsLoaded) return;

      // `pagination.hasMore` vaut false à l'état initial : tant que la
      // première page n'a pas répondu (total inconnu), on conclurait à tort
      // qu'il n'y a rien à charger (arrivée directe sur « Mes Apps »).
      if (pagination.total === 0) return;

      if (!pagination.hasMore) {
        setAllAppsLoaded(true);
        return;
      }

      setIsLoadingApps(true);
      try {
        let allApps = [...apps];
        let offset = apps.length;
        let hasMore = true;

        while (hasMore && offset < pagination.total) {
          const data = await cachedFetchJSON(pageUrl(FULL_LOAD_BATCH_SIZE, offset));
          const batch = normalizeApiApps(data);
          if (batch.length === 0) break;

          const knownIds = new Set(allApps.map(a => a.id));
          allApps = [...allApps, ...batch.filter(a => !knownIds.has(a.id))];
          offset += batch.length;
          hasMore = data.pagination?.hasMore || false;
        }

        setApps(allApps);
        setAllAppsLoaded(true);
        setPagination({
          total: pagination.total,
          limit: 0,
          offset: allApps.length,
          hasMore: false,
          isLoadingMore: false,
        });
      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
      } finally {
        setIsLoadingApps(false);
      }
    };
    loadAll();
  }, [selectedCategory, activeTab, pagination.total]);

  // Fin du chargement initial, avec un petit délai pour une transition fluide
  useEffect(() => {
    if (!isLoadingApps) {
      setTimeout(() => setIsInitialLoading(false), 300);
    }
  }, [isLoadingApps]);

  // Page suivante (défilement infini)
  const loadMoreApps = async () => {
    if (pagination.isLoadingMore || !pagination.hasMore) return;

    setPagination(prev => ({ ...prev, isLoadingMore: true }));
    try {
      const nextOffset = pagination.offset + pagination.limit;
      const data = await cachedFetchJSON(pageUrl(pagination.limit, nextOffset));
      const page = normalizeApiApps(data);
      setApps(prev => [...prev, ...page]);
      if (data.pagination) {
        setPagination({
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: nextOffset,
          hasMore: data.pagination.hasMore,
          isLoadingMore: false,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de plus d\'applications:', error);
      setPagination(prev => ({ ...prev, isLoadingMore: false }));
    }
  };

  return { apps, isLoadingApps, isInitialLoading, pagination, loadMoreApps };
};
