// Boîte de réception des notifications (cloche du header, web et APK) et données
// transmises au moteur de notifications Android (NotificationEngineWorker).
//
// Tout se calcule sur l'appareil : l'API renvoie la même liste publique à tout le monde
// (événements, changements de note) et le tri entre « mes apps » et le reste se fait ici.
// Logique pure, testée dans tests/technical/notificationInbox.test.js.
// Voir docs/guides/notifications.md.
import { isStrictlyBetterGrade } from './alternatives.js';
import { extractPackageId } from './androidPackage.js';

const STATE_KEY = 'trusti_inbox_state';
const MAX_READ_KEYS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Un parcours de migration sans progrès depuis ce délai donne lieu à une relance. */
export const MIGRATION_REMINDER_DAYS = 5;

/**
 * Priorités, de la plus urgente à la moins urgente. Même barème que
 * NotificationPolicy.java (moteur Android) : le garder identique des deux côtés.
 *  - critique (fuite / faille grave) : passe toujours, même budget épuisé ;
 *  - le reste se partage un budget de 2 notifications par semaine.
 */
export const PRIORITY = {
  EVENT_CRITICAL: 100,
  EVENT_NEGATIVE: 80,
  GRADE_DOWN: 70,
  INSTALL_RISKY: 60,
  EVENT_NEGATIVE_LOW: 50,
  MIGRATION_ALT_INSTALLED: 45,
  MIGRATION_REMINDER: 40,
  MIGRATION_DONE: 35,
  EVENT_POSITIVE: 30,
  GRADE_UP: 30,
  EVENT_NEUTRAL: 20,
  NUDGE: 10,
};

export const isCriticalEvent = (event) => event?.impact === 'negative' && event?.severity === 'high';

export function eventPriority(event) {
  if (!event) return 0;
  if (event.impact === 'negative') {
    if (event.severity === 'high') return PRIORITY.EVENT_CRITICAL;
    return event.severity === 'low' ? PRIORITY.EVENT_NEGATIVE_LOW : PRIORITY.EVENT_NEGATIVE;
  }
  return event.impact === 'positive' ? PRIORITY.EVENT_POSITIVE : PRIORITY.EVENT_NEUTRAL;
}

const isoDay = (time) => new Date(time).toISOString().slice(0, 10);

/**
 * Éléments de la boîte de réception, du plus récent au plus ancien.
 * @param {{
 *   events?: object[],        réponse de GET /api/app-events?since=…
 *   gradeChanges?: object[],  réponse de GET /api/apps?grade_changes_since=…
 *   myAppIds: Set<string>|string[],
 *   migrations?: object[],    voir buildMigrationSync (parcours en cours)
 *   nativeHistory?: object[], notifications envoyées par le moteur Android (installs, migrations finies, bilans)
 *   now?: number,
 * }} input
 * @returns {Array<{key: string, kind: string, appId: string|null, appName: string, date: string,
 *   impact: 'negative'|'neutral'|'positive', priority: number, data: object}>}
 */
export function buildInboxItems({ events, gradeChanges, myAppIds, migrations, nativeHistory, now = Date.now() }) {
  const mine = new Set([...(myAppIds || [])].map(String));
  const items = [];

  for (const e of events || []) {
    if (!e || !mine.has(String(e.appId))) continue;
    items.push({
      key: `event:${e.id}`,
      kind: 'event',
      appId: String(e.appId),
      appName: e.appName,
      date: e.publishedAt || e.date,
      impact: e.impact,
      priority: eventPriority(e),
      data: { type: e.type, severity: e.severity, title: e.title, summary: e.summary, sourceUrl: e.sourceUrl, eventDate: e.date },
    });
  }

  for (const c of gradeChanges || []) {
    if (!c || !mine.has(String(c.appId)) || c.previousGrade === c.grade) continue;
    const up = isStrictlyBetterGrade(c.grade, c.previousGrade);
    items.push({
      key: `grade:${c.appId}:${c.date}:${c.grade}`,
      kind: 'grade',
      appId: String(c.appId),
      appName: c.name,
      date: c.date,
      impact: up ? 'positive' : 'negative',
      priority: up ? PRIORITY.GRADE_UP : PRIORITY.GRADE_DOWN,
      data: { previousGrade: c.previousGrade, grade: c.grade },
    });
  }

  for (const m of migrations || []) {
    if (!m?.updatedAt || now - m.updatedAt < MIGRATION_REMINDER_DAYS * DAY_MS) continue;
    items.push({
      key: `migration:${m.appId}:${m.completed}`,
      kind: 'migration',
      appId: String(m.appId),
      appName: m.appName,
      date: isoDay(m.updatedAt + MIGRATION_REMINDER_DAYS * DAY_MS),
      impact: 'neutral',
      priority: PRIORITY.MIGRATION_REMINDER,
      data: { altName: m.altName, completed: m.completed, total: m.total },
    });
  }

  // Ce que seul le téléphone sait (apps installées) : textes déjà rédigés par le natif.
  for (const h of nativeHistory || []) {
    if (!h?.key || !['install', 'migrationDone', 'migrationAltInstalled', 'digest'].includes(h.kind)) continue;
    items.push({
      key: `native:${h.key}`,
      kind: h.kind,
      appId: h.appId ? String(h.appId) : null,
      appName: h.appName || '',
      date: isoDay(Number(h.at) || now),
      impact: h.kind === 'install' ? 'negative' : h.kind === 'digest' ? 'neutral' : 'positive',
      priority: Number(h.priority) || 0,
      data: { title: h.title || '', text: h.text || '' },
    });
  }

  // Une même clé n'apparaît qu'une fois (le natif et le web peuvent connaître le même fait).
  const seen = new Set();
  return items
    .filter(item => (seen.has(item.key) ? false : seen.add(item.key)))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || b.priority - a.priority);
}

/**
 * Bilan des 30 derniers jours (en tête de la boîte de réception, et contenu du bilan
 * mensuel envoyé par le moteur Android quand le mode « bilan » est choisi).
 */
export function buildMonthlyDigest(items, now = Date.now()) {
  const from = isoDay(now - 30 * DAY_MS);
  const digest = { gradeDown: 0, gradeUp: 0, eventsNegative: 0, eventsPositive: 0, risky: 0, migrationsDone: 0 };
  for (const item of items || []) {
    if (String(item.date) < from) continue;
    if (item.kind === 'grade') digest[item.impact === 'positive' ? 'gradeUp' : 'gradeDown'] += 1;
    else if (item.kind === 'event' && item.impact === 'negative') digest.eventsNegative += 1;
    else if (item.kind === 'event' && item.impact === 'positive') digest.eventsPositive += 1;
    else if (item.kind === 'install') digest.risky += 1;
    else if (item.kind === 'migrationDone') digest.migrationsDone += 1;
  }
  return digest;
}

export const isDigestEmpty = (digest) => Object.values(digest || {}).every(v => !v);

// --- État « lu » -------------------------------------------------------------

/** Premier passage : tout ce qui existe déjà est considéré comme lu (pas de rafale). */
export const initialInboxState = (items) => ({ read: (items || []).map(i => i.key).slice(-MAX_READ_KEYS) });

export function unreadItems(items, state) {
  if (!state) return [];
  const read = new Set(state.read || []);
  return (items || []).filter(i => !read.has(i.key));
}

export function markRead(state, items) {
  const keys = [...(state?.read || []), ...(items || []).map(i => i.key)];
  return { read: keys.filter((k, i) => keys.indexOf(k) === i).slice(-MAX_READ_KEYS) };
}

export const loadInboxState = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
    if (!parsed || !Array.isArray(parsed.read)) return null;
    return { read: parsed.read.map(String) };
  } catch {
    return null;
  }
};

export const saveInboxState = (state) => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponible : les éléments resteront « non lus » jusqu'à la prochaine visite.
  }
};

// --- Données transmises au moteur Android ------------------------------------

/**
 * Parcours de migration en cours -> forme envoyée au natif (et utilisée par la boîte
 * de réception). Les noms de paquets permettent au téléphone de voir, sans réseau,
 * que l'alternative est installée ou que l'app quittée a été désinstallée.
 * @param {Array<{app: object, altName: string|null, altId?: string|null, completed: number, total: number, updatedAt?: number|null}>} inProgress
 *   sortie de getMigrationsInProgress (src/utils/migrationGuide.js)
 * @param {object[]} catalogApps apps connues (pour retrouver l'alternative choisie)
 */
export function buildMigrationSync(inProgress, catalogApps = []) {
  const byId = new Map((catalogApps || []).map(a => [String(a.id), a]));
  return (inProgress || [])
    .filter(m => m?.app)
    .map(({ app, altName, altId, completed, total, updatedAt }) => {
      const alt = altId ? byId.get(String(altId)) : null;
      // Alternative du parcours inconnue du catalogue chargé : celle affichée sur la carte, si c'est la même.
      const altUrl = alt?.playStoreUrl || (!altId || altName === app.alternative ? app.altPlayStoreUrl : null);
      return {
        appId: String(app.id),
        appName: app.name,
        altName: altName || alt?.name || app.alternative || null,
        appPackage: extractPackageId(app.playStoreUrl) || null,
        altPackage: extractPackageId(altUrl) || null,
        completed,
        total,
        updatedAt: Number(updatedAt) || null,
      };
    });
}
