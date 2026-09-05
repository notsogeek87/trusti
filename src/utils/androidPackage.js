/**
 * Extrait le nom de package Android (ex. "org.thoughtcrime.securesms") d'une URL
 * Play Store du type "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms".
 */
export function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}
