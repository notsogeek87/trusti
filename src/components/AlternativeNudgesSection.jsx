import React, { useEffect, useState } from 'react';
import { Bell, BellOff, TrendingDown } from 'lucide-react';
import AlternativeNudges from '../native/AlternativeNudges';

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
 * Réglages des notifications (app Android native uniquement) :
 *  - « Suggestions d'alternatives » : de temps en temps, une alternative mieux notée à une
 *    app C, D ou E ;
 *  - « Changements de note » : quand la note d'une app de « Mes Apps » change.
 * Activer l'un ou l'autre demande la permission Android 13+ si elle ne l'a pas encore été.
 */
const AlternativeNudgesSection = ({ enabled, onToggle, gradeAlertsEnabled, onToggleGradeAlerts }) => {
  // 'granted' | 'denied' | 'prompt' | null (inconnu)
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    AlternativeNudges.checkPermission()
      .then(({ display }) => setPermission(display))
      .catch(() => setPermission(null));
  }, []);

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

  const blocked = (enabled || gradeAlertsEnabled) && permission === 'denied';

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4">
      <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
        Notifications
      </h2>
      <div className="space-y-4">
        <Row
          enabled={enabled}
          Icon={enabled ? Bell : BellOff}
          title="Suggestions d'alternatives"
          description="Au plus une fois par semaine, une alternative mieux notée à une de vos apps notées C, D ou E. Calculé sur votre téléphone, rien n'est envoyé."
          onToggle={toggleWithPermission(enabled, onToggle)}
        />
        {onToggleGradeAlerts && (
          <Row
            enabled={gradeAlertsEnabled}
            Icon={TrendingDown}
            title="Changements de note"
            description="Quand la note d'une de vos apps baisse ou monte. Trusti télécharge la liste publique des changements et la compare sur votre téléphone : vos apps ne sont pas envoyées."
            onToggle={toggleWithPermission(gradeAlertsEnabled, onToggleGradeAlerts)}
          />
        )}
      </div>
      {blocked && (
        <p className="mt-2 text-xs text-rose-600">
          Les notifications de Trusti sont bloquées : autorisez-les dans les réglages Android
          (Applis &gt; Trusti &gt; Notifications).
        </p>
      )}
    </section>
  );
};

export default AlternativeNudgesSection;
