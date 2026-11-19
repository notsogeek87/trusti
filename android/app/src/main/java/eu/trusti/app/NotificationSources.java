package eu.trusti.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Sources du moteur de notifications : chacune renvoie ses candidates pour ce passage, déjà
 * filtrées (apps suivies, déjà vues), sans rien envoyer. L'envoi, le budget et le bilan sont
 * décidés par NotificationEngineWorker avec NotificationPolicy.
 *
 * Les listes publiques lues sur l'API (changements de note, événements, apps notées D/E) sont
 * les mêmes pour tout le monde : les apps du téléphone ne quittent jamais l'appareil.
 */
final class NotificationSources {

    static final String CHANNEL_EVENTS = "events";
    static final String CHANNEL_GRADES = "grade_changes";
    static final String CHANNEL_INSTALLS = "risky_installs";
    static final String CHANNEL_MIGRATIONS = "migrations";
    static final String CHANNEL_NUDGES = "alternatives";
    static final String CHANNEL_DIGEST = "digest";

    static final int ID_NUDGE = AlternativeNudgeWorker.NOTIFICATION_ID; // 4201
    static final int ID_GRADE = GradeChangeWorker.NOTIFICATION_ID;      // 4202
    static final int ID_EVENT = 4203;
    static final int ID_INSTALL = 4204;
    static final int ID_MIGRATION = 4205;
    static final int ID_DIGEST = 4206;

    private static final long DAY_MS = TimeUnit.DAYS.toMillis(1);
    private static final int GRADE_LOOKBACK_DAYS = 14;

    // Événements
    private static final String KEY_EVENTS_INITIALIZED = "eventsInitialized";
    private static final String KEY_EVENTS_ACK = "eventsAck";
    // Apps à risque installées
    private static final String KEY_RISKY_CATALOG = "riskyCatalog";
    private static final String KEY_RISKY_FETCHED_AT = "riskyFetchedAt";
    private static final String KEY_INSTALLS_KNOWN = "installsKnown";
    // Migrations
    private static final String KEY_MIGRATION_DONE = "migrationNotified";
    private static final String KEY_MIGRATION_FIRST_SEEN = "migrationFirstSeen_";
    // Suggestions (préférences historiques d'AlternativeNudgeWorker)
    private static final String KEY_NUDGES_ENABLED = "enabled";
    private static final String KEY_NUDGES_CANDIDATES = "candidates";
    private static final String KEY_NUDGES_FIRST_SYNC_AT = "firstSyncAt";
    private static final String KEY_NUDGES_LAST_NOTIFIED_AT = "lastNotifiedAt";
    private static final String KEY_NUDGES_PROPOSED_PREFIX = "proposed_";
    private static final long NUDGE_FIRST_DELAY_MS = 3 * DAY_MS;
    private static final long NUDGE_MIN_INTERVAL_MS = 7 * DAY_MS;
    private static final long NUDGE_SAME_APP_COOLDOWN_MS = 30 * DAY_MS;

    private NotificationSources() {}

    /** Ids des apps de « Mes Apps », transmis par le web (syncGradeAlerts), même alertes de note coupées. */
    static Set<String> trackedAppIds(Context context) {
        Set<String> tracked = new HashSet<>();
        JSONArray list = NotificationStore.readArray(
            context.getSharedPreferences(GradeChangeWorker.PREFS, Context.MODE_PRIVATE), GradeChangeWorker.KEY_TRACKED);
        for (int i = 0; i < list.length(); i++) {
            JSONObject app = list.optJSONObject(i);
            if (app != null && !app.optString("appId").isEmpty()) tracked.add(app.optString("appId"));
        }
        return tracked;
    }

    static boolean isInstalled(PackageManager pm, String packageName) {
        if (packageName == null || packageName.isEmpty()) return false;
        try {
            pm.getPackageInfo(packageName, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    // --- Changements de note -----------------------------------------------------

    /**
     * Changements de note des apps suivies (même logique que src/utils/gradeChanges.js).
     * Premier passage : tout est marqué comme vu. Plusieurs changements : un seul résumé.
     */
    static List<NotificationCandidate> grades(Context context, Set<String> tracked, long now) {
        List<NotificationCandidate> out = new ArrayList<>();
        SharedPreferences prefs = context.getSharedPreferences(GradeChangeWorker.PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(GradeChangeWorker.KEY_ENABLED, false)) return out;

        boolean firstRun = !prefs.contains(GradeChangeWorker.KEY_SEEN_AT);
        String seenAt = prefs.getString(GradeChangeWorker.KEY_SEEN_AT, NotificationStore.isoDay(now));
        String since = NotificationStore.isoDay(NotificationStore.parseDay(seenAt, now) - GRADE_LOOKBACK_DAYS * DAY_MS);

        JSONArray changes;
        try {
            JSONObject body = NotificationStore.fetchJson(NotificationStore.apiUrl(context) + "/apps?grade_changes_since=" + since);
            changes = body.optJSONArray("changes");
            if (changes == null) changes = new JSONArray();
        } catch (Exception e) {
            return out; // hors ligne : prochain passage
        }

        Set<String> ack = new HashSet<>(prefs.getStringSet(GradeChangeWorker.KEY_ACK, new HashSet<>()));
        if (firstRun) {
            for (int i = 0; i < changes.length(); i++) ack.add(gradeKey(changes.optJSONObject(i)));
            saveGradesSeen(prefs, now, ack);
            return out;
        }

        Set<String> muted = NotificationStore.muted(context);
        List<JSONObject> pending = new ArrayList<>();
        for (int i = 0; i < changes.length(); i++) {
            JSONObject change = changes.optJSONObject(i);
            if (change == null) continue;
            if (!tracked.contains(change.optString("appId")) || change.optString("date").compareTo(since) < 0) continue;
            if (muted.contains(change.optString("appId"))) continue;
            if (change.optString("grade").equals(change.optString("previousGrade"))) continue;
            if (ack.contains(gradeKey(change))) continue;
            pending.add(change);
        }
        if (pending.isEmpty()) return out;

        boolean anyDown = false;
        for (JSONObject change : pending) anyDown |= isDown(change);

        NotificationCandidate candidate;
        if (pending.size() == 1) {
            JSONObject change = pending.get(0);
            boolean down = isDown(change);
            candidate = new NotificationCandidate(
                "grade:" + gradeKey(change), NotificationCandidate.KIND_GRADE, CHANNEL_GRADES, ID_GRADE,
                down ? NotificationPolicy.GRADE_DOWN : NotificationPolicy.GRADE_UP, false,
                change.optString("appId"), change.optString("name"),
                context.getString(down ? R.string.notif_grade_down_title : R.string.notif_grade_up_title,
                    change.optString("name"), change.optString("previousGrade"), change.optString("grade")),
                context.getString(down ? R.string.notif_grade_down_text : R.string.notif_grade_up_text));
            if (down) {
                candidate.action(R.string.notif_action_see_alternatives, NotificationCandidate.Action.OPEN, null)
                    .action(R.string.notif_action_mute, NotificationCandidate.Action.MUTE, null);
            }
        } else {
            StringBuilder lines = new StringBuilder();
            for (JSONObject change : pending) {
                if (lines.length() > 0) lines.append("\n");
                lines.append(change.optString("name")).append(" : ")
                    .append(change.optString("previousGrade")).append(" → ").append(change.optString("grade"));
            }
            candidate = new NotificationCandidate(
                "grades:" + NotificationStore.isoDay(now) + ":" + pending.size(), NotificationCandidate.KIND_GRADE, CHANNEL_GRADES, ID_GRADE,
                anyDown ? NotificationPolicy.GRADE_DOWN : NotificationPolicy.GRADE_UP, false,
                null, null, context.getString(R.string.notif_grades_changed, pending.size()), lines.toString());
        }
        for (JSONObject change : pending) candidate.count(isDown(change) ? "gradeDown" : "gradeUp");
        candidate.onConsumed = () -> {
            for (JSONObject change : pending) ack.add(gradeKey(change));
            saveGradesSeen(prefs, now, ack);
        };
        out.add(candidate);
        return out;
    }

    private static void saveGradesSeen(SharedPreferences prefs, long now, Set<String> ack) {
        String oldest = NotificationStore.isoDay(now - GRADE_LOOKBACK_DAYS * DAY_MS);
        Set<String> kept = new HashSet<>();
        for (String k : ack) {
            // clé « appId:AAAA-MM-JJ:G » : la date est juste avant la note
            if (k.length() >= 12 && k.substring(k.length() - 12, k.length() - 2).compareTo(oldest) >= 0) kept.add(k);
        }
        prefs.edit().putString(GradeChangeWorker.KEY_SEEN_AT, NotificationStore.isoDay(now))
            .putStringSet(GradeChangeWorker.KEY_ACK, kept).apply();
    }

    private static String gradeKey(JSONObject change) {
        if (change == null) return "";
        return change.optString("appId") + ":" + change.optString("date") + ":" + change.optString("grade");
    }

    private static boolean isDown(JSONObject change) {
        // A < B < … < E : une lettre plus loin dans l'alphabet est une baisse.
        return change.optString("grade").compareTo(change.optString("previousGrade")) > 0;
    }

    // --- Événements --------------------------------------------------------------

    /**
     * Événements publiés des 30 derniers jours pour les apps suivies (GET /app-events?since=…).
     * Premier passage : tout est marqué comme vu. Un événement n'est poussé qu'une fois (id).
     */
    static List<NotificationCandidate> events(Context context, Set<String> tracked, long now) {
        List<NotificationCandidate> out = new ArrayList<>();
        SharedPreferences prefs = NotificationStore.prefs(context);
        if (!prefs.getBoolean(NotificationStore.KEY_EVENTS_ENABLED, false) || tracked.isEmpty()) return out;

        String since = NotificationStore.isoDay(now - NotificationPolicy.EVENT_MAX_AGE_DAYS * DAY_MS);
        JSONArray events;
        try {
            JSONObject body = NotificationStore.fetchJson(NotificationStore.apiUrl(context) + "/app-events?since=" + since);
            events = body.optJSONArray("events");
            if (events == null) events = new JSONArray();
        } catch (Exception e) {
            return out;
        }

        // On ne garde que les ids encore renvoyés (fenêtre de 30 jours) : la liste reste courte.
        Set<String> stored = prefs.getStringSet(KEY_EVENTS_ACK, new HashSet<>());
        Set<String> ack = new HashSet<>();
        Set<String> fetchedIds = new HashSet<>();
        for (int i = 0; i < events.length(); i++) {
            JSONObject event = events.optJSONObject(i);
            if (event != null) fetchedIds.add(event.optString("id"));
        }
        for (String id : stored) if (fetchedIds.contains(id)) ack.add(id);

        if (!prefs.getBoolean(KEY_EVENTS_INITIALIZED, false)) {
            prefs.edit().putBoolean(KEY_EVENTS_INITIALIZED, true).putStringSet(KEY_EVENTS_ACK, fetchedIds).apply();
            return out;
        }
        prefs.edit().putStringSet(KEY_EVENTS_ACK, ack).apply();

        for (int i = 0; i < events.length(); i++) {
            JSONObject event = events.optJSONObject(i);
            if (event == null) continue;
            String id = event.optString("id");
            String appId = event.optString("appId");
            if (id.isEmpty() || ack.contains(id) || !tracked.contains(appId)) continue;

            String impact = event.optString("impact");
            String severity = event.optString("severity");
            String appName = event.optString("appName");
            String title = context.getString(R.string.notif_event_title, appName, eventTypeLabel(context, event.optString("type")));
            String summary = event.optString("summary", "");
            String text = event.optString("title") + ("null".equals(summary) || summary.isEmpty() ? "" : "\n" + summary);

            NotificationCandidate candidate = new NotificationCandidate(
                "event:" + id, NotificationCandidate.KIND_EVENT, CHANNEL_EVENTS, ID_EVENT,
                NotificationPolicy.eventPriority(impact, severity), NotificationPolicy.isCriticalEvent(impact, severity),
                appId, appName, title, text);
            if ("negative".equals(impact)) {
                candidate.count("eventsNegative")
                    .action(R.string.notif_action_see_alternatives, NotificationCandidate.Action.OPEN, null)
                    .action(R.string.notif_action_mute, NotificationCandidate.Action.MUTE, null);
            } else {
                if ("positive".equals(impact)) candidate.count("eventsPositive");
                candidate.action(R.string.notif_action_see, NotificationCandidate.Action.OPEN, null);
            }
            candidate.onConsumed = () -> {
                Set<String> current = new HashSet<>(prefs.getStringSet(KEY_EVENTS_ACK, new HashSet<>()));
                current.add(id);
                prefs.edit().putStringSet(KEY_EVENTS_ACK, current).apply();
            };
            out.add(candidate);
        }
        return out;
    }

    private static String eventTypeLabel(Context context, String type) {
        switch (type) {
            case "incident": return context.getString(R.string.notif_event_incident);
            case "acquisition": return context.getString(R.string.notif_event_acquisition);
            case "policy_change": return context.getString(R.string.notif_event_policy_change);
            case "jurisdiction_change": return context.getString(R.string.notif_event_jurisdiction_change);
            case "open_source": return context.getString(R.string.notif_event_open_source);
            case "closed_source": return context.getString(R.string.notif_event_closed_source);
            case "audit": return context.getString(R.string.notif_event_audit);
            case "shutdown": return context.getString(R.string.notif_event_shutdown);
            default: return context.getString(R.string.notif_event_other);
        }
    }

    // --- Nouvelles apps à risque -------------------------------------------------

    /**
     * Apps notées D ou E installées depuis le passage précédent (et pas déjà dans « Mes Apps »).
     * La liste des apps D/E est la liste publique du catalogue, relue une fois par jour ;
     * la comparaison avec les apps installées se fait ici, sur le téléphone.
     */
    static List<NotificationCandidate> installs(Context context, Set<String> tracked, long now) {
        List<NotificationCandidate> out = new ArrayList<>();
        SharedPreferences prefs = NotificationStore.prefs(context);
        if (!prefs.getBoolean(NotificationStore.KEY_INSTALLS_ENABLED, false)) return out;

        JSONObject catalog = riskyCatalog(context, prefs, now);
        if (catalog == null || catalog.length() == 0) return out;

        PackageManager pm = context.getPackageManager();
        boolean firstRun = !prefs.contains(KEY_INSTALLS_KNOWN);
        Set<String> known = new HashSet<>(prefs.getStringSet(KEY_INSTALLS_KNOWN, new HashSet<>()));
        Set<String> silent = new HashSet<>();

        Iterator<String> packages = catalog.keys();
        while (packages.hasNext()) {
            String packageName = packages.next();
            if (known.contains(packageName) || !isInstalled(pm, packageName)) continue;
            JSONObject app = catalog.optJSONObject(packageName);
            if (app == null) continue;
            String appId = app.optString("appId");
            // Déjà connue (premier passage, ou app déjà suivie dans « Mes Apps ») : rien à signaler.
            if (firstRun || tracked.contains(appId)) {
                silent.add(packageName);
                continue;
            }
            String name = app.optString("name");
            String grade = app.optString("grade");
            NotificationCandidate candidate = new NotificationCandidate(
                "install:" + appId + ":" + NotificationStore.isoDay(now), NotificationCandidate.KIND_INSTALL, CHANNEL_INSTALLS, ID_INSTALL,
                NotificationPolicy.INSTALL_RISKY, false, appId, name,
                context.getString(R.string.notif_install_title, name, grade),
                context.getString(R.string.notif_install_text, grade));
            candidate.openAction = "add";
            candidate.count("risky")
                .action(R.string.notif_action_see_alternatives, NotificationCandidate.Action.OPEN, "add")
                .action(R.string.notif_action_ignore, NotificationCandidate.Action.MUTE, null);
            candidate.onConsumed = () -> {
                Set<String> current = new HashSet<>(prefs.getStringSet(KEY_INSTALLS_KNOWN, new HashSet<>()));
                current.add(packageName);
                prefs.edit().putStringSet(KEY_INSTALLS_KNOWN, current).apply();
            };
            out.add(candidate);
        }
        if (firstRun || !silent.isEmpty()) {
            known.addAll(silent);
            prefs.edit().putStringSet(KEY_INSTALLS_KNOWN, known).apply();
        }
        return out;
    }

    /** { packageName: { appId, name, grade } } des apps notées D ou E, en cache 24 h. */
    private static JSONObject riskyCatalog(Context context, SharedPreferences prefs, long now) {
        JSONObject cached = null;
        try {
            cached = new JSONObject(prefs.getString(KEY_RISKY_CATALOG, "{}"));
        } catch (Exception ignored) {
            // cache illisible : relu ci-dessous
        }
        if (cached != null && cached.length() > 0 && now - prefs.getLong(KEY_RISKY_FETCHED_AT, 0) < DAY_MS) return cached;
        try {
            JSONArray apps = NotificationStore.fetchJson(NotificationStore.apiUrl(context) + "/apps?grade=D,E").optJSONArray("apps");
            JSONObject catalog = new JSONObject();
            for (int i = 0; apps != null && i < apps.length(); i++) {
                JSONObject app = apps.optJSONObject(i);
                if (app == null) continue;
                String packageName = packageFromPlayStoreUrl(app.optString("playStoreUrl"));
                if (packageName == null) continue;
                catalog.put(packageName, new JSONObject()
                    .put("appId", app.optString("id"))
                    .put("name", app.optString("name"))
                    .put("grade", app.optString("grade")));
            }
            prefs.edit().putString(KEY_RISKY_CATALOG, catalog.toString()).putLong(KEY_RISKY_FETCHED_AT, now).apply();
            return catalog;
        } catch (Exception e) {
            return cached; // hors ligne : on garde la liste connue
        }
    }

    static String packageFromPlayStoreUrl(String url) {
        if (url == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("id=([a-zA-Z0-9._]+)").matcher(url);
        return m.find() ? m.group(1) : null;
    }

    // --- Migrations --------------------------------------------------------------

    /**
     * Parcours de migration en cours (transmis par le web) :
     *  - alternative installée et app quittée désinstallée : migration terminée (remontée au web
     *    pour la marquer comme faite, et bravo) ;
     *  - alternative installée, app quittée encore là : il reste à finir ;
     *  - aucun progrès depuis MIGRATION_REMINDER_DAYS : relance, une fois par étape atteinte.
     */
    static List<NotificationCandidate> migrations(Context context, long now) {
        List<NotificationCandidate> out = new ArrayList<>();
        SharedPreferences prefs = NotificationStore.prefs(context);
        if (!prefs.getBoolean(NotificationStore.KEY_MIGRATIONS_ENABLED, false)) return out;

        JSONArray migrations = NotificationStore.readArray(prefs, NotificationStore.KEY_MIGRATIONS);
        Set<String> notified = new HashSet<>(prefs.getStringSet(KEY_MIGRATION_DONE, new HashSet<>()));
        PackageManager pm = context.getPackageManager();
        SharedPreferences.Editor editor = prefs.edit();
        boolean changed = false;

        for (int i = 0; i < migrations.length(); i++) {
            JSONObject m = migrations.optJSONObject(i);
            if (m == null) continue;
            String appId = m.optString("appId");
            String appName = m.optString("appName");
            String altName = m.isNull("altName") ? null : m.optString("altName");
            String appPackage = m.isNull("appPackage") ? null : m.optString("appPackage");
            String altPackage = m.isNull("altPackage") ? null : m.optString("altPackage");
            int completed = m.optInt("completed");
            int total = m.optInt("total");
            boolean altInstalled = isInstalled(pm, altPackage);
            boolean appInstalled = isInstalled(pm, appPackage);

            if (altInstalled && appPackage != null && !appInstalled) {
                String doneKey = "done:" + appId;
                if (notified.contains(doneKey)) continue;
                // Remonté tout de suite au web : la migration est faite, même si la notification attend.
                notified.add(doneKey);
                changed = true;
                NotificationStore.addCompletedMigration(context, appId, appName, altName);
                NotificationCandidate candidate = new NotificationCandidate(
                    doneKey, NotificationCandidate.KIND_MIGRATION_DONE, CHANNEL_MIGRATIONS, ID_MIGRATION,
                    NotificationPolicy.MIGRATION_DONE, false, appId, appName,
                    context.getString(R.string.notif_migration_done_title, appName),
                    context.getString(R.string.notif_migration_done_text, altName != null ? altName : appName));
                candidate.count("migrationsDone");
                out.add(candidate);
                continue;
            }

            if (altInstalled && appInstalled) {
                String altKey = "alt:" + appId;
                if (notified.contains(altKey)) continue;
                NotificationCandidate candidate = new NotificationCandidate(
                    altKey, NotificationCandidate.KIND_MIGRATION_ALT_INSTALLED, CHANNEL_MIGRATIONS, ID_MIGRATION,
                    NotificationPolicy.MIGRATION_ALT_INSTALLED, false, appId, appName,
                    context.getString(R.string.notif_migration_alt_title, altName != null ? altName : ""),
                    context.getString(R.string.notif_migration_alt_text, appName));
                candidate.openAction = "resumeMigration";
                candidate.action(R.string.notif_action_resume, NotificationCandidate.Action.OPEN, "resumeMigration");
                candidate.onConsumed = () -> markMigrationNotified(prefs, altKey);
                out.add(candidate);
                continue;
            }

            // Parcours sans date (commencé avant cette version) : on compte depuis la première synchro vue.
            long updatedAt = m.optLong("updatedAt", 0);
            if (updatedAt <= 0) {
                String firstSeenKey = KEY_MIGRATION_FIRST_SEEN + appId;
                updatedAt = prefs.getLong(firstSeenKey, 0);
                if (updatedAt <= 0) {
                    editor.putLong(firstSeenKey, now);
                    changed = true;
                    continue;
                }
            }
            String reminderKey = "rem:" + appId + ":" + completed;
            if (notified.contains(reminderKey) || !NotificationPolicy.migrationStale(updatedAt, now)) continue;
            NotificationCandidate candidate = new NotificationCandidate(
                reminderKey, NotificationCandidate.KIND_MIGRATION, CHANNEL_MIGRATIONS, ID_MIGRATION,
                NotificationPolicy.MIGRATION_REMINDER, false, appId, appName,
                altName != null
                    ? context.getString(R.string.notif_migration_reminder_title, appName, altName)
                    : context.getString(R.string.notif_migration_reminder_title_noalt, appName),
                context.getString(R.string.notif_migration_reminder_text, completed, total));
            candidate.openAction = "resumeMigration";
            candidate.action(R.string.notif_action_resume, NotificationCandidate.Action.OPEN, "resumeMigration");
            candidate.onConsumed = () -> markMigrationNotified(prefs, reminderKey);
            out.add(candidate);
        }
        if (changed) editor.putStringSet(KEY_MIGRATION_DONE, notified).apply();
        return out;
    }

    private static void markMigrationNotified(SharedPreferences prefs, String key) {
        Set<String> current = new HashSet<>(prefs.getStringSet(KEY_MIGRATION_DONE, new HashSet<>()));
        current.add(key);
        prefs.edit().putStringSet(KEY_MIGRATION_DONE, current).apply();
    }

    // --- Suggestions d'alternatives ----------------------------------------------

    /**
     * Au plus une suggestion par semaine (règles historiques d'AlternativeNudgeWorker) :
     * rien les 3 premiers jours, la même app jamais deux fois en 30 jours, jamais une app écartée
     * (« Ne plus proposer ») ou désinstallée. Les candidates arrivent triées par le web.
     */
    static List<NotificationCandidate> nudges(Context context, long now) {
        List<NotificationCandidate> out = new ArrayList<>();
        SharedPreferences prefs = context.getSharedPreferences(AlternativeNudgeWorker.PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_NUDGES_ENABLED, false)) return out;
        if (now - prefs.getLong(KEY_NUDGES_FIRST_SYNC_AT, now) < NUDGE_FIRST_DELAY_MS) return out;
        if (now - prefs.getLong(KEY_NUDGES_LAST_NOTIFIED_AT, 0) < NUDGE_MIN_INTERVAL_MS) return out;

        Set<String> dismissed = prefs.getStringSet(AlternativeNudgeWorker.KEY_DISMISSED, new HashSet<>());
        PackageManager pm = context.getPackageManager();
        JSONArray candidates = NotificationStore.readArray(prefs, KEY_NUDGES_CANDIDATES);
        for (int i = 0; i < candidates.length(); i++) {
            JSONObject c = candidates.optJSONObject(i);
            if (c == null) continue;
            String appId = c.optString("appId");
            if (appId.isEmpty() || dismissed.contains(appId)) continue;
            if (now - prefs.getLong(KEY_NUDGES_PROPOSED_PREFIX + appId, 0) < NUDGE_SAME_APP_COOLDOWN_MS) continue;
            if (!isInstalled(pm, c.optString("packageName"))) continue;

            NotificationCandidate candidate = new NotificationCandidate(
                "nudge:" + appId + ":" + NotificationStore.isoDay(now), NotificationCandidate.KIND_NUDGE, CHANNEL_NUDGES, ID_NUDGE,
                NotificationPolicy.NUDGE, false, appId, c.optString("appName"),
                context.getString(R.string.notif_nudge_title, c.optString("appName"), c.optString("appGrade")),
                context.getString(R.string.notif_nudge_text, c.optString("altName"), c.optString("altGrade")));
            candidate.action(R.string.notif_nudge_see, NotificationCandidate.Action.OPEN, null)
                .action(R.string.notif_action_start_migration, NotificationCandidate.Action.OPEN, "resumeMigration")
                .action(R.string.notif_nudge_stop, NotificationCandidate.Action.DISMISS_NUDGE, null);
            candidate.onConsumed = () -> prefs.edit()
                .putLong(KEY_NUDGES_LAST_NOTIFIED_AT, now)
                .putLong(KEY_NUDGES_PROPOSED_PREFIX + appId, now)
                .apply();
            out.add(candidate);
            return out; // une seule suggestion par passage
        }
        return out;
    }
}
