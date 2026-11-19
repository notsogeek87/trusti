package eu.trusti.app;

import android.content.Context;
import android.content.SharedPreferences;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * État du moteur de notifications (SharedPreferences "trusti_notifications") : réglages venus
 * du web, historique lu par la boîte de réception, journal des envois (budget), apps en
 * sourdine, migrations vues terminées, bilan mensuel. Rien de tout cela ne quitte le téléphone.
 *
 * Les suggestions d'alternatives et les changements de note gardent leurs propres préférences
 * (AlternativeNudgeWorker.PREFS, GradeChangeWorker.PREFS) pour ne rien perdre de l'état existant.
 */
final class NotificationStore {

    static final String PREFS = "trusti_notifications";
    static final String DEFAULT_API_URL = "https://api.trusti-score.eu/api";

    static final String KEY_EVENTS_ENABLED = "eventsEnabled";
    static final String KEY_INSTALLS_ENABLED = "installsEnabled";
    static final String KEY_MIGRATIONS_ENABLED = "migrationRemindersEnabled";
    static final String KEY_DIGEST_ENABLED = "digestEnabled";
    static final String KEY_DIGEST_ENABLED_AT = "digestEnabledAt";
    static final String KEY_API_URL = "apiUrl";
    static final String KEY_MIGRATIONS = "migrations";
    static final String KEY_SENT_LOG = "sentLog";
    static final String KEY_HISTORY = "history";
    static final String KEY_MUTED = "muted";
    static final String KEY_COMPLETED = "completedMigrations";
    static final String KEY_LAST_DIGEST_AT = "lastDigestAt";
    static final String KEY_DIGEST_COUNTS = "digestCounts";

    private static final int HISTORY_MAX = 50;
    private static final int TIMEOUT_MS = 15000;

    private NotificationStore() {}

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static String apiUrl(Context context) {
        String url = prefs(context).getString(KEY_API_URL, null);
        if (url == null) {
            url = context.getSharedPreferences(GradeChangeWorker.PREFS, Context.MODE_PRIVATE)
                .getString("apiUrl", DEFAULT_API_URL);
        }
        return url;
    }

    // --- Listes JSON ---------------------------------------------------------------

    static JSONArray readArray(SharedPreferences prefs, String key) {
        try {
            return new JSONArray(prefs.getString(key, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    static List<Long> sentLog(Context context) {
        JSONArray array = readArray(prefs(context), KEY_SENT_LOG);
        List<Long> log = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) log.add(array.optLong(i));
        return log;
    }

    static void recordSend(Context context, long now) {
        List<Long> log = NotificationPolicy.recentSends(sentLog(context), now);
        log.add(now);
        JSONArray array = new JSONArray();
        for (Long at : log) array.put(at);
        prefs(context).edit().putString(KEY_SENT_LOG, array.toString()).apply();
    }

    /** Historique pour la boîte de réception (le plus récent en premier, 50 au plus). */
    static void addHistory(Context context, NotificationCandidate c, long now) {
        SharedPreferences prefs = prefs(context);
        JSONArray previous = readArray(prefs, KEY_HISTORY);
        JSONArray next = new JSONArray();
        try {
            next.put(new JSONObject()
                .put("key", c.key)
                .put("kind", c.kind)
                .put("appId", c.appId)
                .put("appName", c.appName)
                .put("title", c.title)
                .put("text", c.text)
                .put("priority", c.priority)
                .put("at", now));
        } catch (Exception e) {
            return;
        }
        for (int i = 0; i < previous.length() && next.length() < HISTORY_MAX; i++) {
            JSONObject item = previous.optJSONObject(i);
            if (item != null && !c.key.equals(item.optString("key"))) next.put(item);
        }
        prefs.edit().putString(KEY_HISTORY, next.toString()).apply();
    }

    static Set<String> muted(Context context) {
        return new HashSet<>(prefs(context).getStringSet(KEY_MUTED, new HashSet<>()));
    }

    static void mute(Context context, String appId) {
        Set<String> muted = muted(context);
        muted.add(appId);
        prefs(context).edit().putStringSet(KEY_MUTED, muted).apply();
    }

    static void unmuteAll(Context context) {
        prefs(context).edit().remove(KEY_MUTED).apply();
    }

    /** Migration vue terminée : remontée au web (consumeCompletedMigrations) pour la marquer comme faite. */
    static void addCompletedMigration(Context context, String appId, String appName, String altName) {
        SharedPreferences prefs = prefs(context);
        JSONArray list = readArray(prefs, KEY_COMPLETED);
        try {
            list.put(new JSONObject().put("appId", appId).put("appName", appName).put("altName", altName));
        } catch (Exception e) {
            return;
        }
        prefs.edit().putString(KEY_COMPLETED, list.toString()).apply();
    }

    static JSONArray takeCompletedMigrations(Context context) {
        SharedPreferences prefs = prefs(context);
        JSONArray list = readArray(prefs, KEY_COMPLETED);
        prefs.edit().remove(KEY_COMPLETED).apply();
        return list;
    }

    // --- Bilan mensuel -----------------------------------------------------------

    static void countForDigest(Context context, java.util.Map<String, Integer> add) {
        if (add.isEmpty()) return;
        SharedPreferences prefs = prefs(context);
        try {
            JSONObject counts = new JSONObject(prefs.getString(KEY_DIGEST_COUNTS, "{}"));
            for (java.util.Map.Entry<String, Integer> entry : add.entrySet()) {
                counts.put(entry.getKey(), counts.optInt(entry.getKey()) + entry.getValue());
            }
            prefs.edit().putString(KEY_DIGEST_COUNTS, counts.toString()).apply();
        } catch (Exception e) {
            // compteurs illisibles : on repart de zéro au prochain bilan
            prefs.edit().remove(KEY_DIGEST_COUNTS).apply();
        }
    }

    static JSONObject digestCounts(Context context) {
        try {
            return new JSONObject(prefs(context).getString(KEY_DIGEST_COUNTS, "{}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static void resetDigest(Context context, long now) {
        prefs(context).edit().remove(KEY_DIGEST_COUNTS).putLong(KEY_LAST_DIGEST_AT, now).apply();
    }

    // --- Réseau et dates ---------------------------------------------------------

    /** GET JSON public (aucune donnée personnelle dans l'adresse). */
    static JSONObject fetchJson(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) URI.create(url).toURL().openConnection();
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setRequestProperty("Accept", "application/json");
        try {
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) throw new Exception("HTTP " + connection.getResponseCode());
            StringBuilder body = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) body.append(line);
            }
            return new JSONObject(body.toString());
        } finally {
            connection.disconnect();
        }
    }

    private static SimpleDateFormat dayFormat() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return format;
    }

    static String isoDay(long time) {
        return dayFormat().format(new Date(time));
    }

    static long parseDay(String day, long fallback) {
        try {
            Date date = dayFormat().parse(day);
            return date != null ? date.getTime() : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }
}
