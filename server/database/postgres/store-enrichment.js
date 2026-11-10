/**
 * Enrichissement des fiches à l'écriture : nom et icône depuis le Play Store,
 * icône et URL F-Droid, URL App Store.
 */
import gplay from 'google-play-scraper';
import { fetchWithTimeout } from '../../fetchWithTimeout.js';
import { buildPlayStoreUrl, extractPackageId } from './app-format.js';

// Cache des infos Play Store (nom + icône), partagé pour éviter les appels réseau redondants
export const playStoreCache = {};

/**
 * Helper: Récupérer les infos Play Store d'un package (mise en cache des succès)
 */
export async function getPlayStoreAppInfo(packageName) {
  if (!packageName) return null;
  if (playStoreCache[packageName]) return playStoreCache[packageName];

  try {
    const appInfo = await gplay.app({ appId: packageName });
    if (appInfo) {
      playStoreCache[packageName] = appInfo;
      return appInfo;
    }
  } catch (error) {
    // App introuvable sur le Play Store (retiré, ID invalide, etc.)
  }
  return null;
}

/**
 * Helper: Vérifier si une URL d'image est valide
 */
export async function isValidImageUrl(url) {
  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD' }, 3000);
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Helper: Obtenir l'icône depuis F-Droid
 */
export async function getFDroidIcon(packageName) {
  const patterns = [
    `https://f-droid.org/repo/icons-640/${packageName}.png`,
    `https://f-droid.org/repo/${packageName}/en-US/icon.png`,
    `https://f-droid.org/assets/${packageName}.png`
  ];

  for (const url of patterns) {
    if (await isValidImageUrl(url)) {
      return url;
    }
  }
  
  return null;
}

/**
 * Helper: Vérifier si l'app existe sur F-Droid et obtenir le lien
 */
export async function getFDroidUrl(packageName) {
  if (!packageName) return null;
  
  try {
    const fdroidPageUrl = `https://f-droid.org/packages/${packageName}`;
    const response = await fetchWithTimeout(fdroidPageUrl, { method: 'HEAD' }, 3000);
    
    if (response.ok) {
      return fdroidPageUrl;
    }
  } catch {
    // App pas sur F-Droid
  }
  
  return null;
}

/**
 * Helper: Fiabiliser le nom, l'icône et l'URL Play Store d'une app à partir
 * du package Android fourni par l'admin (URL complète ou simple package name).
 * Le Play Store fait foi ; les valeurs saisies à la main ne servent que de
 * repli si l'app n'y est pas trouvée (ou si aucun package n'est renseigné).
 */
export async function enrichFromPlayStore(appData) {
  const packageName = extractPackageId(appData.playStoreUrl);

  let name = appData.name;
  let icon = appData.icon;
  let playStoreUrl = appData.playStoreUrl;

  if (packageName) {
    const appInfo = await getPlayStoreAppInfo(packageName);
    name = appInfo?.title || appData.name;
    icon = appInfo?.icon || appData.icon;
    playStoreUrl = appInfo?.url || buildPlayStoreUrl(packageName);

    if (!appInfo?.icon) {
      // Pas d'icône Play Store : tenter F-Droid comme repli
      try {
        const fdroidIcon = await getFDroidIcon(packageName);
        if (fdroidIcon) icon = fdroidIcon;
      } catch {
        // App probablement pas sur F-Droid non plus
      }
    }
  }

  const grade = appData.grade || appData.trustiScore;
  const isFDroidOnly = packageName && (
    packageName.startsWith('com.github.') ||
    packageName.startsWith('org.fdroid.') ||
    packageName.startsWith('io.github.')
  );

  // App Store et F-Droid : recherchés une seule fois ici (à la création/mise
  // à jour admin) plutôt qu'à chaque lecture du catalogue.
  let appleStoreUrl = appData.appleStoreUrl;
  if (!appleStoreUrl && name && !isFDroidOnly) {
    appleStoreUrl = await searchAppStore(name);
  }

  let fDroidUrl = appData.fDroidUrl;
  if (!fDroidUrl && packageName && ['A', 'B', 'C'].includes(grade)) {
    fDroidUrl = await getFDroidUrl(packageName);
  }

  return {
    ...appData,
    name,
    icon,
    playStoreUrl,
    appleStoreUrl,
    fDroidUrl,
  };
}

/**
 * Helper: Rechercher l'app sur l'App Store iTunes
 */
export async function searchAppStore(appName) {
  if (!appName) return null;
  
  try {
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software&limit=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].trackViewUrl;
    }
  } catch (error) {
    // Recherche échouée
  }
  
  return null;
}
