package eu.trusti.app;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * Alertes de changement de note : préférences (apps suivies, changements déjà vus). La lecture
 * de l'API et l'envoi sont faits par le moteur unique (NotificationEngineWorker, source
 * NotificationSources.grades). La liste des apps suivies sert aussi aux événements.
 *
 * La classe reste une tâche WorkManager vide : une tâche déjà programmée sur un téléphone
 * par une version précédente doit encore pouvoir être instanciée, puis elle s'annule.
 */
public class GradeChangeWorker extends Worker {

    static final String PREFS = "trusti_grade_alerts";
    static final int NOTIFICATION_ID = 4202;
    static final String KEY_ENABLED = "enabled";
    static final String KEY_TRACKED = "tracked";
    static final String KEY_SEEN_AT = "seenAt";
    static final String KEY_ACK = "ack";

    private static final String LEGACY_WORK_NAME = "grade_change_alerts";
    private static final String KEY_API_URL = "apiUrl";

    public GradeChangeWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    /** trackedJson : [{ appId }] des apps de « Mes Apps ». */
    static void saveState(Context context, boolean enabled, String apiUrl, String trackedJson) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean(KEY_ENABLED, enabled)
            .putString(KEY_TRACKED, trackedJson);
        if (apiUrl != null && apiUrl.startsWith("https://")) editor.putString(KEY_API_URL, apiUrl);
        editor.apply();
    }

    @NonNull
    @Override
    public Result doWork() {
        WorkManager.getInstance(getApplicationContext()).cancelUniqueWork(LEGACY_WORK_NAME);
        return Result.success();
    }
}
