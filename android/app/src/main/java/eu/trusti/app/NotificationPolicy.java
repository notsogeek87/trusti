package eu.trusti.app;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Règles du moteur de notifications (NotificationEngineWorker), sans dépendance Android :
 * testées dans src/test/java/eu/trusti/app/NotificationPolicyTest.java.
 *
 * Barème de priorité identique à src/utils/notificationInbox.js (PRIORITY) : le garder aligné.
 *  - une alerte critique (fuite / faille grave d'une app suivie) passe toujours, même budget épuisé
 *    ou mode bilan actif ;
 *  - les autres se partagent un budget de MAX_PER_WEEK notifications sur 7 jours glissants ;
 *  - une seule notification par passage, entre START_HOUR et END_HOUR ;
 *  - en mode bilan, les non critiques sont regroupées dans un bilan tous les DIGEST_INTERVAL_DAYS.
 */
public final class NotificationPolicy {

    public static final int EVENT_CRITICAL = 100;
    public static final int EVENT_NEGATIVE = 80;
    public static final int GRADE_DOWN = 70;
    public static final int INSTALL_RISKY = 60;
    public static final int EVENT_NEGATIVE_LOW = 50;
    public static final int MIGRATION_ALT_INSTALLED = 45;
    public static final int MIGRATION_REMINDER = 40;
    public static final int MIGRATION_DONE = 35;
    public static final int EVENT_POSITIVE = 30;
    public static final int GRADE_UP = 30;
    public static final int EVENT_NEUTRAL = 20;
    public static final int NUDGE = 10;

    public static final int MAX_PER_WEEK = 2;
    public static final int START_HOUR = 9;
    public static final int END_HOUR = 21;
    public static final int DIGEST_INTERVAL_DAYS = 30;
    public static final int MIGRATION_REMINDER_DAYS = 5;
    /** Un événement publié il y a plus longtemps n'est plus poussé (il reste dans la boîte de réception). */
    public static final int EVENT_MAX_AGE_DAYS = 30;

    static final long DAY_MS = TimeUnit.DAYS.toMillis(1);
    static final long WEEK_MS = 7 * DAY_MS;

    private NotificationPolicy() {}

    /** Ce que le moteur doit faire d'une candidate à ce passage. */
    public enum Decision { SEND, DIGEST, WAIT }

    /** Une notification possible, réduite à ce qui compte pour les règles. */
    public interface Ranked {
        int priority();
        boolean critical();
    }

    public static int eventPriority(String impact, String severity) {
        if ("negative".equals(impact)) {
            if ("high".equals(severity)) return EVENT_CRITICAL;
            return "low".equals(severity) ? EVENT_NEGATIVE_LOW : EVENT_NEGATIVE;
        }
        return "positive".equals(impact) ? EVENT_POSITIVE : EVENT_NEUTRAL;
    }

    public static boolean isCriticalEvent(String impact, String severity) {
        return "negative".equals(impact) && "high".equals(severity);
    }

    public static boolean isActiveHour(int hour) {
        return hour >= START_HOUR && hour < END_HOUR;
    }

    public static boolean isActiveHour(Calendar calendar) {
        return isActiveHour(calendar.get(Calendar.HOUR_OF_DAY));
    }

    /** Envois des 7 derniers jours (les plus anciens sont oubliés). */
    public static List<Long> recentSends(List<Long> sentLog, long now) {
        List<Long> recent = new ArrayList<>();
        for (Long at : sentLog) {
            if (at != null && now - at < WEEK_MS && at <= now) recent.add(at);
        }
        return recent;
    }

    public static boolean budgetLeft(List<Long> sentLog, long now) {
        return recentSends(sentLog, now).size() < MAX_PER_WEEK;
    }

    /**
     * Décision pour chaque candidate, dans l'ordre de priorité décroissante (la liste est triée
     * en place). Au plus une SEND par passage ; en mode bilan, les non critiques passent en DIGEST.
     */
    public static <T extends Ranked> List<Decision> decide(List<T> candidates, List<Long> sentLog, long now, boolean digestMode) {
        Collections.sort(candidates, (a, b) -> {
            if (a.critical() != b.critical()) return a.critical() ? -1 : 1;
            return Integer.compare(b.priority(), a.priority());
        });
        boolean sent = false;
        boolean budget = budgetLeft(sentLog, now);
        List<Decision> decisions = new ArrayList<>();
        for (T candidate : candidates) {
            if (candidate.critical()) {
                decisions.add(sent ? Decision.WAIT : Decision.SEND);
                sent = true;
            } else if (digestMode) {
                decisions.add(Decision.DIGEST);
            } else if (!sent && budget) {
                decisions.add(Decision.SEND);
                sent = true;
            } else {
                decisions.add(Decision.WAIT);
            }
        }
        return decisions;
    }

    /** Bilan dû : DIGEST_INTERVAL_DAYS après le dernier bilan, ou après l'activation du mode bilan. */
    public static boolean digestDue(long lastDigestAt, long digestEnabledAt, long now) {
        long from = Math.max(lastDigestAt, digestEnabledAt);
        return from > 0 && now - from >= DIGEST_INTERVAL_DAYS * DAY_MS;
    }

    /** Relance d'une migration : aucun progrès depuis MIGRATION_REMINDER_DAYS. */
    public static boolean migrationStale(long updatedAt, long now) {
        return updatedAt > 0 && now - updatedAt >= MIGRATION_REMINDER_DAYS * DAY_MS;
    }
}
