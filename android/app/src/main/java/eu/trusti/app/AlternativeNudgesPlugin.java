package eu.trusti.app;

import android.Manifest;
import android.content.Intent;
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
 * Suggestions d'alternatives par notification. Le web calcule les apps candidates (voir
 * src/utils/alternativeNudges.js) et les transmet via sync() ; elles sont gardées dans les
 * SharedPreferences et une tâche périodique WorkManager (AlternativeNudgeWorker) choisit,
 * même quand Trusti est fermé, s'il faut en proposer une. Aucune donnée ne quitte l'appareil.
 *
 * Toucher la notification rouvre Trusti avec l'id de l'app : consumeOpenRequest() le lit au
 * démarrage à froid, l'événement "openApp" le signale quand Trusti était déjà ouvert.
 */
@CapacitorPlugin(
    name = "AlternativeNudges",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications") }
)
public class AlternativeNudgesPlugin extends Plugin {

    private String pendingAppId;

    @Override
    public void load() {
        pendingAppId = takeAppId(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        String appId = takeAppId(intent);
        if (appId == null) return;
        if (hasListeners("openApp")) {
            notifyListeners("openApp", new JSObject().put("appId", appId));
        } else {
            pendingAppId = appId;
        }
    }

    @PluginMethod
    public void consumeOpenRequest(PluginCall call) {
        JSObject result = new JSObject();
        if (pendingAppId != null) result.put("appId", pendingAppId);
        pendingAppId = null;
        call.resolve(result);
    }

    @PluginMethod
    public void sync(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        JSArray candidates = call.getArray("candidates", new JSArray());
        AlternativeNudgeWorker.saveState(getContext(), enabled, candidates.toString());
        if (enabled) {
            AlternativeNudgeWorker.schedule(getContext());
        } else {
            AlternativeNudgeWorker.cancel(getContext());
        }
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

    // Lit puis retire l'id de l'intent, pour qu'une recréation de l'activité ne rouvre pas la fiche.
    private static String takeAppId(Intent intent) {
        if (intent == null) return null;
        String appId = intent.getStringExtra(AlternativeNudgeWorker.EXTRA_APP_ID);
        if (appId != null) intent.removeExtra(AlternativeNudgeWorker.EXTRA_APP_ID);
        return appId;
    }
}
