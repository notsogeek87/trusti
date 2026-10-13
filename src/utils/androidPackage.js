/**
 * Extrait le nom de package Android (ex. "org.thoughtcrime.securesms") d'une URL
 * Play Store du type "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms".
 */
export function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

const PACKAGE_REGEX = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;

/**
 * Nom de package Android d'une app du catalogue : le champ explicite
 * `androidPackage` (apps hors Play Store : F-Droid, GitHub, apps système) s'il
 * est renseigné, sinon celui déduit du lien Play Store.
 */
export function getAndroidPackage(app) {
  if (!app) return null;
  if (typeof app.androidPackage === 'string' && PACKAGE_REGEX.test(app.androidPackage)) {
    return app.androidPackage;
  }
  return extractPackageId(app.playStoreUrl);
}
