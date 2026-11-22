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
// L'app change d'écran sans changer d'adresse (pushState sans URL) : le suivi
// automatique d'Umami ne verrait que « / ». Il est donc coupé
// (data-auto-track="false") et chaque écran envoie une page vue « virtuelle »
// (trackScreen), avec un nom d'écran générique : jamais de donnée de
// l'utilisateur ni de nom d'app dans l'adresse.

import { TABS } from '../constants/tabs.js';

export const UMAMI_SCRIPT_URL = 'https://stats.trusti-score.eu/script.js';
export const WEB_WEBSITE_ID = 'a48710e8-7c90-4b5d-9e55-4a8b2fc3a320';
export const WEB_DOMAIN = 'app.trusti-score.eu';
export const ANDROID_WEBSITE_ID = 'c60d13de-c8e8-4e1a-9e84-d74d61797a47';

/** Attributs du script Umami pour cette plateforme, ou null s'il ne faut rien charger. */
export function umamiAttributes({ nativeAndroid }) {
  if (nativeAndroid) {
    return ANDROID_WEBSITE_ID
      ? { 'data-website-id': ANDROID_WEBSITE_ID, 'data-auto-track': 'false' }
      : null;
  }
  return { 'data-website-id': WEB_WEBSITE_ID, 'data-domains': WEB_DOMAIN, 'data-auto-track': 'false' };
}

const TAB_PATHS = {
  [TABS.APPLICATIONS]: '/applications',
  [TABS.MY_APPS]: '/mes-apps',
  [TABS.TOP_ALTERNATIVES]: '/top-alternatives',
};

/**
 * Nom d'écran (adresse virtuelle) à partir de l'état de l'app, dans l'ordre
 * de priorité de l'affichage d'App.jsx.
 */
export function screenPath({ landing, onboarding, rescan, appDetail, storage, inbox, tab }) {
  if (landing) return '/presentation';
  if (onboarding) return '/onboarding';
  if (rescan) return '/rescan';
  if (appDetail) return '/fiche-app';
  if (storage) return '/stockage';
  if (inbox) return '/notifications';
  return TAB_PATHS[tab] || '/applications';
}

let lastPath = null;
let pendingPath = null;

function send(path, win) {
  win.umami.track((props) => ({ ...props, url: path }));
}

/**
 * Enregistre une page vue virtuelle. Ignore un écran identique au précédent.
 * Si le script n'est pas encore chargé, l'écran est envoyé dès son chargement.
 */
export function trackScreen(path, win = globalThis.window) {
  if (!path || path === lastPath || !win) return false;
  lastPath = path;
  try {
    if (win.umami && typeof win.umami.track === 'function') {
      send(path, win);
      return true;
    }
  } catch {
    // La mesure d'audience ne doit jamais gêner l'app
  }
  pendingPath = path;
  return false;
}

/** Envoie l'écran en attente (appelé au chargement du script). */
export function flushPendingScreen(win = globalThis.window) {
  if (!pendingPath || !win?.umami || typeof win.umami.track !== 'function') return false;
  const path = pendingPath;
  pendingPath = null;
  try {
    send(path, win);
    return true;
  } catch {
    return false;
  }
}

/** Pour les tests : remet l'état du suivi à zéro. */
export function resetScreenTracking() {
  lastPath = null;
  pendingPath = null;
}

/** Ajoute le script Umami à la page (sans effet si déjà présent ou s'il n'y a rien à compter). */
export function loadAnalytics({ nativeAndroid, doc = globalThis.document } = {}) {
  const attrs = umamiAttributes({ nativeAndroid });
  if (!attrs || !doc || doc.querySelector(`script[src="${UMAMI_SCRIPT_URL}"]`)) return false;
  const script = doc.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  for (const [name, value] of Object.entries(attrs)) script.setAttribute(name, value);
  script.onload = () => flushPendingScreen();
  doc.head.appendChild(script);
  return true;
}
