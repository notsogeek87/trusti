/**
 * Déclenche le téléchargement d'un objet sous forme de fichier JSON, côté
 * client uniquement (aucun appel réseau). Utilisé pour l'export de l'analyse
 * technique (spec §12) — geste explicite de l'utilisateur, jamais automatique.
 */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default downloadJSON;
