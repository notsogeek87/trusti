import { useState, useCallback } from 'react';
import { MAX_SHARED_APPS } from '../utils/appShareLink';

/**
 * Sélection d'apps du catalogue à partager par lien.
 *
 * Les apps sélectionnées sont gardées entières (pas seulement leur ID) : la
 * liste paginée ou filtrée peut ne plus les contenir au moment du partage.
 *
 * @returns {{
 *   isSelecting: boolean,
 *   selectedApps: Array<Object>,
 *   isSelected: (id: string) => boolean,
 *   toggleApp: (app: Object) => 'added'|'removed'|'limit',
 *   start: () => void,
 *   stop: () => void,
 * }}
 */
export const useAppSelection = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Map());

  const start = useCallback(() => setIsSelecting(true), []);

  const stop = useCallback(() => {
    setIsSelecting(false);
    setSelected(new Map());
  }, []);

  const isSelected = useCallback((id) => selected.has(String(id)), [selected]);

  const toggleApp = useCallback((app) => {
    const id = String(app.id);
    if (selected.has(id)) {
      setSelected((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      return 'removed';
    }
    if (selected.size >= MAX_SHARED_APPS) return 'limit';
    setSelected((prev) => new Map(prev).set(id, app));
    return 'added';
  }, [selected]);

  return {
    isSelecting,
    selectedApps: Array.from(selected.values()),
    isSelected,
    toggleApp,
    start,
    stop,
  };
};
