import { useState, useEffect, useCallback } from 'react';
import { TABS } from '../constants/tabs';
import { API_URL } from '../utils/apiConfig';
import { parseShareParams, clearShareParams, getSharedAppIdFromUrl } from '../utils/shareUtils';

/**
 * Liens de partage reçus au chargement : `?app=<id>` ouvre la fiche de l'app,
 * `?apps=...` et/ou `?mig=...` proposent l'import d'une sélection. L'URL est
 * nettoyée ensuite.
 */
export const useShareLinks = ({ openAppDetail, closeStorageManager, addMyApps, importMigrations, setActiveTab, toast }) => {
  const [pendingImport, setPendingImport] = useState(null);

  // L'app partagée n'est pas forcément dans la page de liste déjà chargée :
  // on la charge par son ID.
  const openSharedApp = useCallback(async (appId) => {
    try {
      const response = await fetch(`${API_URL}/apps?ids=${encodeURIComponent(appId)}`);
      const data = await response.json();
      const found = data.success && Array.isArray(data.apps) ? data.apps[0] : null;
      if (!found) {
        toast.error("Cette app n'existe plus dans Trusti.");
        return;
      }
      closeStorageManager();
      openAppDetail({
        ...found,
        id: String(found.id),
        replacesAppId: found.replacesAppId ? String(found.replacesAppId) : undefined,
        replacesAppIds: found.replacesAppIds ? found.replacesAppIds.map(String) : undefined,
      });
    } catch (error) {
      console.error("Erreur lors de l'ouverture de l'app partagée:", error);
      toast.error("Impossible d'ouvrir l'app partagée. Vérifie ta connexion.");
    }
  }, [openAppDetail, closeStorageManager, toast]);

  useEffect(() => {
    const sharedAppId = getSharedAppIdFromUrl();
    const { appIds, migrations } = parseShareParams();
    if (sharedAppId) {
      openSharedApp(sharedAppId);
    } else if (appIds.length > 0 || migrations.length > 0) {
      setPendingImport({ appIds, migrations });
    }
    if (sharedAppId || appIds.length > 0 || migrations.length > 0) {
      clearShareParams();
    }
  }, []);

  // Confirmation de l'import : la sélection est appliquée sur cet appareil
  const confirmImport = ({ appIds = [], migrations = [] }) => {
    if (appIds.length > 0) addMyApps(appIds.map(String));
    if (migrations.length > 0) importMigrations(migrations);
    setActiveTab(TABS.MY_APPS);
    setPendingImport(null);
  };

  const cancelImport = () => setPendingImport(null);

  return { pendingImport, confirmImport, cancelImport };
};
