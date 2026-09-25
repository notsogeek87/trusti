import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNativeAndroid } from './platform';
import downloadJSON from './downloadJSON';

/**
 * Exporte un objet JSON vers un fichier que l'utilisateur peut sauvegarder.
 *
 * Dans un navigateur/PWA, un simple <a download> (voir downloadJSON.js)
 * suffit. Mais dans la WebView Android de l'app packagée, l'attribut
 * "download" sur un lien blob: ne déclenche rien (aucun DownloadListener
 * natif enregistré côté Capacitor) : le bouton semble ne rien faire. On
 * écrit donc le fichier dans le cache de l'app puis on ouvre la feuille de
 * partage native (déjà utilisée ailleurs via @capacitor/share), qui permet
 * d'enregistrer le fichier où l'utilisateur veut (Fichiers, Drive, etc.).
 */
export async function exportJSONFile(data, filename, { title = 'Export' } = {}) {
  if (!isNativeAndroid) {
    downloadJSON(data, filename);
    return;
  }

  const json = JSON.stringify(data, null, 2);
  await Filesystem.writeFile({
    path: filename,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
  await Share.share({ title, url: uri });
}

export default exportJSONFile;
