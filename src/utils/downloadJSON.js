import { saveBlob } from './saveFile';

/**
 * Enregistre un objet sous forme de fichier JSON, côté client uniquement
 * (aucun appel réseau). Geste explicite de l'utilisateur, jamais automatique.
 * Fonctionne aussi dans l'app Android (sélecteur système, voir saveFile.js).
 */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return saveBlob(blob, filename);
}

export default downloadJSON;
