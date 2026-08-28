import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { GRADES, GRADE_COLORS, PHONE_GRADE_LABEL } from '../constants/grades';
import { computeTrustiSummary } from '../utils/trustiScore';

// Résumé compact affiché en haut de l'onglet "Mes Apps" : le TrustiScore
// global du téléphone (déduit des apps suivies) et la progression des
// migrations. Repliée par défaut pour laisser la place à la liste des apps,
// elle se déplie au tap pour révéler la répartition par note (A-E).
const MyAppsSummary = ({ apps }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { counts, total, overallGrade } = useMemo(() => computeTrustiSummary(apps), [apps]);

  const { migratedCount, riskyCount } = useMemo(() => {
    const risky = apps.filter(app => app?.grade && app.grade !== 'A' && !app.isLoadingSkeleton);
    return {
      riskyCount: risky.length,
      migratedCount: risky.filter(app => app.alternativeAdopted).length,
    };
  }, [apps]);

  if (total === 0 || !overallGrade) return null;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(prev => !prev)}
      aria-expanded={isOpen}
      className="w-full text-left bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-2xl px-3.5 py-3 mb-4 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <ScoreIndicator grade={overallGrade} size="small" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-800 truncate">TrustiScore du téléphone</p>
          <p className="text-[11px] text-slate-500 truncate">
            {PHONE_GRADE_LABEL[overallGrade]} · {total} app{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {riskyCount > 0 && (
            <span className="text-[11px] font-bold text-indigo-600 whitespace-nowrap">
              {migratedCount}/{riskyCount} migrées
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-100">
          <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100">
            {GRADES.map(grade => (
              counts[grade] > 0 && (
                <div
                  key={grade}
                  className={GRADE_COLORS[grade]}
                  style={{ width: `${(counts[grade] / total) * 100}%` }}
                />
              )
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {GRADES.map(grade => (
              <span key={grade} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <span className={`${GRADE_COLORS[grade]} w-1.5 h-1.5 rounded-sm`} />
                {grade}·{counts[grade]}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};

export default MyAppsSummary;
