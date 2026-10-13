/**
 * Analyse d'un lien d'app collé (ou reçu via « Partager » Android) : Play
 * Store, F-Droid ou GitHub. Rien n'est jamais ouvert ni téléchargé ici : on ne
 * fait que lire l'adresse, qui est une donnée non fiable (elle peut venir
 * d'une autre app) et que l'on valide strictement.
 *
 * Résultat : { kind: 'play' | 'fdroid' | 'github', packageName?, owner?, repo?, url }
 *  - play / fdroid : le nom de package Android figure dans l'adresse ;
 *  - github : l'adresse ne donne que le dépôt (le package n'y est pas).
 */
const PACKAGE_REGEX = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;
const GITHUB_SEGMENT = /^[A-Za-z0-9_.-]{1,100}$/;
// Premiers segments GitHub qui ne sont pas des comptes d'utilisateur ou d'organisation
const GITHUB_RESERVED = new Set([
  'orgs', 'settings', 'topics', 'features', 'marketplace', 'sponsors', 'about', 'pricing',
  'login', 'join', 'explore', 'notifications', 'pulls', 'issues', 'search', 'collections',
]);
const MAX_INPUT_LENGTH = 2000;

const isValidPackage = (value) =>
  typeof value === 'string' && value.length <= 150 && PACKAGE_REGEX.test(value);

/** Première adresse http(s) du texte (un partage contient souvent du texte autour). */
export const extractFirstUrl = (text) => {
  if (typeof text !== 'string') return null;
  const match = text.slice(0, MAX_INPUT_LENGTH).match(/https?:\/\/[^\s<>"']+/i);
  // Ponctuation de fin collée à l'adresse dans une phrase : « …id=a.b. »
  return match ? match[0].replace(/[.,;:!?)\]}]+$/, '') : null;
};

export const parseAppLink = (input) => {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().slice(0, MAX_INPUT_LENGTH);

  // Lien « market://details?id=… » (ancien format Play Store)
  const market = trimmed.match(/^market:\/\/details\?id=([A-Za-z0-9._]+)/i);
  if (market && isValidPackage(market[1])) {
    return { kind: 'play', packageName: market[1], url: `https://play.google.com/store/apps/details?id=${market[1]}` };
  }

  const raw = extractFirstUrl(trimmed);
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const segments = url.pathname.split('/').filter(Boolean);

  if (host === 'play.google.com' && segments[0] === 'store' && segments[1] === 'apps' && segments[2] === 'details') {
    const id = url.searchParams.get('id');
    return isValidPackage(id)
      ? { kind: 'play', packageName: id, url: `https://play.google.com/store/apps/details?id=${id}` }
      : null;
  }

  if (host === 'f-droid.org') {
    // /packages/<pkg>, avec ou sans « / » final, avec ou sans code langue (/fr/packages/<pkg>)
    const at = segments.indexOf('packages');
    const id = at !== -1 && at <= 1 ? segments[at + 1] : null;
    return isValidPackage(id)
      ? { kind: 'fdroid', packageName: id, url: `https://f-droid.org/packages/${id}/` }
      : null;
  }

  if (host === 'github.com' && segments.length >= 2) {
    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, '');
    if (GITHUB_RESERVED.has(owner.toLowerCase()) || !GITHUB_SEGMENT.test(owner) || !GITHUB_SEGMENT.test(repo)) return null;
    return { kind: 'github', owner, repo, url: `https://github.com/${owner}/${repo}` };
  }

  return null;
};

/** Libellé court du type de lien, pour l'affichage. */
export const linkKindLabel = (kind) =>
  ({ play: 'Play Store', fdroid: 'F-Droid', github: 'GitHub' }[kind] || '');

/** Adresse GitHub normalisée (minuscules, sans « .git » ni « / » final) pour comparer à celle du catalogue. */
export const normalizeGithubUrl = (value) => {
  const info = parseAppLink(typeof value === 'string' ? value : '');
  return info?.kind === 'github' ? `${info.owner}/${info.repo}`.toLowerCase() : null;
};

/**
 * Cherche dans le catalogue l'app qui correspond à un lien analysé : même
 * package (Play Store, F-Droid) ou même dépôt GitHub. Comparaison locale,
 * rien n'est envoyé.
 *
 * @param {object} info  résultat de parseAppLink
 * @param {Array} catalogApps
 * @param {(app: object) => string|null} getPackage
 */
export const findCatalogAppForLink = (info, catalogApps, getPackage) => {
  if (!info || !Array.isArray(catalogApps)) return null;
  if (info.packageName) {
    return catalogApps.find(app => getPackage(app) === info.packageName)
      || catalogApps.find(app => app.fDroidUrl && parseAppLink(app.fDroidUrl)?.packageName === info.packageName)
      || null;
  }
  const wanted = normalizeGithubUrl(info.url);
  return wanted ? (catalogApps.find(app => normalizeGithubUrl(app.githubUrl) === wanted) || null) : null;
};

const decodeEntities = (text) =>
  text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * Nom de l'app lu dans le <title> de sa page de magasin (texte brut, jamais du
 * HTML). Renvoie '' si le titre n'a pas la forme attendue.
 *   Play Store (hl=en) : « Immich - Apps on Google Play »
 *   F-Droid            : « Immich | F-Droid - Free and Open Source Android App Repository »
 */
export const extractStoreTitle = (html, kind) => {
  if (typeof html !== 'string') return '';
  const match = html.slice(0, 200000).match(/<title[^>]*>([^<]{1,300})<\/title>/i);
  if (!match) return '';
  let title = decodeEntities(match[1]).trim();
  if (kind === 'play') {
    const m = title.match(/^(.*?)\s+[-–]\s+Apps on Google Play$/);
    if (!m) return '';
    title = m[1];
  } else if (kind === 'fdroid') {
    const m = title.match(/^(.*?)\s+\|\s+F-Droid\b/);
    if (!m) return '';
    title = m[1];
  } else {
    return '';
  }
  // eslint-disable-next-line no-control-regex
  return title.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
};
