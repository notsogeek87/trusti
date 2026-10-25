import { useEffect, useRef } from 'react';
import { registerBackHandler } from '../utils/backHandlers';

/**
 * Intercepte le bouton retour tant que `enabled` est vrai. `handler` peut
 * changer à chaque rendu : c'est toujours la dernière version qui est appelée.
 * @param {() => void} handler
 * @param {boolean} [enabled]
 */
export const useBackHandler = (handler, enabled = true) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;
    return registerBackHandler(() => handlerRef.current());
  }, [enabled]);
};
