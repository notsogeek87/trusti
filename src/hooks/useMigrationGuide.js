import { useEffect, useState } from 'react';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';

const CACHE_TTL = 60 * 60 * 1000; // 1 h ; hors connexion, la dernière version lue reste utilisable

/**
 * Guide de migration fromId -> toId (GET /api/apps?migration_guide_from=…&migration_guide_to=…).
 * Les textes sont en base : une correction est visible sans nouvelle version de l'app.
 * Hors connexion et sans cache, `guide` reste null et le parcours affiche les conseils
 * par catégorie (voir getDataTips).
 *
 * @returns {{ status: 'idle'|'loading'|'ready', guide: {export, import}|null }}
 */
export function useMigrationGuide(fromId, toId) {
  const [state, setState] = useState({ status: 'idle', guide: null });

  useEffect(() => {
    if (fromId == null || toId == null) {
      setState({ status: 'idle', guide: null });
      return undefined;
    }
    let cancelled = false;
    setState({ status: 'loading', guide: null });
    const url = `${API_URL}/apps?migration_guide_from=${encodeURIComponent(fromId)}&migration_guide_to=${encodeURIComponent(toId)}`;
    cachedFetchJSON(url, { ttl: CACHE_TTL })
      .then((data) => { if (!cancelled) setState({ status: 'ready', guide: data?.guide || null }); })
      .catch(() => { if (!cancelled) setState({ status: 'ready', guide: null }); });
    return () => { cancelled = true; };
  }, [fromId, toId]);

  return state;
}

export default useMigrationGuide;
