import React, { useEffect, useState } from 'react';
import { Bell, BellOff, TrendingDown, AlertTriangle, Smartphone, Route, CalendarDays } from 'lucide-react';
import AlternativeNudges from '../native/AlternativeNudges';
import { t } from '../i18n/index.js';

const Toggle = ({ enabled, label, onClick }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    onClick={onClick}
    className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
  </button>
);

const Row = ({ enabled, Icon, title, description, onToggle }) => (
  <div className="flex items-start gap-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <Toggle enabled={enabled} label={title} onClick={onToggle} />
  </div>
);

/**
 * Réglages des notifications (app Android native uniquement), tous envoyés par le même
 * moteur (NotificationEngineWorker) avec un budget commun (voir docs/guides/notifications.md) :
 *  - « Événements » : fuite, rachat, changement de politique, open source… d'une app suivie ;
 *  - « Changements de note » : quand la note d'une app de « Mes Apps » change ;
 *  - « Nouvelles apps à risque » : une app notée D ou E vient d'être installée ;
 *  - « Suivi des migrations » : relance d'une migration en plan, bravo quand elle est finie ;
 *  - « Suggestions d'alternatives » : de temps en temps, une alternative mieux notée ;
 *  - « Bilan mensuel » : une notification par mois au lieu du fil de l'eau.
 * Activer un réglage demande la permission Android 13+ si elle ne l'a pas encore été.
 */
const AlternativeNudgesSection = ({
  enabled, onToggle, gradeAlertsEnabled, onToggleGradeAlerts,
  eventsEnabled, onToggleEvents, installsEnabled, onToggleInstalls,
  migrationRemindersEnabled, onToggleMigrationReminders, digestEnabled, onToggleDigest,
}) => {
  // 'granted' | 'denied' | 'prompt' | null (inconnu)
  const [permission, setPermission] = useState(null);
  // Apps mises en sourdine depuis une notification (« Ne plus m'alerter pour cette app »)
  const [mutedCount, setMutedCount] = useState(0);

  useEffect(() => {
    AlternativeNudges.checkPermission()
      .then(({ display }) => setPermission(display))
      .catch(() => setPermission(null));
    AlternativeNudges.getNotificationState()
      .then(({ muted }) => setMutedCount(Array.isArray(muted) ? muted.length : 0))
      .catch(() => {});
  }, []);

  const unmuteAll = () => {
    AlternativeNudges.unmuteAll().then(() => setMutedCount(0)).catch(() => {});
  };

  const toggleWithPermission = (current, apply) => async () => {
    const next = !current;
    apply(next);
    if (next && permission !== 'granted') {
      try {
        const { display } = await AlternativeNudges.requestPermission();
        setPermission(display);
      } catch {
        // Permission non disponible : le réglage reste actif, Android décidera.
      }
    }
  };

  const anyEnabled = enabled || gradeAlertsEnabled || eventsEnabled || installsEnabled || migrationRemindersEnabled;
  const blocked = anyEnabled && permission === 'denied';

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4">
      <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
        {t('cards.notifications.title')}
      </h2>
      <div className="space-y-4">
        {onToggleEvents && (
          <Row
            enabled={eventsEnabled}
            Icon={AlertTriangle}
            title={t('cards.notifications.eventsTitle')}
            description={t('cards.notifications.eventsBody')}
            onToggle={toggleWithPermission(eventsEnabled, onToggleEvents)}
          />
        )}
        <Row
          enabled={enabled}
          Icon={enabled ? Bell : BellOff}
          title={t('cards.notifications.nudgesTitle')}
          description={t('cards.notifications.nudgesBody')}
          onToggle={toggleWithPermission(enabled, onToggle)}
        />
        {onToggleGradeAlerts && (
          <Row
            enabled={gradeAlertsEnabled}
            Icon={TrendingDown}
            title={t('cards.notifications.gradeTitle')}
            description={t('cards.notifications.gradeBody')}
            onToggle={toggleWithPermission(gradeAlertsEnabled, onToggleGradeAlerts)}
          />
        )}
        {onToggleInstalls && (
          <Row
            enabled={installsEnabled}
            Icon={Smartphone}
            title={t('cards.notifications.installsTitle')}
            description={t('cards.notifications.installsBody')}
            onToggle={toggleWithPermission(installsEnabled, onToggleInstalls)}
          />
        )}
        {onToggleMigrationReminders && (
          <Row
            enabled={migrationRemindersEnabled}
            Icon={Route}
            title={t('cards.notifications.migrationTitle')}
            description={t('cards.notifications.migrationBody')}
            onToggle={toggleWithPermission(migrationRemindersEnabled, onToggleMigrationReminders)}
          />
        )}
        {onToggleDigest && (
          <Row
            enabled={digestEnabled}
            Icon={CalendarDays}
            title={t('cards.notifications.digestTitle')}
            description={t('cards.notifications.digestBody')}
            onToggle={() => onToggleDigest(!digestEnabled)}
          />
        )}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">{t('cards.notifications.budget')}</p>
      {mutedCount > 0 && (
        <p className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
          <span>{t('cards.notifications.muted', { count: mutedCount })}</span>
          <button type="button" onClick={unmuteAll} className="font-bold text-indigo-600 hover:text-indigo-800 shrink-0">
            {t('cards.notifications.unmute')}
          </button>
        </p>
      )}
      {blocked && (
        <p className="mt-2 text-xs text-rose-600">
          {t('cards.notifications.blocked')}{' '}
          <button
            type="button"
            onClick={() => AlternativeNudges.openSettings().catch(() => {})}
            className="font-bold underline"
          >
            {t('inbox.openSettings')}
          </button>
        </p>
      )}
    </section>
  );
};

export default AlternativeNudgesSection;
