import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GRADES, GRADE_COLORS, PHONE_GRADE_LABEL } from '../constants/grades';
import { computeTrustiSummary } from '../utils/trustiScore';

// Carte de bilan affichée en haut de l'onglet "Mes Apps" : le TrustiScore
// global du téléphone (déduit des apps suivies) et la progression des
// migrations, condensée dans une barre. Un tap révèle la répartition par
// note (A-E) et le partage des migrations. `children` permet d'ajouter des
// pastilles secondaires dans le pied de carte (ex. hygiène numérique), pour
// garder un seul bloc de synthèse au lieu d'empiler des cartes.
const MyAppsSummary = ({ apps, onShareMigrations, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneGradeLabel = PHONE_GRADE_LABEL;

  const { counts, total, overallGrade } = useMemo(() => computeTrustiSummary(apps), [apps]);

  const { migratedCount, riskyCount } = useMemo(() => {
    const risky = apps.filter(app => app?.grade && app.grade !== 'A' && !app.isLoadingSkeleton);
    return {
      riskyCount: risky.length,
      migratedCount: risky.filter(app => app.alternativeAdopted).length,
    };
  }, [apps]);

  const hasScore = total > 0 && !!overallGrade;
  if (!hasScore && !children) return null;

  const progressPct = riskyCount > 0 ? Math.round((migratedCount / riskyCount) * 100) : 100;

  return (
    <div className="bg-indigo-600 border border-indigo-500 rounded-2xl mb-4 overflow-hidden shadow-md">
      {hasScore && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            aria-expanded={isOpen}
            className="w-full text-left px-4 pt-3.5 pb-2.5 hover:bg-indigo-500/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`${GRADE_COLORS[overallGrade]} w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white`}>
                <span className="text-base font-black leading-none">{overallGrade}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white truncate">TrustiScore du téléphone</p>
                <p className="text-xs text-indigo-100 truncate">{phoneGradeLabel[overallGrade]}</p>
              </div>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden bg-indigo-900/60">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </button>

          {isOpen && (
            <div className="px-4 pb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {GRADES.map(grade => (
                <span key={grade} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300">
                  <span className={`${GRADE_COLORS[grade]} w-1.5 h-1.5 rounded-sm`} />
                  {grade}·{counts[grade]}
                </span>
              ))}
              {onShareMigrations && (
                <button
                  type="button"
                  onClick={onShareMigrations}
                  className="ml-auto text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
                >
                  Partager mes migrations
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Pied de carte : progression des migrations + pastilles secondaires
          (ex. hygiène numérique), sur une seule ligne */}
      {(riskyCount > 0 && hasScore) || children ? (
        <div className={`px-4 pb-3 flex items-center justify-between gap-2 ${hasScore ? '' : 'pt-3'}`}>
          <span className="text-xs text-slate-300 truncate">
            {hasScore && riskyCount > 0 && (
              <>
                <span className="font-bold text-white">{migratedCount} / {riskyCount}</span> apps migrées
              </>
            )}
          </span>
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default MyAppsSummary;
