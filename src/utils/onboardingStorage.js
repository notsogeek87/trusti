// Suivi de l'onboarding au niveau de l'appareil (PWA/APK), indépendant de la
// connexion : une fois fait, on ne le repropose plus, connecté ou non.
const ONBOARDING_DONE_KEY = 'trusti_onboarding_done';

export const hasCompletedOnboarding = () => {
  try {
    return localStorage.getItem(ONBOARDING_DONE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markOnboardingComplete = () => {
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true');
  } catch {
    // localStorage indisponible (navigation privée stricte) : tant pis,
    // le modal de bienvenue réapparaîtra, sans casser l'app.
  }
};
