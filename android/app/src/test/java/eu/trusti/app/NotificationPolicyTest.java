package eu.trusti.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

/** Règles du moteur de notifications (NotificationPolicy). */
public class NotificationPolicyTest {

    private static final long DAY = NotificationPolicy.DAY_MS;
    private static final long NOW = 1_800_000_000_000L;

    private static final class C implements NotificationPolicy.Ranked {
        final String name;
        final int priority;
        final boolean critical;

        C(String name, int priority, boolean critical) {
            this.name = name;
            this.priority = priority;
            this.critical = critical;
        }

        @Override public int priority() { return priority; }
        @Override public boolean critical() { return critical; }
    }

    private static List<C> list(C... items) {
        return new ArrayList<>(Arrays.asList(items));
    }

    @Test
    public void barèmeDesÉvénements() {
        assertEquals(NotificationPolicy.EVENT_CRITICAL, NotificationPolicy.eventPriority("negative", "high"));
        assertEquals(NotificationPolicy.EVENT_NEGATIVE, NotificationPolicy.eventPriority("negative", "medium"));
        assertEquals(NotificationPolicy.EVENT_NEGATIVE_LOW, NotificationPolicy.eventPriority("negative", "low"));
        assertEquals(NotificationPolicy.EVENT_POSITIVE, NotificationPolicy.eventPriority("positive", "high"));
        assertEquals(NotificationPolicy.EVENT_NEUTRAL, NotificationPolicy.eventPriority("neutral", "medium"));
        assertTrue(NotificationPolicy.isCriticalEvent("negative", "high"));
        assertFalse(NotificationPolicy.isCriticalEvent("positive", "high"));
    }

    @Test
    public void uneSeuleNotificationParPassageLaPlusPrioritaire() {
        List<C> candidates = list(new C("nudge", NotificationPolicy.NUDGE, false), new C("grade", NotificationPolicy.GRADE_DOWN, false));
        List<NotificationPolicy.Decision> d = NotificationPolicy.decide(candidates, Collections.emptyList(), NOW, false);
        assertEquals("grade", candidates.get(0).name);
        assertEquals(Arrays.asList(NotificationPolicy.Decision.SEND, NotificationPolicy.Decision.WAIT), d);
    }

    @Test
    public void budgetHebdomadaireÉpuisé() {
        List<Long> log = Arrays.asList(NOW - DAY, NOW - 2 * DAY);
        List<C> candidates = list(new C("grade", NotificationPolicy.GRADE_DOWN, false));
        assertEquals(Collections.singletonList(NotificationPolicy.Decision.WAIT),
            NotificationPolicy.decide(candidates, log, NOW, false));
        // Les envois de plus de 7 jours ne comptent plus
        List<Long> old = Arrays.asList(NOW - 8 * DAY, NOW - 9 * DAY);
        assertEquals(Collections.singletonList(NotificationPolicy.Decision.SEND),
            NotificationPolicy.decide(list(new C("grade", NotificationPolicy.GRADE_DOWN, false)), old, NOW, false));
    }

    @Test
    public void critiquePasseMalgréBudgetEtModeBilan() {
        List<Long> log = Arrays.asList(NOW - DAY, NOW - 2 * DAY);
        List<C> candidates = list(new C("grade", NotificationPolicy.GRADE_DOWN, false), new C("fuite", NotificationPolicy.EVENT_CRITICAL, true));
        List<NotificationPolicy.Decision> d = NotificationPolicy.decide(candidates, log, NOW, true);
        assertEquals("fuite", candidates.get(0).name);
        assertEquals(Arrays.asList(NotificationPolicy.Decision.SEND, NotificationPolicy.Decision.DIGEST), d);
    }

    @Test
    public void modeBilanRegroupeLesNonCritiques() {
        List<C> candidates = list(new C("a", NotificationPolicy.GRADE_UP, false), new C("b", NotificationPolicy.INSTALL_RISKY, false));
        assertEquals(Arrays.asList(NotificationPolicy.Decision.DIGEST, NotificationPolicy.Decision.DIGEST),
            NotificationPolicy.decide(candidates, Collections.emptyList(), NOW, true));
    }

    @Test
    public void heuresActives() {
        assertFalse(NotificationPolicy.isActiveHour(8));
        assertTrue(NotificationPolicy.isActiveHour(9));
        assertTrue(NotificationPolicy.isActiveHour(20));
        assertFalse(NotificationPolicy.isActiveHour(21));
    }

    @Test
    public void bilanTousLesTrenteJours() {
        assertFalse(NotificationPolicy.digestDue(0, 0, NOW));
        assertFalse(NotificationPolicy.digestDue(0, NOW - 29 * DAY, NOW));
        assertTrue(NotificationPolicy.digestDue(0, NOW - 30 * DAY, NOW));
        assertFalse(NotificationPolicy.digestDue(NOW - 10 * DAY, NOW - 60 * DAY, NOW));
    }

    @Test
    public void relanceDeMigration() {
        assertFalse(NotificationPolicy.migrationStale(0, NOW));
        assertFalse(NotificationPolicy.migrationStale(NOW - 4 * DAY, NOW));
        assertTrue(NotificationPolicy.migrationStale(NOW - 5 * DAY, NOW));
    }
}
