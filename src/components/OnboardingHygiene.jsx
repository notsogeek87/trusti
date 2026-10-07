import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, KeyRound } from 'lucide-react';
import { HYGIENE_CHECKS } from '../constants/dataHygiene';
import { computeHygiene, detectPasswordManagers } from '../utils/passwordManagers';
import { getHygieneState, saveHygieneState } from '../utils/hygieneStorage';
import { useAgeMode } from '../contexts/AgeModeContext';
import { AGE_MODE } from '../utils/ageMode';

// Étape "Hygiène numérique" de fin de scan (onboarding et re-scan manuel),
// juste après le récapitulatif du TrustiScore : l'utilisateur coche les
// bons réflexes qu'il a déjà. Les cases sont pré-remplies avec le bilan
// existant (re-scan) et le gestionnaire de mots de passe détecté parmi les
// apps scannées est coché d'office. Réponses enregistrées en local
// uniquement (voir hygieneStorage), modifiables ensuite depuis "Mes Apps".
const OnboardingHygiene = ({ apps, ctaLabel, onDone }) => {
  const isKid = useAgeMode() === AGE_MODE.KID;
  const [checks, setChecks] = useState(() => getHygieneState().checks);
  const { dedicated } = useMemo(() => detectPasswordManagers(apps), [apps]);
  const hygiene = computeHygiene(checks, !!dedicated);

  const toggle = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  const finish = () => {
    saveHygieneState({ ...getHygieneState(), checks });
    onDone();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 py-10">
      <style>{`
        @keyframes onbSummaryFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ animation: 'onbSummaryFadeUp 0.4s ease-out' }} className="w-full max-w-xs mx-auto">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <KeyRound size={26} className="text-white" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Hygiène numérique
          </p>
          <h2 className="text-lg font-black text-slate-900 leading-snug">
            {isKid ? 'Et tes comptes, ils sont bien protégés ?' : 'Et vos comptes, bien protégés ?'}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 mb-5 leading-relaxed">
            {isKid
              ? 'Coche ce qui est vrai pour toi. Tes réponses restent sur ton téléphone.'
              : 'Cochez ce qui est déjà en place. Vos réponses restent sur ce téléphone.'}
          </p>
        </div>

        <ul className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 mb-3 overflow-hidden">
          {HYGIENE_CHECKS.map(item => {
            const checked = hygiene.state[item.id];
            const locked = item.auto && !!dedicated;
            const Icon = checked ? CheckCircle2 : Circle;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={locked}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-start gap-3 text-left px-4 py-3 hover:bg-slate-50 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <Icon size={20} className={`shrink-0 mt-px ${checked ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className="text-[13px] font-semibold leading-snug text-slate-700">
                    {isKid ? item.labelKid : item.label}
                    {locked && (
                      <span className="block text-[11px] font-medium text-emerald-600">{dedicated.name} détecté</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs font-bold text-slate-500 mb-6">
          Bilan : {hygiene.done}/{hygiene.total}
        </p>

        <button
          onClick={finish}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          {ctaLabel}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingHygiene;
