/**
 * Utilitaires pour le partage de contenu
 */

/**
 * Partage du texte via l'API native ou copie dans le presse-papiers
 */
export const shareText = async (title, text) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
    } catch (err) {
      console.log('Partage annulé');
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copié dans le presse-papiers ✓');
    } catch (err) {
      console.error('Erreur lors de la copie', err);
    }
  }
};

/**
 * Copie du texte dans le presse-papiers
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers ✓');
  } catch (err) {
    console.error('Erreur lors de la copie', err);
  }
};
