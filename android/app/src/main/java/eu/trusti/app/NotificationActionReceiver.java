package eu.trusti.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.core.app.NotificationManagerCompat;
import java.util.HashSet;
import java.util.Set;

/**
 * Boutons d'une notification du moteur qui n'ouvrent pas Trusti :
 *  - "mute" (« Ne plus m'alerter pour cette app », « Ignorer ») : l'app est mise en sourdine,
 *    plus aucune notification la concernant (réactivable dans Espace de stockage > Notifications) ;
 *  - "dismissNudge" (« Ne plus proposer ») : la suggestion d'alternative est écartée pour de bon.
 * La notification est retirée dans les deux cas.
 */
public class NotificationActionReceiver extends BroadcastReceiver {

    static final String EXTRA_NOTIFICATION_ID = "eu.trusti.app.NOTIFICATION_ID";

    @Override
    public void onReceive(Context context, Intent intent) {
        String appId = intent.getStringExtra(NotificationEngineWorker.EXTRA_APP_ID);
        String action = intent.getAction();
        if (appId != null && NotificationCandidate.Action.MUTE.equals(action)) {
            NotificationStore.mute(context, appId);
        } else if (appId != null && NotificationCandidate.Action.DISMISS_NUDGE.equals(action)) {
            SharedPreferences prefs = context.getSharedPreferences(AlternativeNudgeWorker.PREFS, Context.MODE_PRIVATE);
            Set<String> dismissed = new HashSet<>(prefs.getStringSet(AlternativeNudgeWorker.KEY_DISMISSED, new HashSet<>()));
            dismissed.add(appId);
            prefs.edit().putStringSet(AlternativeNudgeWorker.KEY_DISMISSED, dismissed).apply();
        }
        int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1);
        if (notificationId != -1) NotificationManagerCompat.from(context).cancel(notificationId);
    }
}
