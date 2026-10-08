import { useEffect, useState } from 'react';
import { API_URL } from '../utils/apiConfig';

/**
 * Charge le détail d'évaluation TrustiScore d'une app (GET /api/apps?assessment_for=:id).
 * Chargé en ligne à l'ouverture de la fiche, comme les apps liées. Hors connexion,
 * ou si l'app n'a pas d'évaluation, `assessment` reste null et la fiche se rabat
 * sur le texte court `reason`.
 *
 * @param {string|number|null} appId  null pour ne rien charger (ex. mode enfant)
 * @returns {{status: 'idle'|'loading'|'ready'|'unavailable', assessment: object|null}}
 */
export function useAssessment(appId) {
  const [state, setState] = useState({ status: 'idle', assessment: null });

  useEffect(() => {
    if (appId === null || appId === undefined) {
      setState({ status: 'idle', assessment: null });
      return undefined;
    }
    const controller = new AbortController();
    setState({ status: 'loading', assessment: null });

    fetch(`${API_URL}/apps?assessment_for=${encodeURIComponent(appId)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        const assessment = data?.assessment || null;
        setState({ status: assessment ? 'ready' : 'unavailable', assessment });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'unavailable', assessment: null });
      });

    return () => controller.abort();
  }, [appId]);

  return state;
}

export default useAssessment;
