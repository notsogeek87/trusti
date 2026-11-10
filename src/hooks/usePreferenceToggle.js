import { useState, useCallback } from 'react';

/**
 * Réglage booléen persisté en local : lit la valeur au montage et l'écrit à
 * chaque changement.
 * @param {() => boolean} read
 * @param {(enabled: boolean) => void} write
 * @returns {[boolean, (enabled: boolean) => void]}
 */
export const usePreferenceToggle = (read, write) => {
  const [enabled, setEnabled] = useState(read);
  const toggle = useCallback((value) => {
    write(value);
    setEnabled(value);
  }, [write]);
  return [enabled, toggle];
};
