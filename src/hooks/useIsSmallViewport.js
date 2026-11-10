import { useState, useEffect } from 'react';

/** Vrai sous 768 px de large (mise en page mobile). */
export const useIsSmallViewport = () => {
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsSmall(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isSmall;
};
