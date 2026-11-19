package eu.trusti.app;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Pont entre le web et le moteur de notifications (NotificationEngineWorker, voir
 * docs/guides/notifications.md). Le web transmet ce qu'il sait (apps suivies, candidates de
 * suggestion, parcours de migration, réglages) ; tout est gardé dans les SharedPreferences et
 * la tâche de fond décide seule, même Trusti fermé, quoi notifier. Aucune donnée ne quitte l'appareil.
 *
 *  - sync() : suggestions d'alternatives (calculées par src/utils/alternativeNudges.js) ;
 *  - syncGradeAlerts() : apps suivies et réglage « Changements de note » ;
 *  - syncEngine() : événements, apps à risque installées, migrations, mode bilan ;
 *  - getNotificationState() / consumeCompletedMigrations() / unmuteAll() : lus par la boîte de
 *    réception et les réglages.
 *
 * Toucher une notification rouvre Trusti avec l'id de l'app (et une action éventuelle) :
 * consumeOpenRequest() le lit au démarrage à froid, l'événement "openApp" le signale quand
 * Trusti était déjà ouvert.
 */
@CapacitorPlugin(
    name = "AlternativeNudges",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications") }
)
public class AlternativeNudgesPlugin extends Plugin {

    private JSObject pendingOpen;

    @Override
    public void load() {
        pendingOpen = takeOpenRequest(getActivity().getIntent());
        // Bascule des anciennes tâches séparées vers le moteur unique (mise à jour de l'app).
        NotificationEngineWorker.reschedule(getContext());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        JSObject request = takeOpenRequest(intent);
        if (request == null) return;
        if (hasListeners("openApp")) {
            notifyListeners("openApp", request);
        } else {
            pendingOpen = request;
        }
    }

    @PluginMethod
    public void consumeOpenRequest(PluginCall call) {
        JSObject result = pendingOpen != null ? pendingOpen : new JSObject();
        pendingOpen = null;
        call.resolve(result);
    }

    @PluginMethod
    public void sync(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        JSArray candidates = call.getArray("candidates", new JSArray());
        AlternativeNudgeWorker.saveState(getContext(), enabled, candidates.toString());
        NotificationEngineWorker.reschedule(getContext());
        call.resolve();
    }

    /**
     * Alertes de changement de note (GradeChangeWorker) : { enabled, apiUrl, apps: [{ appId, appName }] }.
     * Les apps suivies restent sur le téléphone ; le worker lit une liste publique de changements.
     */
    @PluginMethod
    public void syncGradeAlerts(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        JSArray apps = call.getArray("apps", new JSArray());
        GradeChangeWorker.saveState(getContext(), enabled, call.getString("apiUrl"), apps.toString());
        NotificationEngineWorker.reschedule(getContext());
        call.resolve();
    }

    /**
     * Réglages du moteur : { apiUrl, eventsEnabled, installAlertsEnabled, migrationRemindersEnabled,
     * digestEnabled, migrations? }. Sans migrations, la dernière liste reçue est gardée.
     */
    @PluginMethod
    public void syncEngine(PluginCall call) {
        SharedPreferences prefs = NotificationStore.prefs(getContext());
        boolean digest = Boolean.TRUE.equals(call.getBoolean("digestEnabled", false));
        SharedPreferences.Editor editor = prefs.edit()
            .putBoolean(NotificationStore.KEY_EVENTS_ENABLED, Boolean.TRUE.equals(call.getBoolean("eventsEnabled", true)))
            .putBoolean(NotificationStore.KEY_INSTALLS_ENABLED, Boolean.TRUE.equals(call.getBoolean("installAlertsEnabled", true)))
            .putBoolean(NotificationStore.KEY_MIGRATIONS_ENABLED, Boolean.TRUE.equals(call.getBoolean("migrationRemindersEnabled", true)))
            .putBoolean(NotificationStore.KEY_DIGEST_ENABLED, digest);
        // Le premier bilan arrive 30 jours après l'activation du mode bilan.
        if (digest && !prefs.getBoolean(NotificationStore.KEY_DIGEST_ENABLED, false)) {
            editor.putLong(NotificationStore.KEY_DIGEST_ENABLED_AT, System.currentTimeMillis());
        }
        String apiUrl = call.getString("apiUrl");
        if (apiUrl != null && apiUrl.startsWith("https://")) editor.putString(NotificationStore.KEY_API_URL, apiUrl);
        JSArray migrations = call.getArray("migrations", null);
        if (migrations != null) editor.putString(NotificationStore.KEY_MIGRATIONS, migrations.toString());
        editor.apply();
        NotificationEngineWorker.reschedule(getContext());
        call.resolve();
    }

    /** Historique des notifications envoyées (boîte de réception) et apps en sourdine. */
    @PluginMethod
    public void getNotificationState(PluginCall call) {
        JSObject result = new JSObject();
        try {
            result.put("history", new JSArray(NotificationStore.readArray(NotificationStore.prefs(getContext()), NotificationStore.KEY_HISTORY).toString()));
        } catch (Exception e) {
            result.put("history", new JSArray());
        }
        JSArray muted = new JSArray();
        for (String appId : NotificationStore.muted(getContext())) muted.put(appId);
        result.put("muted", muted);
        call.resolve(result);
    }

    /** Migrations vues terminées par le téléphone, à marquer comme faites côté web (lues une fois). */
    @PluginMethod
    public void consumeCompletedMigrations(PluginCall call) {
        JSObject result = new JSObject();
        try {
            result.put("items", new JSArray(NotificationStore.takeCompletedMigrations(getContext()).toString()));
        } catch (Exception e) {
            result.put("items", new JSArray());
        }
        call.resolve(result);
    }

    @PluginMethod
    public void unmuteAll(PluginCall call) {
        NotificationStore.unmuteAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        call.resolve(permissionResult());
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        // Avant Android 13, pas de permission à demander : les notifications sont autorisées
        // sauf si l'utilisateur les a coupées dans les réglages.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || getPermissionState("notifications") == PermissionState.GRANTED) {
            call.resolve(permissionResult());
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        call.resolve(permissionResult());
    }

    private JSObject permissionResult() {
        String display;
        if (NotificationManagerCompat.from(getContext()).areNotificationsEnabled()) {
            display = "granted";
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState("notifications") != PermissionState.DENIED) {
            display = "prompt";
        } else {
            display = "denied";
        }
        return new JSObject().put("display", display);
    }

    // Lit puis retire l'id (et l'action) de l'intent, pour qu'une recréation de l'activité ne
    // rouvre pas la fiche.
    private static JSObject takeOpenRequest(Intent intent) {
        if (intent == null) return null;
        String appId = intent.getStringExtra(NotificationEngineWorker.EXTRA_APP_ID);
        String action = intent.getStringExtra(NotificationEngineWorker.EXTRA_ACTION);
        intent.removeExtra(NotificationEngineWorker.EXTRA_APP_ID);
        intent.removeExtra(NotificationEngineWorker.EXTRA_ACTION);
        if (appId == null) return null;
        JSObject request = new JSObject().put("appId", appId);
        if (action != null) request.put("action", action);
        return request;
    }
}
