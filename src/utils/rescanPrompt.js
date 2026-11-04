// Fréquence de la proposition « Tes apps ont changé ? » à la réouverture.
//
// - APK : on compare en silence les packages du catalogue installés avec ceux
//   vus au dernier scan (ou au dernier refus). On ne propose que s'il y a une
//   vraie différence (app installée ou désinstallée depuis).
// - Web : impossible de lire le téléphone, on se contente d'espacer la
//   proposition (au plus une fois tous les WEB_PROMPT_INTERVAL_MS).

const SNAPSHOT_KEY = 'trusti_installed_packages_snapshot';
const LAST_PROMPT_KEY = 'trusti_rescan_prompt_last';

export const WEB_PROMPT_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage indisponible : la proposition reviendra, sans casser l'app.
  }
};

/** Packages vus au dernier scan, ou null si jamais enregistré. */
export const loadPackagesSnapshot = () => {
  const raw = read(SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const savePackagesSnapshot = (packages) => {
  write(SNAPSHOT_KEY, JSON.stringify([...new Set(packages || [])].sort()));
};

/** Vrai si les deux listes de packages diffèrent (ordre ignoré). */
export const packagesChanged = (previous, current) => {
  const a = new Set(previous || []);
  const b = new Set(current || []);
  if (a.size !== b.size) return true;
  for (const pkg of a) if (!b.has(pkg)) return true;
  return false;
};

export const markRescanPromptHandled = (now = Date.now()) => {
  write(LAST_PROMPT_KEY, String(now));
};

/** Web : vrai si la dernière proposition (ou le dernier scan) date d'assez longtemps. */
export const isWebPromptDue = (now = Date.now(), interval = WEB_PROMPT_INTERVAL_MS) => {
  const last = Number(read(LAST_PROMPT_KEY));
  if (!last) return true;
  return now - last >= interval;
};
