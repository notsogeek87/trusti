import { isNativeAndroid } from './platform';
import downloadJSON from './downloadJSON';
import SaveFile from '../native/SaveFile';

/**
 * Exporte un objet JSON vers un fichier que l'utilisateur peut sauvegarder.
 *
 * Dans un navigateur/PWA, un simple <a download> (voir downloadJSON.js)
 * suffit. Mais dans la WebView Android de l'app packagée, l'attribut
 * "download" sur un lien blob: ne déclenche rien (aucun DownloadListener
 * natif enregistré côté Capacitor). On utilise donc le sélecteur système
 * Android (Storage Access Framework, voir SaveFilePlugin) qui ouvre
 * directement l'enregistrement à l'emplacement choisi — pas la feuille de
 * partage.
 */
export async function exportJSONFile(data, filename) {
  if (!isNativeAndroid) {
    downloadJSON(data, filename);
    return;
  }

  const json = JSON.stringify(data, null, 2);
  await SaveFile.saveFile({ filename, content: json, mimeType: 'application/json' });
}

export default exportJSONFile;
