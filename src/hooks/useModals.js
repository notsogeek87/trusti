import { useState } from 'react';

/**
 * Hook personnalisé pour gérer l'état des modales
 */
export const useModals = () => {
  const [showExplainer, setShowExplainer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTrustiShareModal, setShowTrustiShareModal] = useState(false);
  const [showMigrationSelector, setShowMigrationSelector] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return {
    showExplainer,
    setShowExplainer,
    showShareModal,
    setShowShareModal,
    showTrustiShareModal,
    setShowTrustiShareModal,
    showMigrationSelector,
    setShowMigrationSelector,
    showLoginModal,
    setShowLoginModal,
  };
};
