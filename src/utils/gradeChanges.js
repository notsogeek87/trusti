// Changements de note des apps de « Mes Apps » (carte « Notes mises à jour »).
// L'API renvoie les changements de tout le catalogue (GET /api/apps?grade_changes_since=…,
// même réponse pour tous) ; le tri entre « mes apps » et le reste se fait ici, sur
// l'appareil. Logique pure testée dans tests/technical/gradeChanges.test.js.
import { isStrictlyBetterGrade } from './alternatives.js';

const STORAGE_KEY = 'trusti_grade_changes_seen';
const ALERTS_ENABLED_KEY = 'trusti_grade_alerts_enabled';
const DAY_MS = 24 * 60 * 60 * 1000;

// Marge de relecture : une évaluation peut être publiée quelques jours après sa
// date (assessed_at). On redemande donc un peu avant la dernière visite, et les
// changements déjà vus sont écartés par leur clé.
export const LOOKBACK_DAYS = 14;

const isoDay = (date) => date.toISOString().slice(0, 10);

/** Clé stable d'un changement (une app peut changer plusieurs fois). */
export const changeKey = (c) => `${c.appId}:${c.date}:${c.grade}`;

/** Date à demander à l'API pour un état de lecture donné. */
export function sinceForState(state, now = new Date()) {
  const base = state?.seenAt ? new Date(`${state.seenAt}T00:00:00Z`) : now;
  const time = Number.isNaN(base.getTime()) ? now.getTime() : base.getTime();
  return isoDay(new Date(time - LOOKBACK_DAYS * DAY_MS));
}

/**
 * Changements à afficher : apps suivies, pas encore vus.
 * @param {Array<{appId, name, previousGrade, grade, date}>} changes réponse de l'API
 * @param {Set<string>|string[]} myAppIds
 * @param {{seenAt: string, ack: string[]}|null} state
 * @returns {Array<{appId, name, previousGrade, grade, date, direction: 'up'|'down'}>}
 */
export function pendingGradeChanges(changes, myAppIds, state) {
  if (!state) return []; // première visite : rien d'ancien à signaler
  const mine = new Set([...(myAppIds || [])].map(String));
  const ack = new Set(state.ack || []);
  // Plus ancien que la fenêtre relue : déjà vu (ou sa clé a été oubliée, voir acknowledge).
  const oldest = sinceForState(state);
  return (changes || [])
    .filter(c => c && mine.has(String(c.appId)) && c.previousGrade !== c.grade)
    .filter(c => String(c.date) >= oldest && !ack.has(changeKey(c)))
    .map(c => ({ ...c, appId: String(c.appId), direction: isStrictlyBetterGrade(c.grade, c.previousGrade) ? 'up' : 'down' }))
    // Les baisses d'abord (ce sont elles qui appellent une action), puis les plus récentes.
    .sort((a, b) => (a.direction === b.direction ? b.date.localeCompare(a.date) : a.direction === 'down' ? -1 : 1));
}

/**
 * Premier passage : tout ce que l'API renvoie est considéré comme déjà vu, pour ne pas
 * annoncer d'un coup des mois de changements à quelqu'un qui découvre la fonction.
 */
export function initialState(changes, now = new Date()) {
  return { seenAt: isoDay(now), ack: (changes || []).map(changeKey) };
}

/**
 * « J'ai vu » : les changements affichés passent en lu ; on oublie les clés trop
 * anciennes pour être encore renvoyées par l'API.
 */
export function acknowledge(state, shown, now = new Date()) {
  const seenAt = isoDay(now);
  const oldest = sinceForState({ seenAt }, now);
  const keep = [...(state?.ack || []), ...(shown || []).map(changeKey)]
    .filter((key, i, all) => all.indexOf(key) === i)
    // clé « appId:AAAA-MM-JJ:G » : la date est juste avant la note
    .filter(key => key.slice(-12, -2) >= oldest);
  return { seenAt, ack: keep };
}

export const loadGradeChangesState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed.seenAt !== 'string') return null;
    return { seenAt: parsed.seenAt, ack: Array.isArray(parsed.ack) ? parsed.ack.map(String) : [] };
  } catch {
    return null;
  }
};

export const saveGradeChangesState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponible : la carte réapparaîtra à la prochaine visite.
  }
};

// Réglage « Changements de note » (notifications Android, actif par défaut)
export const areGradeAlertsEnabled = () => {
  try {
    return localStorage.getItem(ALERTS_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
};

export const setGradeAlertsEnabled = (enabled) => {
  try {
    localStorage.setItem(ALERTS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // localStorage indisponible : le réglage reste valable pour la session.
  }
};
