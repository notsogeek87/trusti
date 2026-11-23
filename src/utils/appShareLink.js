import { t } from '../i18n/index.js';
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
export const PUBLIC_SITE_URL = 'https://app.trusti-score.eu';

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
  const title = t('main.share.appTitle', { name: app.name });
  const text = app.grade
    ? t('main.share.appTextGrade', { name: app.name, grade: app.grade })
    : t('main.share.appText', { name: app.name });
  return { title, text };
};

/** Paramètre d'URL désignant une sélection d'apps partagée. */
export const SHARED_APPS_PARAM = 'apps';

/** Nombre maximal d'apps dans un lien de sélection (garde l'URL courte). */
export const MAX_SHARED_APPS = 50;

const isValidAppId = (id) => /^[A-Za-z0-9_-]{1,64}$/.test(id);

/**
 * Lien partageable vers une sélection d'apps (`?apps=id1,id2`). À l'ouverture,
 * le destinataire voit l'aperçu de la sélection (notes comprises) et peut
 * l'ajouter à « Mes Apps ».
 *
 * Les IDs invalides et les doublons sont ignorés, l'ordre est conservé, et la
 * sélection est limitée à MAX_SHARED_APPS.
 *
 * @param {Array<string|number>} appIds
 * @param {Parameters<typeof getShareBaseUrl>[0]} [opts]
 * @returns {string|null} URL absolue, ou null si aucune app valide
 */
export const buildAppsSelectionUrl = (appIds = [], opts) => {
  const ids = [...new Set(appIds.map((id) => String(id).trim()))]
    .filter(isValidAppId)
    .slice(0, MAX_SHARED_APPS);
  if (ids.length === 0) return null;
  const url = new URL(getShareBaseUrl(opts));
  url.search = '';
  // Virgules non encodées : lien lisible, compris tel quel par parseShareParams
  return `${url.toString()}?${SHARED_APPS_PARAM}=${ids.join(',')}`;
};

/**
 * Texte d'accompagnement du partage d'une sélection d'apps.
 *
 * @param {Array<{ name: string, grade?: string }>} apps
 * @returns {{ title: string, text: string }}
 */
export const buildAppsSelectionText = (apps = []) => {
  const lines = apps.map((app) =>
    app.grade
      ? t('main.share.selectionLineGrade', { name: app.name, grade: app.grade })
      : `• ${app.name}`
  );
  return {
    title: t('main.share.selectionTitle'),
    text: `${t('main.share.selectionHeader', { count: apps.length })}\n\n${lines.join('\n')}`,
  };
};
