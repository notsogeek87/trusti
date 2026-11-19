package eu.trusti.app;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * Suggestions d'alternatives : préférences et réception des candidates calculées par le web
 * (src/utils/alternativeNudges.js). Le choix et l'envoi sont faits par le moteur unique
 * (NotificationEngineWorker, source NotificationSources.nudges).
 *
 * La classe reste une tâche WorkManager vide : une tâche déjà programmée sur un téléphone
 * par une version précédente doit encore pouvoir être instanciée, puis elle s'annule.
 */
public class AlternativeNudgeWorker extends Worker {

    static final String EXTRA_APP_ID = "eu.trusti.app.NUDGE_APP_ID";
    static final String PREFS = "trusti_alt_nudges";
    static final String KEY_DISMISSED = "dismissed";
    static final int NOTIFICATION_ID = 4201;

    private static final String LEGACY_WORK_NAME = "alternative_nudges";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_CANDIDATES = "candidates";
    private static final String KEY_FIRST_SYNC_AT = "firstSyncAt";

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

    @NonNull
    @Override
    public Result doWork() {
        WorkManager.getInstance(getApplicationContext()).cancelUniqueWork(LEGACY_WORK_NAME);
        return Result.success();
    }
}
