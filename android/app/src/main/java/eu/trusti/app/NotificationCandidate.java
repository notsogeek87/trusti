package eu.trusti.app;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Une notification que le moteur pourrait envoyer à ce passage (voir NotificationSources).
 * Elle n'est marquée comme traitée (onConsumed) que si elle est envoyée ou comptée dans le
 * bilan : sinon elle sera reproposée au passage suivant.
 */
final class NotificationCandidate implements NotificationPolicy.Ranked {

    /** Types, repris tels quels dans l'historique lu par la boîte de réception (web). */
    static final String KIND_EVENT = "event";
    static final String KIND_GRADE = "grade";
    static final String KIND_INSTALL = "install";
    static final String KIND_MIGRATION = "migration";
    static final String KIND_MIGRATION_ALT_INSTALLED = "migrationAltInstalled";
    static final String KIND_MIGRATION_DONE = "migrationDone";
    static final String KIND_NUDGE = "nudge";
    static final String KIND_DIGEST = "digest";

    /** Bouton d'action d'une notification. */
    static final class Action {
        static final String OPEN = "open";
        static final String MUTE = "mute";
        static final String DISMISS_NUDGE = "dismissNudge";

        final int labelRes;
        final String type;
        /** Pour OPEN : null, "resumeMigration" ou "add" (voir App.jsx, pendingOpen). */
        final String openAction;

        Action(int labelRes, String type, String openAction) {
            this.labelRes = labelRes;
            this.type = type;
            this.openAction = openAction;
        }
    }

    /** Ce qu'il faut enregistrer une fois la candidate envoyée ou comptée dans le bilan. */
    interface OnConsumed {
        void run();
    }

    final String key;
    final String kind;
    final String channel;
    final int notificationId;
    final int priority;
    final boolean critical;
    final String appId;
    final String appName;
    final String title;
    final String text;
    /** Ouverture au toucher : null, "resumeMigration" ou "add". */
    String openAction;
    /** Compteurs du bilan mensuel (gradeDown, gradeUp, eventsNegative, eventsPositive, risky, migrationsDone). */
    final Map<String, Integer> digest = new LinkedHashMap<>();
    final List<Action> actions = new ArrayList<>();
    OnConsumed onConsumed;

    NotificationCandidate(String key, String kind, String channel, int notificationId, int priority, boolean critical,
                          String appId, String appName, String title, String text) {
        this.key = key;
        this.kind = kind;
        this.channel = channel;
        this.notificationId = notificationId;
        this.priority = priority;
        this.critical = critical;
        this.appId = appId;
        this.appName = appName;
        this.title = title;
        this.text = text;
    }

    NotificationCandidate action(int labelRes, String type, String openAction) {
        actions.add(new Action(labelRes, type, openAction));
        return this;
    }

    NotificationCandidate count(String category) {
        if (category != null) {
            Integer current = digest.get(category);
            digest.put(category, current == null ? 1 : current + 1);
        }
        return this;
    }

    @Override
    public int priority() {
        return priority;
    }

    @Override
    public boolean critical() {
        return critical;
    }
}
