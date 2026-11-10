import React from 'react';
import { TrendingDown, TrendingUp, ChevronRight } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';

const formatDate = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

/**
 * Carte « Notes mises à jour » en tête de « Mes Apps » : les apps suivies dont la note a
 * changé depuis la dernière visite (voir useGradeChanges). Toucher une ligne ouvre la fiche,
 * « J'ai vu » masque la carte jusqu'au prochain changement.
 *
 * @param {{ changes: object[], apps: object[], onSelectApp: Function, onDismiss: Function }} props
 *   apps : apps chargées de « Mes Apps », pour ouvrir la fiche complète et montrer l'alternative
 */
const GradeChangesCard = ({ changes, apps, onSelectApp, onDismiss }) => {
  if (!changes || changes.length === 0) return null;
  const byId = new Map((apps || []).map(app => [String(app.id), app]));

  return (
    <section className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 mb-4" aria-label="Notes mises à jour">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-black text-xs uppercase tracking-tight text-slate-800">
          {changes.length > 1 ? `${changes.length} notes ont changé` : 'Une note a changé'}
        </h3>
        <button onClick={onDismiss} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1">
          J'ai vu
        </button>
      </div>
      <ul className="divide-y divide-slate-100">
        {changes.map((change) => {
          const app = byId.get(change.appId);
          const down = change.direction === 'down';
          const showAlt = down && app?.alternative && !app.alternativeAdopted;
          return (
            <li key={`${change.appId}:${change.date}`}>
              <button
                type="button"
                disabled={!app || app.isLoadingSkeleton}
                onClick={() => app && onSelectApp(app)}
                className="w-full flex items-center gap-3 py-2.5 text-left disabled:cursor-default"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${down ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {down ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800 truncate">{app?.name || change.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    {down ? 'En baisse' : 'En hausse'} le {formatDate(change.date)}
                    {showAlt && ` · alternative : ${app.alternative}`}
                  </span>
                </span>
                <span className="flex items-center gap-1 shrink-0" aria-label={`de ${change.previousGrade} à ${change.grade}`}>
                  <ScoreIndicator grade={change.previousGrade} />
                  <ChevronRight size={12} className="text-slate-300" />
                  <ScoreIndicator grade={change.grade} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default GradeChangesCard;
