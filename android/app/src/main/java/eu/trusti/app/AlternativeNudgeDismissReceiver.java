package eu.trusti.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.core.app.NotificationManagerCompat;
import java.util.HashSet;
import java.util.Set;

/**
 * Action « Ne plus proposer » d'une notification de suggestion : l'app est écartée pour de bon
 * (voir AlternativeNudgeWorker.pickCandidate) et la notification est retirée.
 */
public class AlternativeNudgeDismissReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String appId = intent.getStringExtra(AlternativeNudgeWorker.EXTRA_APP_ID);
        if (appId != null) {
            SharedPreferences prefs = context.getSharedPreferences(AlternativeNudgeWorker.PREFS, Context.MODE_PRIVATE);
            Set<String> dismissed = new HashSet<>(prefs.getStringSet(AlternativeNudgeWorker.KEY_DISMISSED, new HashSet<>()));
            dismissed.add(appId);
            prefs.edit().putStringSet(AlternativeNudgeWorker.KEY_DISMISSED, dismissed).apply();
        }
        NotificationManagerCompat.from(context).cancel(AlternativeNudgeWorker.NOTIFICATION_ID);
    }
}
