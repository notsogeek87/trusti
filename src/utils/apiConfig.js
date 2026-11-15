/**
 * URL de base pour les appels à l'API, unique source de vérité.
 *
 * Web (prod) : chemin relatif, same-origin (Hyperfluid).
 * Web (dev) : serveur Express local.
 * Natif (APK Capacitor) : aucun backend co-localisé dans le paquet, donc
 * URL absolue sur notre propre domaine api.trusti-score.eu : il pointe vers
 * l'hébergeur du moment (DNS), sans republier l'app quand on en change.
 */
import { Capacitor } from '@capacitor/core';
import { getLanguage } from '../i18n/index.js';

const PROD_API_BASE = 'https://api.trusti-score.eu/api';

export const API_URL = Capacitor.isNativePlatform()
  ? PROD_API_BASE
  : (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

/**
 * URL de /api/apps avec la langue de l'interface : en anglais ou en allemand, le
 * serveur renvoie les textes de la base traduits quand ils existent (repli français).
 * @param {string} query paramètres déjà encodés, sans « ? » (ex. `ids=1,2`)
 */
export function appsUrl(query = '') {
  const lang = getLanguage();
  const params = [query, lang && lang !== 'fr' ? `lang=${lang}` : ''].filter(Boolean).join('&');
  return `${API_URL}/apps${params ? `?${params}` : ''}`;
}
