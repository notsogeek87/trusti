import { cleanAppName, isValidPackageName } from './localApps.js';

// Plafond défensif : un téléphone très chargé ne doit pas gonfler le stockage local.
const MAX_UNKNOWN_APPS = 500;

/**
 * Scan complet (APK des releases GitHub) : parmi toutes les apps installées,
 * garde celles qu'on ajoute en « pas encore évaluée » — les apps qu'un
 * utilisateur reconnaît, pas les services et bibliothèques du système :
 *   - possède une icône de lancement ;
 *   - n'est pas une app système d'origine (une app système mise à jour, comme
 *     Chrome ou Gmail, compte) ;
 *   - n'est pas déjà au catalogue (elle a alors sa vraie note) ;
 *   - n'est pas Trusti elle-même.
 * Le nom vient de la liste des apps courantes quand elle la connaît, sinon de
 * l'intitulé donné par le téléphone.
 *
 * @param {Array<{packageName: string, label?: string, system?: boolean, launchable?: boolean}>} installedApps
 * @param {Set<string>} catalogPackages  packages des apps déjà notées
 * @param {Map<string, string>} knownNames  package -> nom (liste des apps courantes)
 * @param {string} [selfPackage]
 * @returns {Array<{name: string, packageName: string}>}
 */
export const pickUnknownInstalledApps = (installedApps, catalogPackages, knownNames = new Map(), selfPackage = '') => {
  if (!Array.isArray(installedApps)) return [];
  const seen = new Set();
  const out = [];
  for (const app of installedApps) {
    if (!app || typeof app !== 'object') continue;
    const pkg = app.packageName;
    if (!isValidPackageName(pkg) || pkg === selfPackage || seen.has(pkg)) continue;
    if (!app.launchable || app.system) continue;
    if (catalogPackages.has(pkg)) continue;
    const name = cleanAppName(knownNames.get(pkg) || app.label);
    if (!name) continue;
    seen.add(pkg);
    out.push({ name, packageName: pkg });
    if (out.length >= MAX_UNKNOWN_APPS) break;
  }
  return out;
};
