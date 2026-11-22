// Mesure d'audience anonyme avec Umami, auto-hébergé sur stats.trusti-score.eu
// (sans cookie, sans IP conservée ; décrite dans la politique de confidentialité).
//
// Un seul script, choisi au démarrage :
// - app web : site « Trusti app », compté seulement sur app.trusti-score.eu
//   (ni le dev en localhost, ni le relais Vercel) ;
// - APK Android : site « Trusti Android ». L'APK est servi en https://localhost,
//   d'où l'absence de filtre de domaine ; le dev web n'y passe jamais
//   (isNativeAndroid est faux dans un navigateur).
//
// Limite : l'app change d'écran sans changer d'adresse (pushState sans URL),
// Umami compte donc une page vue par ouverture, pas chaque écran.

export const UMAMI_SCRIPT_URL = 'https://stats.trusti-score.eu/script.js';
export const WEB_WEBSITE_ID = 'a48710e8-7c90-4b5d-9e55-4a8b2fc3a320';
export const WEB_DOMAIN = 'app.trusti-score.eu';
export const ANDROID_WEBSITE_ID = null;

/** Attributs du script Umami pour cette plateforme, ou null s'il ne faut rien charger. */
export function umamiAttributes({ nativeAndroid }) {
  if (nativeAndroid) {
    return ANDROID_WEBSITE_ID ? { 'data-website-id': ANDROID_WEBSITE_ID } : null;
  }
  return { 'data-website-id': WEB_WEBSITE_ID, 'data-domains': WEB_DOMAIN };
}

/** Ajoute le script Umami à la page (sans effet si déjà présent ou s'il n'y a rien à compter). */
export function loadAnalytics({ nativeAndroid, doc = globalThis.document } = {}) {
  const attrs = umamiAttributes({ nativeAndroid });
  if (!attrs || !doc || doc.querySelector(`script[src="${UMAMI_SCRIPT_URL}"]`)) return false;
  const script = doc.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  for (const [name, value] of Object.entries(attrs)) script.setAttribute(name, value);
  doc.head.appendChild(script);
  return true;
}
