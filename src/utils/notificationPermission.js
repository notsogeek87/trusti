// Demande de la permission de notifier (Android 13+), précédée d'une carte d'explication dans
// « Mes Apps » (NotificationPermissionCard). Android ne laisse afficher sa fenêtre que deux fois :
// on explique d'abord, et on ne la montre que si la personne choisit « Activer ».
// Logique pure, testée dans tests/technical/notificationPermission.test.js.

const STATE_KEY = 'trusti_notif_prompt';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Après « Plus tard », la carte revient au bout de ce délai… */
export const LATER_DELAY_DAYS = 14;
/** …et pas plus de ce nombre de fois. */
export const MAX_LATER = 3;

/**
 * La carte doit-elle s'afficher ?
 * @param {{ isNative: boolean, permission: 'granted'|'denied'|'prompt'|null, hasApps: boolean,
 *   anyEnabled: boolean, state: { asked?: boolean, laterAt?: number|null, laterCount?: number }|null, now?: number }} input
 */
export function shouldOfferPermission({ isNative, permission, hasApps, anyEnabled, state, now = Date.now() }) {
  if (!isNative || permission !== 'prompt' || !hasApps || !anyEnabled) return false;
  if (state?.asked) return false;
  if ((state?.laterCount || 0) >= MAX_LATER) return false;
  if (state?.laterAt && now - state.laterAt < LATER_DELAY_DAYS * DAY_MS) return false;
  return true;
}

export const markAsked = (state) => ({ ...(state || {}), asked: true });
export const markLater = (state, now = Date.now()) => ({
  ...(state || {}),
  laterAt: now,
  laterCount: (state?.laterCount || 0) + 1,
});

export const loadPromptState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const savePromptState = (state) => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponible : la carte pourra revenir au prochain lancement.
  }
};
