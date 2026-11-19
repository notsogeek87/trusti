import { useEffect, useState } from 'react';
import { API_URL, appsUrl } from '../utils/apiConfig';

/**
 * Charge le détail d'évaluation TrustiScore d'une app (GET /api/apps?assessment_for=:id).
 * Chargé en ligne à l'ouverture de la fiche, comme les apps liées. Hors connexion,
 * ou si l'app n'a pas d'évaluation, `assessment` reste null et la fiche se rabat
 * sur le texte court `reason`.
 *
 * @param {string|number|null} appId  null pour ne rien charger (ex. mode enfant)
 * La même réponse porte les événements publiés de l'app (fuite, rachat, open source…).
 *
 * @returns {{status: 'idle'|'loading'|'ready'|'unavailable', assessment: object|null, events: object[]}}
 */
export function useAssessment(appId) {
  const [state, setState] = useState({ status: 'idle', assessment: null, events: [] });

  useEffect(() => {
    if (appId === null || appId === undefined) {
      setState({ status: 'idle', assessment: null, events: [] });
      return undefined;
    }
    const controller = new AbortController();
    setState({ status: 'loading', assessment: null, events: [] });

    fetch(appsUrl(`assessment_for=${encodeURIComponent(appId)}`), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        const assessment = data?.assessment || null;
        const events = Array.isArray(data?.events) ? data.events : [];
        setState({ status: assessment ? 'ready' : 'unavailable', assessment, events });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'unavailable', assessment: null, events: [] });
      });

    return () => controller.abort();
  }, [appId]);

  return state;
}

export default useAssessment;
