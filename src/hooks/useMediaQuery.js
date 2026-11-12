import { useEffect, useState } from 'react';

/**
 * Vrai tant que la media query CSS correspond (suit les changements de taille).
 * @param {string} query ex. '(min-width: 1024px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default useMediaQuery;
