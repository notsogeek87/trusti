package eu.trusti.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Tâche périodique (toutes les ~12 h, avec réseau, même Trusti fermé) qui signale par
 * notification les changements de note des apps de « Mes Apps ».
 *
 * Elle lit l'API publique GET /apps?grade_changes_since=AAAA-MM-JJ, la même pour tout le
 * monde : la liste des apps suivies ne quitte jamais le téléphone, le tri est fait ici.
 * Garde-fous :
 *  - au premier passage, les changements déjà connus sont marqués comme vus (pas de rafale) ;
 *  - un changement n'est notifié qu'une fois (clé appId:date:note) ;
 *  - une seule notification par passage (résumé si plusieurs apps), entre 9 h et 21 h.
 * La logique de tri est la même que src/utils/gradeChanges.js (carte « Notes mises à jour »).
 */
public class GradeChangeWorker extends Worker {

    static final String PREFS = "trusti_grade_alerts";
    static final int NOTIFICATION_ID = 4202;

    private static final String WORK_NAME = "grade_change_alerts";
    private static final String CHANNEL_ID = "grade_changes";
    private static final String DEFAULT_API_URL = "https://trusti-alpha.vercel.app/api";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_API_URL = "apiUrl";
    private static final String KEY_TRACKED = "tracked";
    private static final String KEY_SEEN_AT = "seenAt";
    private static final String KEY_ACK = "ack";

    private static final long DAY_MS = TimeUnit.DAYS.toMillis(1);
    private static final int LOOKBACK_DAYS = 14;
    private static final int START_HOUR = 9;
    private static final int END_HOUR = 21;
    private static final int TIMEOUT_MS = 15000;

    public GradeChangeWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    /** trackedJson : [{ appId, appName }] des apps de « Mes Apps ». */
    static void saveState(Context context, boolean enabled, String apiUrl, String trackedJson) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean(KEY_ENABLED, enabled)
            .putString(KEY_TRACKED, trackedJson);
        if (apiUrl != null && apiUrl.startsWith("https://")) editor.putString(KEY_API_URL, apiUrl);
        editor.apply();
    }

    static void schedule(Context context) {
        Constraints constraints = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(GradeChangeWorker.class, 12, TimeUnit.HOURS)
            .setConstraints(constraints)
            .build();
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request);
    }

    static void cancel(Context context) {
        WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_ENABLED, false)) return Result.success();
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return Result.success();
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean firstRun = !prefs.contains(KEY_SEEN_AT);
        if (!firstRun && (hour < START_HOUR || hour >= END_HOUR)) return Result.success();

        long now = System.currentTimeMillis();
        String seenAt = prefs.getString(KEY_SEEN_AT, isoDay(now));
        String since = isoDay(parseDay(seenAt, now) - LOOKBACK_DAYS * DAY_MS);

        JSONArray changes;
        try {
            String apiUrl = prefs.getString(KEY_API_URL, DEFAULT_API_URL);
            changes = fetchChanges(apiUrl + "/apps?grade_changes_since=" + since);
        } catch (Exception e) {
            return Result.success(); // hors ligne ou API indisponible : prochain passage
        }

        Set<String> ack = new HashSet<>(prefs.getStringSet(KEY_ACK, new HashSet<>()));
        if (firstRun) {
            for (int i = 0; i < changes.length(); i++) ack.add(key(changes.optJSONObject(i)));
            saveSeen(prefs, now, ack);
            return Result.success();
        }

        Set<String> tracked = new HashSet<>();
        try {
            JSONArray list = new JSONArray(prefs.getString(KEY_TRACKED, "[]"));
            for (int i = 0; i < list.length(); i++) tracked.add(list.getJSONObject(i).optString("appId"));
        } catch (Exception e) {
            return Result.success();
        }

        List<JSONObject> pending = new ArrayList<>();
        for (int i = 0; i < changes.length(); i++) {
            JSONObject change = changes.optJSONObject(i);
            if (change == null) continue;
            String date = change.optString("date");
            if (!tracked.contains(change.optString("appId")) || date.compareTo(since) < 0) continue;
            if (change.optString("grade").equals(change.optString("previousGrade"))) continue;
            if (ack.contains(key(change))) continue;
            pending.add(change);
        }
        if (pending.isEmpty()) return Result.success();

        try {
            notify(context, pending);
        } catch (SecurityException e) {
            return Result.success(); // permission retirée : on retentera
        }
        for (JSONObject change : pending) ack.add(key(change));
        saveSeen(prefs, now, ack);
        return Result.success();
    }

    private static void saveSeen(SharedPreferences prefs, long now, Set<String> ack) {
        String seenAt = isoDay(now);
        String oldest = isoDay(now - LOOKBACK_DAYS * DAY_MS);
        Set<String> kept = new HashSet<>();
        for (String k : ack) {
            // clé « appId:AAAA-MM-JJ:G » : la date est juste avant la note
            if (k.length() >= 12 && k.substring(k.length() - 12, k.length() - 2).compareTo(oldest) >= 0) kept.add(k);
        }
        prefs.edit().putString(KEY_SEEN_AT, seenAt).putStringSet(KEY_ACK, kept).apply();
    }

    private static String key(JSONObject change) {
        if (change == null) return "";
        return change.optString("appId") + ":" + change.optString("date") + ":" + change.optString("grade");
    }

    private static JSONArray fetchChanges(String url) throws Exception {
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
            JSONArray changes = new JSONObject(body.toString()).optJSONArray("changes");
            return changes != null ? changes : new JSONArray();
        } finally {
            connection.disconnect();
        }
    }

    private static boolean isDown(JSONObject change) {
        // A < B < … < E : une lettre plus loin dans l'alphabet est une baisse.
        return change.optString("grade").compareTo(change.optString("previousGrade")) > 0;
    }

    private static void notify(Context context, List<JSONObject> pending) {
        createChannel(context);
        String title;
        String text;
        Intent open = new Intent(context, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        if (pending.size() == 1) {
            JSONObject change = pending.get(0);
            boolean down = isDown(change);
            title = change.optString("name") + (down ? " baisse : " : " progresse : ")
                + change.optString("previousGrade") + " → " + change.optString("grade");
            text = down
                ? "Sa note de respect de tes données a baissé. Ouvre Trusti pour voir pourquoi et les alternatives."
                : "Bonne nouvelle : sa note de respect de tes données s'est améliorée.";
            // Même ouverture que les suggestions : Trusti affiche directement la fiche de l'app.
            open.putExtra(AlternativeNudgeWorker.EXTRA_APP_ID, change.optString("appId"));
        } else {
            title = pending.size() + " de tes apps ont changé de note";
            StringBuilder lines = new StringBuilder();
            for (JSONObject change : pending) {
                if (lines.length() > 0) lines.append("\n");
                lines.append(change.optString("name")).append(" : ")
                    .append(change.optString("previousGrade")).append(" → ").append(change.optString("grade"));
            }
            text = lines.toString();
        }

        PendingIntent openIntent = PendingIntent.getActivity(
            context, NOTIFICATION_ID, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_trusti)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
    }

    private static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID, "Changements de note", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Quand la note d'une de tes apps change.");
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }

    private static SimpleDateFormat dayFormat() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return format;
    }

    private static String isoDay(long time) {
        return dayFormat().format(new Date(time));
    }

    private static long parseDay(String day, long fallback) {
        try {
            Date date = dayFormat().parse(day);
            return date != null ? date.getTime() : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }
}
