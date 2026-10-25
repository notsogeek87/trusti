import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import AlternativeNudges from '../native/AlternativeNudges';

/**
 * Réglage « Suggestions d'alternatives » (app Android native uniquement) : de temps en
 * temps, une notification propose une alternative mieux notée à une app C, D ou E.
 * L'activation demande la permission Android 13+ si elle ne l'a pas encore été.
 */
const AlternativeNudgesSection = ({ enabled, onToggle }) => {
  // 'granted' | 'denied' | 'prompt' | null (inconnu)
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    AlternativeNudges.checkPermission()
      .then(({ display }) => setPermission(display))
      .catch(() => setPermission(null));
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    onToggle(next);
    if (next && permission !== 'granted') {
      try {
        const { display } = await AlternativeNudges.requestPermission();
        setPermission(display);
      } catch {
        // Permission non disponible : le réglage reste actif, Android décidera.
      }
    }
  };

  const blocked = enabled && permission === 'denied';

  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-4">
      <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
        Notifications
      </h2>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
          {enabled ? <Bell size={18} /> : <BellOff size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">Suggestions d'alternatives</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Au plus une fois par semaine, une alternative mieux notée à une de vos apps
            notées C, D ou E. Calculé sur votre téléphone, rien n'est envoyé.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Suggestions d'alternatives"
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
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
