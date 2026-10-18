import { App as CapacitorApp } from '@capacitor/app';
import InstalledApps from '../native/InstalledApps';

export const APP_UNINSTALLED_EVENT = 'trusti:app-uninstalled';

const WATCH_TIMEOUT_MS = 5 * 60 * 1000;

// Ouvre la désinstallation système, puis, au retour dans Trusti, vérifie si le
// paquet a vraiment disparu. Si oui, signale l'événement APP_UNINSTALLED_EVENT
// (App.jsx propose alors de relancer un scan). Le rejet de uninstallPackage est
// laissé à l'appelant, qui affiche son propre message d'erreur.
export const requestUninstall = async (packageName) => {
  await InstalledApps.uninstallPackage({ packageName });

  let handle = null;
  let timer = null;
  const stop = () => {
    clearTimeout(timer);
    handle?.remove();
  };

  handle = await CapacitorApp.addListener('resume', async () => {
    stop();
    try {
      const { packages } = await InstalledApps.getInstalledPackages();
      if (!(packages || []).includes(packageName)) {
        window.dispatchEvent(new CustomEvent(APP_UNINSTALLED_EVENT, { detail: { packageName } }));
      }
    } catch (error) {
      console.error('Vérification de la désinstallation impossible:', error);
    }
  });
  timer = setTimeout(stop, WATCH_TIMEOUT_MS);
};
