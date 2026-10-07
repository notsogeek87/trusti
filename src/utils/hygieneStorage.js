/**
 * État local du bilan "Hygiène numérique" (cases cochées, carte masquée).
 * Stocké uniquement en localStorage (clé "trusti_hygiene", préfixe commun
 * voir storageStats.js) — jamais envoyé au serveur.
 */
const STORAGE_KEY = 'trusti_hygiene';
const DEFAULT_STATE = { checks: {}, cardDismissed: false };

export const getHygieneState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE, checks: {} };
    return {
      checks: parsed.checks && typeof parsed.checks === 'object' ? parsed.checks : {},
      cardDismissed: parsed.cardDismissed === true,
    };
  } catch {
    return { ...DEFAULT_STATE, checks: {} };
  }
};

export const saveHygieneState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponible (navigation privée stricte) : état perdu au rechargement.
  }
};
