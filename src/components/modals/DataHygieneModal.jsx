import React from 'react';
import { X, KeyRound, ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { BEST_PRACTICES, HYGIENE_CHECKS } from '../../constants/dataHygiene';
import { GRADE_COLORS } from '../../constants/grades';
import { useAgeMode } from '../../contexts/AgeModeContext';
import { AGE_MODE } from '../../utils/ageMode';

/**
 * Fiche "Bonnes pratiques" : bilan cochable, rappels sur les mots de passe et
 * gestionnaires suggérés. Les cases sont enregistrées en local uniquement.
 */
const DataHygieneModal = ({ hygiene, managerDetected, managerSuggestions, ecosystemManager, onToggleCheck, onClose }) => {
  const isKid = useAgeMode() === AGE_MODE.KID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 text-white rounded-[2.5rem] relative shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-800 max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh] scrollbar-custom-dark p-7">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-1 z-10"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <KeyRound size={20} />
            <h4 className="font-black text-xs uppercase tracking-widest">Hygiène numérique</h4>
          </div>
          <h3 className="text-xl font-black mb-2 text-white leading-tight">
            {isKid ? 'Protège tes comptes' : 'Protéger vos comptes au quotidien'}
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-400 font-medium mb-6">
            {isKid
              ? 'Quelques réflexes simples pour que personne ne puisse entrer dans tes comptes à ta place.'
              : 'Un bon score de confiance ne suffit pas : la façon dont vous protégez vos accès compte autant. Quelques réflexes suffisent.'}
          </p>

          <h4 className="font-black text-[11px] uppercase tracking-widest mb-3 text-slate-500 flex items-center gap-2">
            <div className="h-px bg-slate-800 flex-grow"></div>
            Mon bilan · {hygiene.done}/{hygiene.total}
            <div className="h-px bg-slate-800 flex-grow"></div>
          </h4>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800 mb-3">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${hygiene.pct}%` }} />
          </div>
          <ul className="space-y-1 mb-8">
            {HYGIENE_CHECKS.map(item => {
              const checked = hygiene.state[item.id];
              const locked = item.auto && managerDetected;
              const Icon = checked ? CheckCircle2 : Circle;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={locked}
                    onClick={() => onToggleCheck(item.id)}
                    className="w-full flex items-start gap-3 text-left py-2 disabled:cursor-default"
                  >
                    <Icon size={20} className={`shrink-0 mt-0.5 ${checked ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`text-[13px] font-semibold leading-snug ${checked ? 'text-slate-300' : 'text-white'}`}>
                      {isKid ? item.labelKid : item.label}
                      {locked && <span className="block text-[11px] font-medium text-slate-500">Détecté dans tes apps</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <h4 className="font-black text-[11px] uppercase tracking-widest mb-5 text-slate-500 flex items-center gap-2">
            <div className="h-px bg-slate-800 flex-grow"></div>
            Les bons réflexes
            <div className="h-px bg-slate-800 flex-grow"></div>
          </h4>
          <div className="space-y-5 mb-8">
            {BEST_PRACTICES.map((practice, index) => (
              <div key={practice.id} className="flex gap-4 items-start">
                <div className="bg-indigo-500 w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight mb-1">{isKid ? practice.titleKid : practice.title}</p>
                  <p className="text-[12px] leading-relaxed text-slate-400 font-medium">{isKid ? practice.textKid : practice.text}</p>
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-black text-[11px] uppercase tracking-widest mb-4 text-slate-500 flex items-center gap-2">
            <div className="h-px bg-slate-800 flex-grow"></div>
            Gestionnaires conseillés
            <div className="h-px bg-slate-800 flex-grow"></div>
          </h4>
          {ecosystemManager && (
            <p className="text-[12px] leading-relaxed text-amber-300/90 font-medium mb-4">
              Tu utilises {ecosystemManager.name}, lié à un écosystème. Un gestionnaire indépendant te laisse changer de téléphone ou de navigateur sans tout perdre.
            </p>
          )}
          <div className="space-y-3">
            {managerSuggestions.map(manager => (
              <a
                key={manager.key}
                href={manager.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 rounded-2xl p-3 transition-colors"
              >
                {manager.icon ? (
                  <img src={manager.icon} alt="" className="w-10 h-10 rounded-xl bg-white object-contain shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                    <KeyRound size={18} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white flex items-center gap-2">
                    {manager.name}
                    {manager.grade && (
                      <span className={`${GRADE_COLORS[manager.grade]} text-white text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center`}>
                        {manager.grade}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] leading-snug text-slate-400 font-medium">{isKid ? manager.pitchKid : manager.pitch}</p>
                </div>
                <ExternalLink size={14} className="text-slate-500 shrink-0" />
              </a>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-4 leading-relaxed">
            Liens officiels (Play Store), sans affiliation. Tout ce que tu coches ici reste sur ton appareil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataHygieneModal;
