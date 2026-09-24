// Toutes les données Trusti sont stockées en localStorage sous des clés
// préfixées "trusti_" (voir useAuth, onboardingStorage, adminAuth, ageMode,
// myAppsSort). On s'appuie sur ce préfixe commun pour mesurer l'espace
// réellement utilisé par l'app, sans dépendre d'une liste de clés à maintenir.
const PREFIX = 'trusti_';

export const getStorageStats = () => {
  let totalKeys = 0;
  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      const value = localStorage.getItem(key) || '';
      // Approximation UTF-16 (2 octets/caractère), suffisante pour un ordre de grandeur.
      totalBytes += (key.length + value.length) * 2;
      totalKeys += 1;
    }
  } catch {
    // localStorage indisponible (navigation privée stricte) : stats à zéro.
  }
  return { totalKeys, totalBytes };
};

// Supprime toutes les clés Trusti du localStorage (apps, migrations,
// onboarding, préférences, session admin...). Un rechargement de la page est
// nécessaire ensuite pour que l'app reparte d'un état neuf partout où ces
// données ne sont lues qu'une fois au montage (onboarding, mode enfant...).
export const clearAllTrustiStorage = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // localStorage indisponible (navigation privée stricte) : rien à faire.
  }
};

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
};
