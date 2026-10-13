import { CapacitorHttp } from '@capacitor/core';
import { extractStoreTitle } from './appLinks';

/**
 * Lit le nom d'une app sur sa page de magasin (Play Store ou F-Droid), depuis
 * le téléphone lui-même via le client HTTP natif de Capacitor : la requête part
 * de l'appareil vers le magasin, rien ne transite par le serveur Trusti.
 * À n'appeler qu'après une action explicite de l'utilisateur. Uniquement dans
 * l'app Android native (un navigateur bloque la requête, voir CORS).
 *
 * @param {{ kind: 'play'|'fdroid', packageName: string }} info  résultat de parseAppLink
 * @returns {Promise<string>} le nom, ou '' s'il est introuvable
 */
export const fetchStoreName = async (info) => {
  if (!info?.packageName || (info.kind !== 'play' && info.kind !== 'fdroid')) return '';
  // L'adresse est reconstruite à partir du seul nom de package déjà validé
  const url = info.kind === 'play'
    ? `https://play.google.com/store/apps/details?id=${info.packageName}&hl=en`
    : `https://f-droid.org/packages/${info.packageName}/`;
  const response = await CapacitorHttp.get({
    url,
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    connectTimeout: 10000,
    readTimeout: 10000,
  });
  if (response.status !== 200 || typeof response.data !== 'string') return '';
  return extractStoreTitle(response.data, info.kind);
};

export default fetchStoreName;
