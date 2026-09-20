import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getOverviewSignals, SIGNAL_STYLE } from './technicalSignals';

/**
 * « Ce qu'il faut retenir » — tout en haut de l'analyse technique, avant le
 * détail : reprend en langage clair les faits qui méritent l'attention
 * (mode debug actif, trafic non chiffré, beaucoup de trackers...). Complète
 * mais ne remplace jamais le détail factuel des cartes ci-dessous — voir
 * docs/architecture/technical-analysis.md (pas de verdict global "app sûre
 * ou pas", uniquement des repères sur des faits précis).
 */
const KeyTakeaways = ({ analysis }) => {
  const signals = getOverviewSignals(analysis);

  if (signals.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          Rien de particulier à signaler parmi les points vérifiés ci-dessous (mode debug, trafic non
          chiffré, sauvegarde, trackers, permissions sensibles...).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3 mb-4">
      <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500 mb-2">
        <AlertTriangle size={14} className="text-amber-500" /> Ce qu'il faut retenir
      </h4>
      <div className="space-y-1.5">
        {signals.map((s) => {
          const style = SIGNAL_STYLE[s.level];
          return (
            <div
              key={s.key}
              className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs leading-relaxed ${style.badgeClass}`}
            >
              <span className="shrink-0">{style.icon}</span>
              <span>{s.explanation}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyTakeaways;
