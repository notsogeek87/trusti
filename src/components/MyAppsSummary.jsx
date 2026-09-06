import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GRADES, GRADE_COLORS, PHONE_GRADE_LABEL, PHONE_GRADE_LABEL_KID } from '../constants/grades';
import { computeTrustiSummary } from '../utils/trustiScore';
import { useAgeMode } from '../contexts/AgeModeContext';
import { AGE_MODE } from '../utils/ageMode';

// Résumé compact affiché en haut de l'onglet "Mes Apps" : le TrustiScore
// global du téléphone (déduit des apps suivies) et la progression des
// migrations, condensée dans une simple barre de progression. Un tap
// révèle la répartition détaillée par note (A-E).
const MyAppsSummary = ({ apps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isKid = useAgeMode() === AGE_MODE.KID;
  const phoneGradeLabel = isKid ? PHONE_GRADE_LABEL_KID : PHONE_GRADE_LABEL;

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
    <button
      type="button"
      onClick={() => setIsOpen(prev => !prev)}
      aria-expanded={isOpen}
      className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-4 py-3.5 mb-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`${GRADE_COLORS[overallGrade]} w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white`}>
          <span className="text-base font-black leading-none">{overallGrade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-slate-900 truncate">TrustiScore du téléphone</p>
          <p className="text-xs text-slate-500 truncate">{phoneGradeLabel[overallGrade]}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {riskyCount > 0 && (
            <span className="text-sm font-bold text-indigo-600 whitespace-nowrap text-right leading-tight">
              {migratedCount} / {riskyCount}<br />
              <span className="text-[10px] font-semibold text-indigo-400">migrées</span>
            </span>
          )}
          <ChevronRight size={18} className="text-slate-300" />
        </div>
      </div>

      <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden bg-slate-200">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
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
