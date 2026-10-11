import { useState, useCallback } from 'react';

// Trusti n'a plus de compte ni de connexion : les données (apps, migrations...)
// sont stockées en localStorage sur l'appareil, sous l'identité "guest".
const GUEST_OWNER = 'guest';
const LEGACY_USER_KEY = 'trusti_current_user';

/**
 * Migration unique : un ancien compte connecté avait ses apps sous
 * `trusti_<email>_apps`. On les rapatrie sous "guest" (sans écraser des données
 * existantes) puis on supprime la session, devenue sans objet.
 */
function migrateLegacyAccount() {
  try {
    const stored = localStorage.getItem(LEGACY_USER_KEY);
    if (!stored) return;
    let email;
    try {
      email = JSON.parse(stored)?.email;
    } catch {
      email = stored;
    }
    if (email) {
      for (const key of ['apps']) {
        const accountData = localStorage.getItem(`trusti_${email}_${key}`);
        if (accountData && !localStorage.getItem(`trusti_${GUEST_OWNER}_${key}`)) {
          localStorage.setItem(`trusti_${GUEST_OWNER}_${key}`, accountData);
        }
      }
    }
    localStorage.removeItem(LEGACY_USER_KEY);
    localStorage.removeItem('trusti_admin_token');
  } catch {
    // localStorage indisponible : rien à migrer
  }
}

/**
 * Stockage local des données utilisateur (mode invité uniquement).
 */
export const useAuth = () => {
  // Migration avant tout rendu : useAppManagement lit les apps dès son premier effet.
  const [isLoading] = useState(() => {
    migrateLegacyAccount();
    return false;
  });

  const getUserData = useCallback((key) => {
    const data = localStorage.getItem(`trusti_${GUEST_OWNER}_${key}`);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, []);

  const saveUserData = useCallback((key, data) => {
    localStorage.setItem(`trusti_${GUEST_OWNER}_${key}`, JSON.stringify(data));
  }, []);

  return { isLoading, getUserData, saveUserData };
};
