import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer l'authentification utilisateur (localStorage)
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('trusti_current_user');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Connexion / Inscription
  const login = useCallback((username) => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      localStorage.setItem('trusti_current_user', trimmedUsername);
      setCurrentUser(trimmedUsername);
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
    const userDataKey = `trusti_${currentUser}_${key}`;
    const data = localStorage.getItem(userDataKey);
    return data ? JSON.parse(data) : null;
  }, [currentUser]);

  // Sauvegarder les données de l'utilisateur
  const saveUserData = useCallback((key, data) => {
    if (!currentUser) return;
    const userDataKey = `trusti_${currentUser}_${key}`;
    localStorage.setItem(userDataKey, JSON.stringify(data));
  }, [currentUser]);

  // Réinitialiser toutes les données de l'utilisateur
  const resetUserData = useCallback(() => {
    if (!currentUser) return;
    const userDataKey = `trusti_${currentUser}_apps`;
    localStorage.removeItem(userDataKey);
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
