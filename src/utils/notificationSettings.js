// Réglages des notifications ajoutés avec le moteur unifié (voir docs/guides/notifications.md).
// Les deux réglages historiques restent dans leur module :
//  - « Suggestions d'alternatives » : src/utils/alternativeNudges.js
//  - « Changements de note »        : src/utils/gradeChanges.js
// Stockés en localStorage (préfixe trusti_, effacés par « Vider le stockage ») et
// transmis au natif par useNotificationCenter.

const readFlag = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
};

const writeFlag = (key, enabled) => {
  try {
    localStorage.setItem(key, enabled ? 'true' : 'false');
  } catch {
    // localStorage indisponible : le réglage reste valable pour la session.
  }
};

const KEYS = {
  events: 'trusti_event_alerts_enabled',
  installs: 'trusti_install_alerts_enabled',
  migrationReminders: 'trusti_migration_reminders_enabled',
  digest: 'trusti_notification_digest',
};

// Événements (fuite, rachat, open source…) des apps suivies : actif par défaut
export const areEventAlertsEnabled = () => readFlag(KEYS.events, true);
export const setEventAlertsEnabled = (enabled) => writeFlag(KEYS.events, enabled);

// Nouvelle app installée notée D ou E : actif par défaut
export const areInstallAlertsEnabled = () => readFlag(KEYS.installs, true);
export const setInstallAlertsEnabled = (enabled) => writeFlag(KEYS.installs, enabled);

// Relance des migrations en cours et détection d'une migration terminée : actif par défaut
export const areMigrationRemindersEnabled = () => readFlag(KEYS.migrationReminders, true);
export const setMigrationRemindersEnabled = (enabled) => writeFlag(KEYS.migrationReminders, enabled);

// Mode « bilan mensuel » : une notification par mois au lieu du fil de l'eau (sauf
// alertes critiques). Désactivé par défaut.
export const isDigestModeEnabled = () => readFlag(KEYS.digest, false);
export const setDigestModeEnabled = (enabled) => writeFlag(KEYS.digest, enabled);
