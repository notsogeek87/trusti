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
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.json.JSONObject;

/**
 * Moteur de notifications unique (toutes les ~6 h, même Trusti fermé). Il remplace les deux
 * tâches séparées d'avant (AlternativeNudgeWorker, GradeChangeWorker), qui pouvaient notifier
 * le même jour sans se concerter.
 *
 * À chaque passage :
 *  1. chaque source propose ses candidates (NotificationSources : événements, notes, apps à
 *     risque installées, migrations, suggestions) ;
 *  2. les apps mises en sourdine sont écartées ;
 *  3. NotificationPolicy décide : une alerte critique passe toujours ; sinon au plus
 *     2 notifications par semaine, une par passage, entre 9 h et 21 h ; en mode bilan, tout ce
 *     qui n'est pas critique est regroupé dans un bilan tous les 30 jours ;
 *  4. ce qui est envoyé ou compté dans le bilan entre dans l'historique lu par la boîte de
 *     réception du web ; le reste sera reproposé au passage suivant.
 * Voir docs/guides/notifications.md.
 */
public class NotificationEngineWorker extends Worker {

    static final String EXTRA_APP_ID = AlternativeNudgeWorker.EXTRA_APP_ID;
    static final String EXTRA_ACTION = "eu.trusti.app.NOTIF_ACTION";

    private static final String WORK_NAME = "notification_engine";
    private static final String[] LEGACY_WORK_NAMES = { "alternative_nudges", "grade_change_alerts" };
    private static final int PERIOD_HOURS = 6;

    public NotificationEngineWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    /** Programme le moteur si au moins un type de notification est actif, l'annule sinon. */
    static void reschedule(Context context) {
        WorkManager workManager = WorkManager.getInstance(context);
        for (String legacy : LEGACY_WORK_NAMES) workManager.cancelUniqueWork(legacy);
        if (anyEnabled(context)) {
            PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(NotificationEngineWorker.class, PERIOD_HOURS, TimeUnit.HOURS).build();
            workManager.enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request);
        } else {
            workManager.cancelUniqueWork(WORK_NAME);
        }
    }

    static boolean anyEnabled(Context context) {
        SharedPreferences engine = NotificationStore.prefs(context);
        return context.getSharedPreferences(AlternativeNudgeWorker.PREFS, Context.MODE_PRIVATE).getBoolean("enabled", false)
            || context.getSharedPreferences(GradeChangeWorker.PREFS, Context.MODE_PRIVATE).getBoolean(GradeChangeWorker.KEY_ENABLED, false)
            || engine.getBoolean(NotificationStore.KEY_EVENTS_ENABLED, false)
            || engine.getBoolean(NotificationStore.KEY_INSTALLS_ENABLED, false)
            || engine.getBoolean(NotificationStore.KEY_MIGRATIONS_ENABLED, false);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        long now = System.currentTimeMillis();
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return Result.success();
        if (!NotificationPolicy.isActiveHour(Calendar.getInstance())) return Result.success();

        SharedPreferences engine = NotificationStore.prefs(context);
        boolean digestMode = engine.getBoolean(NotificationStore.KEY_DIGEST_ENABLED, false);
        Set<String> tracked = NotificationSources.trackedAppIds(context);

        List<NotificationCandidate> candidates = new ArrayList<>();
        candidates.addAll(NotificationSources.events(context, tracked, now));
        candidates.addAll(NotificationSources.grades(context, tracked, now));
        candidates.addAll(NotificationSources.installs(context, tracked, now));
        candidates.addAll(NotificationSources.migrations(context, now));
        // En mode bilan, une suggestion n'a pas sa place dans le résumé du mois.
        if (!digestMode) candidates.addAll(NotificationSources.nudges(context, now));

        Set<String> muted = NotificationStore.muted(context);
        for (Iterator<NotificationCandidate> it = candidates.iterator(); it.hasNext(); ) {
            NotificationCandidate c = it.next();
            if (c.appId != null && muted.contains(c.appId)) {
                it.remove();
                if (c.onConsumed != null) c.onConsumed.run(); // en sourdine : vu, jamais reproposé
            }
        }

        List<NotificationPolicy.Decision> decisions =
            NotificationPolicy.decide(candidates, NotificationStore.sentLog(context), now, digestMode);
        boolean sent = false;
        for (int i = 0; i < candidates.size(); i++) {
            NotificationCandidate c = candidates.get(i);
            NotificationPolicy.Decision decision = decisions.get(i);
            if (decision == NotificationPolicy.Decision.WAIT) continue;
            if (decision == NotificationPolicy.Decision.SEND) {
                try {
                    show(context, c);
                } catch (SecurityException e) {
                    continue; // permission retirée entre-temps : on retentera
                }
                NotificationStore.recordSend(context, now);
                sent = true;
            } else {
                NotificationStore.countForDigest(context, c.digest);
            }
            NotificationStore.addHistory(context, c, now);
            if (c.onConsumed != null) c.onConsumed.run();
        }

        if (digestMode && !sent) sendDigestIfDue(context, engine, now);
        return Result.success();
    }

    private static void sendDigestIfDue(Context context, SharedPreferences engine, long now) {
        long lastDigestAt = engine.getLong(NotificationStore.KEY_LAST_DIGEST_AT, 0);
        long enabledAt = engine.getLong(NotificationStore.KEY_DIGEST_ENABLED_AT, 0);
        if (!NotificationPolicy.digestDue(lastDigestAt, enabledAt, now)) return;

        JSONObject counts = NotificationStore.digestCounts(context);
        StringBuilder lines = new StringBuilder();
        appendLine(lines, context, R.string.notif_digest_grade_down, counts.optInt("gradeDown"));
        appendLine(lines, context, R.string.notif_digest_events_negative, counts.optInt("eventsNegative"));
        appendLine(lines, context, R.string.notif_digest_risky, counts.optInt("risky"));
        appendLine(lines, context, R.string.notif_digest_grade_up, counts.optInt("gradeUp"));
        appendLine(lines, context, R.string.notif_digest_events_positive, counts.optInt("eventsPositive"));
        appendLine(lines, context, R.string.notif_digest_migrations_done, counts.optInt("migrationsDone"));
        if (lines.length() == 0) {
            // Rien à résumer ce mois-ci : pas de notification, on repart pour 30 jours.
            NotificationStore.resetDigest(context, now);
            return;
        }
        lines.append("\n").append(context.getString(R.string.notif_digest_more));

        NotificationCandidate digest = new NotificationCandidate(
            "digest:" + NotificationStore.isoDay(now), NotificationCandidate.KIND_DIGEST, NotificationSources.CHANNEL_DIGEST,
            NotificationSources.ID_DIGEST, 0, false, null, null,
            context.getString(R.string.notif_digest_title), lines.toString());
        try {
            show(context, digest);
        } catch (SecurityException e) {
            return;
        }
        NotificationStore.recordSend(context, now);
        NotificationStore.addHistory(context, digest, now);
        NotificationStore.resetDigest(context, now);
    }

    private static void appendLine(StringBuilder lines, Context context, int res, int count) {
        if (count <= 0) return;
        if (lines.length() > 0) lines.append("\n");
        lines.append(context.getString(res, count));
    }

    // --- Affichage ---------------------------------------------------------------

    private static void show(Context context, NotificationCandidate c) {
        createChannels(context);
        PendingIntent contentIntent = openIntent(context, c, c.openAction, 0);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, c.channel)
            .setSmallIcon(R.drawable.ic_stat_trusti)
            .setContentTitle(c.title)
            .setContentText(c.text)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(c.text))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setPriority(c.critical ? NotificationCompat.PRIORITY_HIGH : NotificationCompat.PRIORITY_DEFAULT);

        int index = 1;
        for (NotificationCandidate.Action action : c.actions) {
            PendingIntent intent;
            if (NotificationCandidate.Action.OPEN.equals(action.type)) {
                intent = openIntent(context, c, action.openAction, index);
            } else {
                Intent broadcast = new Intent(context, NotificationActionReceiver.class)
                    .setAction(action.type)
                    .putExtra(EXTRA_APP_ID, c.appId)
                    .putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, c.notificationId);
                intent = PendingIntent.getBroadcast(context, requestCode(c, index), broadcast,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            }
            builder.addAction(0, context.getString(action.labelRes), intent);
            index++;
        }
        NotificationManagerCompat.from(context).notify(c.notificationId, builder.build());
    }

    /** Ouvre Trusti ; avec un appId, sur la fiche de l'app (voir AlternativeNudgesPlugin.takeOpenRequest). */
    private static PendingIntent openIntent(Context context, NotificationCandidate c, String openAction, int index) {
        Intent open = new Intent(context, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (c.appId != null) open.putExtra(EXTRA_APP_ID, c.appId);
        if (openAction != null) open.putExtra(EXTRA_ACTION, openAction);
        return PendingIntent.getActivity(context, requestCode(c, index), open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Un code distinct par bouton : sinon Android réutilise le même PendingIntent pour tous.
    private static int requestCode(NotificationCandidate c, int index) {
        return c.notificationId * 16 + index;
    }

    static void createChannels(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_EVENTS,
            R.string.channel_events_name, R.string.channel_events_desc, NotificationManager.IMPORTANCE_HIGH));
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_GRADES,
            R.string.channel_grades_name, R.string.channel_grades_desc, NotificationManager.IMPORTANCE_DEFAULT));
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_INSTALLS,
            R.string.channel_installs_name, R.string.channel_installs_desc, NotificationManager.IMPORTANCE_DEFAULT));
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_MIGRATIONS,
            R.string.channel_migrations_name, R.string.channel_migrations_desc, NotificationManager.IMPORTANCE_DEFAULT));
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_NUDGES,
            R.string.channel_nudges_name, R.string.channel_nudges_desc, NotificationManager.IMPORTANCE_DEFAULT));
        manager.createNotificationChannel(channel(context, NotificationSources.CHANNEL_DIGEST,
            R.string.channel_digest_name, R.string.channel_digest_desc, NotificationManager.IMPORTANCE_LOW));
    }

    private static NotificationChannel channel(Context context, String id, int name, int desc, int importance) {
        NotificationChannel channel = new NotificationChannel(id, context.getString(name), importance);
        channel.setDescription(context.getString(desc));
        return channel;
    }
}
