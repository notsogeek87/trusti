import { useEffect, useState } from 'react';
import { isNativeAndroid } from '../utils/platform';
import { InstalledApplicationSource, TechnicalAnalyzer } from '../technical';

/**
 * Charge l'analyse technique locale d'une application installée. N'appelle
 * jamais de serveur : tout se fait via le plugin natif Capacitor
 * (TechnicalAnalysisPlugin) puis le moteur pur JS src/technical/.
 *
 * Reste totalement indépendant du Trusti-Score communautaire/éditorial.
 *
 * @param {string|null} packageName
 * @returns {{status: 'idle'|'loading'|'ready'|'unavailable'|'error', analysis: object|null, error: Error|null}}
 */
export function useTechnicalAnalysis(packageName) {
  const [state, setState] = useState({ status: 'idle', analysis: null, error: null });

  useEffect(() => {
    if (!isNativeAndroid || !packageName) {
      setState({ status: 'unavailable', analysis: null, error: null });
      return undefined;
    }

    let cancelled = false;
    setState({ status: 'loading', analysis: null, error: null });

    const source = new InstalledApplicationSource(packageName);
    TechnicalAnalyzer.analyze(source)
      .then((analysis) => {
        if (!cancelled) setState({ status: 'ready', analysis, error: null });
      })
      .catch((error) => {
        // Ex. app non installée, ou absente des <queries> déclarées : on ne
        // considère jamais ça comme une erreur bloquante côté utilisateur.
        if (!cancelled) setState({ status: 'unavailable', analysis: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [packageName]);

  return state;
}

export default useTechnicalAnalysis;
