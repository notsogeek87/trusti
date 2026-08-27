import { useState, useEffect, useCallback } from 'react';

// Identité utilisée pour sauvegarder les données (apps, migrations...) en
// localStorage tant que l'utilisateur n'est pas connecté. Permet à la version
// PWA/APK de fonctionner en local-first : le choix des apps survit aux
// rechargements même sans compte, comme un compte "sur cet appareil".
const GUEST_OWNER = 'guest';

/**
 * Hook pour gérer l'authentification utilisateur (localStorage + Magic Link)
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('trusti_current_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch {
        // Ancien format (pseudonyme simple), on le garde pour backward compatibility
        setCurrentUser({ email: storedUser, legacy: true });
      }
    }
    setIsLoading(false);
  }, []);

  // Connexion avec email (Magic Link)
  const login = useCallback((email) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && trimmedEmail.includes('@')) {
      // Avant la connexion, les données (apps, migrations...) étaient déjà
      // sauvegardées localement sous une identité "invité" (voir getUserData/
      // saveUserData ci-dessous). On les rattache au compte à la connexion,
      // sans écraser des données déjà existantes sur ce compte.
      const guestKey = `trusti_${GUEST_OWNER}_apps`;
      const accountKey = `trusti_${trimmedEmail}_apps`;
      const guestData = localStorage.getItem(guestKey);
      if (guestData && !localStorage.getItem(accountKey)) {
        localStorage.setItem(accountKey, guestData);
      }

      const userData = { email: trimmedEmail, loginAt: Date.now() };
      localStorage.setItem('trusti_current_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return true;
    }
    return false;
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    localStorage.removeItem('trusti_current_user');
    setCurrentUser(null);
  }, []);

  // Récupérer les données de l'utilisateur (ou de l'invité si non connecté)
  const getUserData = useCallback((key) => {
    const owner = currentUser ? (currentUser.email || currentUser) : GUEST_OWNER;
    const userDataKey = `trusti_${owner}_${key}`;
    const data = localStorage.getItem(userDataKey);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [currentUser]);

  // Sauvegarder les données de l'utilisateur (ou de l'invité si non connecté)
  const saveUserData = useCallback((key, data) => {
    const owner = currentUser ? (currentUser.email || currentUser) : GUEST_OWNER;
    const userDataKey = `trusti_${owner}_${key}`;
    localStorage.setItem(userDataKey, JSON.stringify(data));
  }, [currentUser]);

  // Réinitialiser toutes les données de l'utilisateur
  const resetUserData = useCallback(() => {
    if (!currentUser) return;
    const userEmail = currentUser.email || currentUser;
    localStorage.removeItem(`trusti_${userEmail}_apps`);
    // Forcer un rechargement en changeant l'utilisateur temporairement
    const user = currentUser;
    setCurrentUser(null);
    setTimeout(() => setCurrentUser(user), 50);
  }, [currentUser]);

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    getUserData,
    saveUserData,
    resetUserData
  };
};
