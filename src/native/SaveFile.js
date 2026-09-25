import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers SaveFilePlugin (android/app/src/main/java/com/trusti/app/SaveFilePlugin.java).
 * saveFile({ filename, content, mimeType }) ouvre le sélecteur système Android
 * (Storage Access Framework) pour enregistrer directement un fichier à
 * l'emplacement choisi par l'utilisateur — pas la feuille de partage.
 * Rejette si l'utilisateur annule. N'existe que dans l'app Android native
 * (voir isNativeAndroid).
 */
const SaveFile = registerPlugin('SaveFile');

export default SaveFile;
