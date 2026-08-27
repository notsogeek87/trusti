import React, { useMemo } from 'react';
import ScoreIndicator from './ui/ScoreIndicator';
import { GRADES, GRADE_COLORS, PHONE_GRADE_LABEL } from '../constants/grades';
import { computeTrustiSummary } from '../utils/trustiScore';

// Résumé persistant affiché en haut de l'onglet "Mes Apps" : le TrustiScore
// global du téléphone (déduit des apps suivies), le nombre d'apps par note,
// et une barre de progression des migrations (apps à risque déjà remplacées
// par une alternative plus fiable).
const MyAppsSummary = ({ apps }) => {
  const { counts, total, overallGrade } = useMemo(() => computeTrustiSummary(apps), [apps]);

  const { migratedCount, riskyCount } = useMemo(() => {
    const risky = apps.filter(app => app?.grade && app.grade !== 'A' && !app.isLoadingSkeleton);
    return {
      riskyCount: risky.length,
      migratedCount: risky.filter(app => app.alternativeAdopted).length,
    };
  }, [apps]);

  if (total === 0 || !overallGrade) return null;

  const progressPct = riskyCount > 0 ? Math.round((migratedCount / riskyCount) * 100) : 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
      <div className="flex items-center gap-3">
        <ScoreIndicator grade={overallGrade} size="small" />
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            TrustiScore de ton téléphone
          </p>
          <p className="text-xs font-bold text-slate-700 truncate">{PHONE_GRADE_LABEL[overallGrade]}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 mt-4">
        {GRADES.map(grade => (
          <div key={grade} className="flex flex-col items-center gap-1">
            <div className={`${GRADE_COLORS[grade]} w-6 h-6 rounded-md flex items-center justify-center`}>
              <span className="text-[11px] font-black text-white leading-none">{grade}</span>
            </div>
            <span className="text-[11px] font-black text-slate-700">{counts[grade]}</span>
          </div>
        ))}
      </div>

      {riskyCount > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-bold text-slate-600">Migrations vers des alternatives fiables</p>
            <p className="text-[11px] font-black text-slate-700">{migratedCount}/{riskyCount}</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppsSummary;
