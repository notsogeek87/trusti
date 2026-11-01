/**
 * Liens de partage publics (fiche d'une app, sélection d'apps).
 *
 * Module pur (aucune dépendance Capacitor/DOM) pour rester testable sous Node.
 *
 * Dans l'APK, `window.location.origin` vaut `https://localhost` (WebView
 * Capacitor) : un lien construit à partir de lui serait inutilisable pour le
 * destinataire. On partage donc toujours l'adresse publique du site, qui
 * ouvre la fiche sur le web… ou directement dans l'APK si elle est installée
 * (App Links, voir AndroidManifest.xml et public/.well-known/assetlinks.json).
 */

/** Adresse publique du site Trusti. */
export const PUBLIC_SITE_URL = 'https://trusti.lielu.eu';

/** Paramètre d'URL désignant la fiche d'une app partagée. */
export const SHARED_APP_PARAM = 'app';

/**
 * Base des liens partagés : le site public dans l'APK, l'adresse courante
 * (origine + chemin) sur le web pour que les préversions restent cohérentes.
 *
 * @param {{ isNative?: boolean, location?: { origin: string, pathname: string } }} [opts]
 * @returns {string}
 */
export const getShareBaseUrl = ({ isNative = false, location } = {}) => {
  if (isNative || !location || !/^https?:/.test(location.origin || '')) {
    return `${PUBLIC_SITE_URL}/`;
  }
  return `${location.origin}${location.pathname}`;
};

/**
 * Lien partageable vers la fiche d'une app.
 *
 * @param {string|number} appId
 * @param {Parameters<typeof getShareBaseUrl>[0]} [opts]
 * @returns {string}
 */
export const buildAppShareUrl = (appId, opts) => {
  const url = new URL(getShareBaseUrl(opts));
  url.search = '';
  url.searchParams.set(SHARED_APP_PARAM, String(appId));
  return url.toString();
};

/**
 * Identifiant d'app partagée contenu dans une URL ou une query string.
 *
 * @param {string} urlOrSearch - URL absolue (lien profond) ou `location.search`
 * @returns {string|null} ID (chiffres, lettres, `-`, `_`) ou null
 */
export const parseSharedAppId = (urlOrSearch) => {
  if (!urlOrSearch) return null;
  let params;
  try {
    params = /^[a-z][a-z0-9+.-]*:/i.test(urlOrSearch)
      ? new URL(urlOrSearch).searchParams
      : new URLSearchParams(urlOrSearch);
  } catch {
    return null;
  }
  const raw = (params.get(SHARED_APP_PARAM) || '').trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : null;
};

/**
 * Texte d'accompagnement du partage d'une fiche.
 *
 * @param {{ name: string, grade?: string }} app
 * @returns {{ title: string, text: string }}
 */
export const buildAppShareText = (app) => {
  const title = `${app.name} sur Trusti`;
  const text = app.grade
    ? `${app.name} obtient la note ${app.grade} au TrustiScore (souveraineté numérique). Découvre sa fiche et ses alternatives :`
    : `Découvre la fiche de ${app.name} et ses alternatives sur Trusti :`;
  return { title, text };
};
