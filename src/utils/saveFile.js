import { isNativeAndroid } from './platform';
import SaveFile from '../native/SaveFile';

/** Message de rejet du plugin natif quand l'utilisateur ferme le sélecteur. */
export const SAVE_CANCELLED = 'Enregistrement annulé';

/** true si l'erreur correspond à une annulation volontaire (pas une panne). */
export const isSaveCancelled = err => String(err?.message || err || '').includes(SAVE_CANCELLED);

/** Encode un Blob en base64 (sans le préfixe data:). */
export async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Enregistre un fichier côté client.
 *
 * - Navigateur/PWA : lien <a download> sur une URL blob:.
 * - App Android : l'attribut « download » ne déclenche rien dans la WebView
 *   Capacitor ; on ouvre donc le sélecteur système (SaveFilePlugin, Storage
 *   Access Framework). Le texte est envoyé tel quel, le binaire en base64.
 *
 * Une annulation par l'utilisateur est silencieuse (résout sans erreur).
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export async function saveBlob(blob, filename) {
  const mimeType = blob.type || 'application/octet-stream';
  if (isNativeAndroid) {
    const isText = /^text\/|json/.test(mimeType);
    const content = isText ? await blob.text() : await blobToBase64(blob);
    try {
      await SaveFile.saveFile({ filename, content, mimeType: mimeType.split(';')[0], base64: !isText });
    } catch (err) {
      if (!isSaveCancelled(err)) throw err;
    }
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default saveBlob;
