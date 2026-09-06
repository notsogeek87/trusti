import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { GRADE_INFO, GRADE_INFO_KID, PHONE_GRADE_LABEL, PHONE_GRADE_LABEL_KID } from '../constants/grades';
import { computeTrustiSummary } from '../utils/trustiScore';
import { useAgeMode } from '../contexts/AgeModeContext';
import { AGE_MODE } from '../utils/ageMode';

// Écran de récapitulatif affiché après un scan (natif) ou une sélection
// (manuelle/web), avant d'arriver sur "Mes Apps" : combien d'apps par
// TrustiScore, une note globale déduite du téléphone, et un bouton pour
// accéder au détail (la liste "Mes Apps").
const OnboardingSummary = ({ apps, onDetails }) => {
  const isKid = useAgeMode() === AGE_MODE.KID;
  const gradeInfo = isKid ? GRADE_INFO_KID : GRADE_INFO;
  const phoneGradeLabel = isKid ? PHONE_GRADE_LABEL_KID : PHONE_GRADE_LABEL;
  const { counts, total, overallGrade } = useMemo(() => computeTrustiSummary(apps), [apps]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
      <style>{`
        @keyframes onbSummaryFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ animation: 'onbSummaryFadeUp 0.4s ease-out' }} className="w-full max-w-xs mx-auto">
        {overallGrade && (
          <>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
              TrustiScore de ton téléphone
            </p>
            <div className="flex justify-center mb-3">
              <ScoreIndicator grade={overallGrade} size="large" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-6 leading-snug">
              {phoneGradeLabel[overallGrade]}
            </p>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 mb-8 overflow-hidden">
          {gradeInfo.map(({ grade, title }) => (
            <div key={grade} className="flex items-center gap-3 px-4 py-3">
              <ScoreIndicator grade={grade} size="small" />
              <span className="flex-1 min-w-0 text-left text-xs font-bold text-slate-700 truncate">
                {title}
              </span>
              <span className="text-sm font-black text-slate-800 shrink-0">{counts[grade]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onDetails}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          Détails de mes {total} app{total !== 1 ? 's' : ''}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingSummary;
