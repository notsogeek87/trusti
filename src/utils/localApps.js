/**
 * Apps « pas encore évaluées » : ajoutées à la main par l'utilisateur quand
 * Trusti ne les connaît pas. Elles vivent uniquement en local (aucun envoi au
 * serveur), sans note A–E, et sont fusionnées avec l'app du catalogue dès que
 * celle-ci existe (par nom de package, ou à défaut par nom identique).
 *
 * Forme : { id: "local-xxxx", name: string, packageName?: string }
 */
export const LOCAL_ID_PREFIX = 'local-';

// Plafonds défensifs : un fichier importé ne doit pas pouvoir gonfler le
// stockage local.
const MAX_LOCAL_APPS = 500;
const MAX_NAME_LENGTH = 80;
const MAX_PACKAGE_LENGTH = 150;

const LOCAL_ID_REGEX = /^local-[a-z0-9]{4,40}$/;
const PACKAGE_REGEX = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;

export const isLocalAppId = (id) => typeof id === 'string' && id.startsWith(LOCAL_ID_PREFIX);

export const makeLocalId = () =>
  `${LOCAL_ID_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const isValidPackageName = (value) =>
  typeof value === 'string' && value.length <= MAX_PACKAGE_LENGTH && PACKAGE_REGEX.test(value);

/** Nom nettoyé (sans caractères de contrôle, espaces compactés), ou '' si invalide. */
export const cleanAppName = (value) => {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, MAX_NAME_LENGTH);
};

/** Forme de comparaison d'un nom : minuscules, sans accents ni ponctuation. */
export const normalizeAppName = (value) =>
  cleanAppName(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Valide et nettoie une liste d'apps locales (stockage ou fichier importé) :
 * entrées invalides et doublons d'id ignorés.
 */
export const parseLocalApps = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const id = typeof entry.id === 'string' ? entry.id : '';
    const name = cleanAppName(entry.name);
    if (!LOCAL_ID_REGEX.test(id) || !name || seen.has(id)) continue;
    seen.add(id);
    const app = { id, name };
    if (isValidPackageName(entry.packageName)) app.packageName = entry.packageName;
    out.push(app);
    if (out.length >= MAX_LOCAL_APPS) break;
  }
  return out;
};

/**
 * Cherche l'app du catalogue qui correspond à une app locale : même nom de
 * package en priorité, sinon même nom normalisé à condition qu'il soit unique
 * (en cas de doute, on ne fusionne pas).
 *
 * @param {{ name: string, packageName?: string }} local
 * @param {Array<{ id: string|number, name: string, playStoreUrl?: string }>} catalogApps
 * @param {(url?: string) => string|null} extractPackageId
 */
export const findCatalogMatch = (local, catalogApps, extractPackageId) => {
  if (!local || !Array.isArray(catalogApps)) return null;

  if (local.packageName) {
    const byPackage = catalogApps.find(app => extractPackageId(app.playStoreUrl) === local.packageName);
    if (byPackage) return byPackage;
  }

  const wanted = normalizeAppName(local.name);
  if (!wanted) return null;
  const byName = catalogApps.filter(app => normalizeAppName(app.name) === wanted);
  return byName.length === 1 ? byName[0] : null;
};
