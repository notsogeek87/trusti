import { useState, useEffect, useMemo, useCallback } from 'react';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';
import { matchingAppIds, parseProfilesParams, writeProfilesParams } from '../utils/appProfiles.js';

const NO_SELECTION = { profiles: [], includeUnknown: false };

const readFromUrl = () => {
  try {
    return parseProfilesParams(window.location.search);
  } catch {
    return NO_SELECTION;
  }
};

// Reporte le filtre dans l'URL (lien partageable) sans recharger ni empiler l'historique.
const writeToUrl = (selection) => {
  try {
    const url = new URL(window.location.href);
    writeProfilesParams(url.searchParams, selection);
    // Virgules lisibles dans le lien (?f=a,b plutôt que ?f=a%2Cb)
    window.history.replaceState(window.history.state, '', url.pathname + url.search.replace(/%2C/g, ',') + url.hash);
  } catch {
    // URL non modifiable (WebView, aperçu) : le filtre marche quand même
  }
};

/**
 * Filtres avancés par profils (voir utils/appProfiles.js) : profils choisis, option
 * « inclure les données non vérifiées », et index des profils (chargé à la première
 * utilisation, puis en cache). Catalogue : `syncUrl` lit et écrit le lien ?f=… ; « Mes Apps »
 * a sa propre sélection, hors URL.
 *
 * @param {{syncUrl?: boolean}} [options]
 * @returns {{profiles: string[], includeUnknown: boolean, toggleProfile: Function,
 *   setIncludeUnknown: Function, clear: Function, matchingIds: Set<string>|null,
 *   isLoading: boolean, hasError: boolean, fromUrl: boolean}}
 *   matchingIds : apps qui répondent à tous les profils choisis ; null sans filtre.
 */
export const useAppProfiles = ({ syncUrl = false } = {}) => {
  const [initial] = useState(() => (syncUrl ? readFromUrl() : NO_SELECTION));
  const [selection, setSelection] = useState(initial);
  const [index, setIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isActive = selection.profiles.length > 0;

  useEffect(() => { if (syncUrl) writeToUrl(selection); }, [syncUrl, selection]);

  useEffect(() => {
    if (!isActive || index) return;
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    cachedFetchJSON(`${API_URL}/apps?profiles=index`)
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.profiles) setIndex(data.profiles);
        else setHasError(true);
      })
      .catch(() => { if (!cancelled) setHasError(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [isActive, index]);

  const toggleProfile = useCallback((key) => {
    setSelection(prev => ({
      ...prev,
      profiles: prev.profiles.includes(key) ? prev.profiles.filter(k => k !== key) : [...prev.profiles, key],
    }));
  }, []);
  const setIncludeUnknown = useCallback((includeUnknown) => setSelection(prev => ({ ...prev, includeUnknown })), []);
  const clear = useCallback(() => setSelection(prev => ({ ...prev, profiles: [] })), []);

  const matchingIds = useMemo(
    () => matchingAppIds(index, selection.profiles, selection.includeUnknown),
    [index, selection]
  );

  return {
    profiles: selection.profiles,
    includeUnknown: selection.includeUnknown,
    toggleProfile,
    setIncludeUnknown,
    clear,
    matchingIds,
    isLoading,
    hasError,
    fromUrl: initial.profiles.length > 0,
  };
};
