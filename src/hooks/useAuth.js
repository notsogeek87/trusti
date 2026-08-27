import { useState, useEffect, useCallback } from 'react';

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

  // Récupérer les données de l'utilisateur
  const getUserData = useCallback((key) => {
    if (!currentUser) return null;
    const userEmail = currentUser.email || currentUser;
    const userDataKey = `trusti_${userEmail}_${key}`;
    const data = localStorage.getItem(userDataKey);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [currentUser]);

  // Sauvegarder les données de l'utilisateur
  const saveUserData = useCallback((key, data) => {
    if (!currentUser) return;
    const userEmail = currentUser.email || currentUser;
    const userDataKey = `trusti_${userEmail}_${key}`;
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
