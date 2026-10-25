/**
 * Pile des gestionnaires du bouton retour (geste/bouton Android, retour du
 * navigateur). Un écran plein (onboarding, import, proposition de rescan)
 * enregistre le sien ; App.jsx appelle celui du dessus avant son propre
 * traitement (fermeture d'une fiche, changement d'onglet, sortie de l'app).
 */
const handlers = [];

/**
 * @param {() => void} handler
 * @returns {() => void} fonction de désinscription
 */
export function registerBackHandler(handler) {
  handlers.push(handler);
  return () => {
    const index = handlers.lastIndexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  };
}

/**
 * Exécute le gestionnaire du dessus de la pile.
 * @returns {boolean} true si un écran a pris le retour en charge
 */
export function runBackHandler() {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
