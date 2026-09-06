// Mode d'âge de l'appareil (PWA/APK), demandé une seule fois au tout premier
// démarrage, indépendamment de la connexion — comme l'onboarding, sauvegardé
// en local pour ne pas redemander à chaque visite.
const AGE_MODE_KEY = 'trusti_age_mode';

export const AGE_MODE = {
  ADULT: 'adult', // 15 ans ou plus : TrustiScore classique
  KID: 'kid',     // moins de 15 ans : style graphique dédié
};

export const getAgeMode = () => {
  try {
    const value = localStorage.getItem(AGE_MODE_KEY);
    return value === AGE_MODE.KID || value === AGE_MODE.ADULT ? value : null;
  } catch {
    return null;
  }
};

export const hasSetAgeMode = () => getAgeMode() !== null;

export const setAgeMode = (mode) => {
  try {
    localStorage.setItem(AGE_MODE_KEY, mode);
  } catch {
    // localStorage indisponible (navigation privée stricte) : tant pis,
    // la demande d'âge réapparaîtra, sans casser l'app.
  }
};
