package eu.trusti.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Tâche périodique (toutes les ~8 h, même Trusti fermé) qui propose au plus une alternative par
 * notification. Garde-fous anti-spam :
 *  - rien pendant les 3 jours qui suivent la première synchronisation ;
 *  - au plus une notification tous les 7 jours, entre 10 h et 20 h ;
 *  - la même app jamais deux fois en moins de 30 jours ;
 *  - jamais une app que l'utilisateur a écartée (« Ne plus proposer ») ou qui n'est plus installée.
 * Les candidates arrivent déjà triées de la plus urgente à la moins urgente (voir
 * src/utils/alternativeNudges.js) : on prend la première qui passe ces filtres.
 */
public class AlternativeNudgeWorker extends Worker {

    static final String EXTRA_APP_ID = "eu.trusti.app.NUDGE_APP_ID";
    static final String PREFS = "trusti_alt_nudges";
    static final String KEY_DISMISSED = "dismissed";
    static final int NOTIFICATION_ID = 4201;

    private static final String WORK_NAME = "alternative_nudges";
    private static final String CHANNEL_ID = "alternatives";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_CANDIDATES = "candidates";
    private static final String KEY_FIRST_SYNC_AT = "firstSyncAt";
    private static final String KEY_LAST_NOTIFIED_AT = "lastNotifiedAt";
    private static final String KEY_PROPOSED_PREFIX = "proposed_";

    private static final long DAY_MS = TimeUnit.DAYS.toMillis(1);
    private static final long FIRST_DELAY_MS = 3 * DAY_MS;
    private static final long MIN_INTERVAL_MS = 7 * DAY_MS;
    private static final long SAME_APP_COOLDOWN_MS = 30 * DAY_MS;
    private static final int START_HOUR = 10;
    private static final int END_HOUR = 20;

    public AlternativeNudgeWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    static void saveState(Context context, boolean enabled, String candidatesJson) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit()
            .putBoolean(KEY_ENABLED, enabled)
            .putString(KEY_CANDIDATES, candidatesJson);
        if (!prefs.contains(KEY_FIRST_SYNC_AT)) editor.putLong(KEY_FIRST_SYNC_AT, System.currentTimeMillis());
        editor.apply();
    }

    static void schedule(Context context) {
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(AlternativeNudgeWorker.class, 8, TimeUnit.HOURS).build();
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
        long now = System.currentTimeMillis();

        if (!prefs.getBoolean(KEY_ENABLED, false)) return Result.success();
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return Result.success();
        if (now - prefs.getLong(KEY_FIRST_SYNC_AT, now) < FIRST_DELAY_MS) return Result.success();
        if (now - prefs.getLong(KEY_LAST_NOTIFIED_AT, 0) < MIN_INTERVAL_MS) return Result.success();
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (hour < START_HOUR || hour >= END_HOUR) return Result.success();

        JSONObject candidate = pickCandidate(context, prefs, now);
        if (candidate == null) return Result.success();

        String appId = candidate.optString("appId");
        try {
            notify(context, candidate);
        } catch (SecurityException e) {
            // Permission retirée entre-temps : on retentera au prochain passage.
            return Result.success();
        }
        prefs.edit()
            .putLong(KEY_LAST_NOTIFIED_AT, now)
            .putLong(KEY_PROPOSED_PREFIX + appId, now)
            .apply();
        return Result.success();
    }

    private static JSONObject pickCandidate(Context context, SharedPreferences prefs, long now) {
        Set<String> dismissed = prefs.getStringSet(KEY_DISMISSED, new HashSet<>());
        PackageManager pm = context.getPackageManager();
        try {
            JSONArray candidates = new JSONArray(prefs.getString(KEY_CANDIDATES, "[]"));
            for (int i = 0; i < candidates.length(); i++) {
                JSONObject candidate = candidates.getJSONObject(i);
                String appId = candidate.optString("appId");
                if (appId.isEmpty() || dismissed.contains(appId)) continue;
                if (now - prefs.getLong(KEY_PROPOSED_PREFIX + appId, 0) < SAME_APP_COOLDOWN_MS) continue;
                try {
                    pm.getPackageInfo(candidate.optString("packageName"), 0);
                } catch (PackageManager.NameNotFoundException e) {
                    continue; // désinstallée depuis la dernière synchronisation
                }
                return candidate;
            }
        } catch (Exception e) {
            // Candidates illisibles : rien à proposer jusqu'à la prochaine synchronisation.
        }
        return null;
    }

    private static void notify(Context context, JSONObject candidate) {
        createChannel(context);
        String appId = candidate.optString("appId");
        String title = candidate.optString("appName") + " est noté " + candidate.optString("appGrade");
        String text = candidate.optString("altName") + " (" + candidate.optString("altGrade")
            + ") fait la même chose et respecte mieux tes données. Tu veux voir ?";

        Intent open = new Intent(context, MainActivity.class)
            .putExtra(EXTRA_APP_ID, appId)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openIntent = PendingIntent.getActivity(
            context, appId.hashCode(), open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent dismiss = new Intent(context, AlternativeNudgeDismissReceiver.class).putExtra(EXTRA_APP_ID, appId);
        PendingIntent dismissIntent = PendingIntent.getBroadcast(
            context, appId.hashCode(), dismiss, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_trusti)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .addAction(0, "Voir l'alternative", openIntent)
            .addAction(0, "Ne plus proposer", dismissIntent);

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
    }

    private static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID, "Suggestions d'alternatives", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("De temps en temps, une alternative mieux notée à une de tes apps.");
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }
}
