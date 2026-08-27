/**
 * URL de base pour les appels à l'API, unique source de vérité.
 *
 * Web (prod) : chemin relatif, same-origin sur Vercel.
 * Web (dev) : serveur Express local.
 * Natif (APK Capacitor) : aucun backend co-localisé dans le paquet, donc
 * URL absolue vers le déploiement Vercel réel.
 */
import { Capacitor } from '@capacitor/core';

const PROD_API_BASE = 'https://trusti-alpha.vercel.app/api';

export const API_URL = Capacitor.isNativePlatform()
  ? PROD_API_BASE
  : (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
