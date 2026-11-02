import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../utils/apiConfig';

/**
 * Charge le catalogue des apps « usage pro » (GET /api/apps?pro=true) pour la
 * page d'évaluation d'une organisation.
 * @returns {{status: 'loading'|'ready'|'error', apps: object[], retry: () => void}}
 */
export function useProCatalog() {
  const [state, setState] = useState({ status: 'loading', apps: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', apps: [] });
    fetch(`${API_URL}/apps?pro=true`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(data => {
        if (!data?.success || !Array.isArray(data.apps)) throw new Error('Réponse invalide');
        setState({ status: 'ready', apps: data.apps.map(app => ({ ...app, id: String(app.id) })) });
      })
      .catch(error => {
        if (error.name !== 'AbortError') setState({ status: 'error', apps: [] });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);
  return { ...state, retry };
}

export default useProCatalog;
