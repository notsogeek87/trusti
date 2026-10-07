import React, { useMemo, useState } from 'react';
import { KeyRound, ChevronRight, X } from 'lucide-react';
import DataHygieneModal from './modals/DataHygieneModal';
import { computeHygiene, detectPasswordManagers, buildManagerSuggestions } from '../utils/passwordManagers';
import { getHygieneState, saveHygieneState } from '../utils/hygieneStorage';
import { useAgeMode } from '../contexts/AgeModeContext';
import { AGE_MODE } from '../utils/ageMode';

// Carte "Hygiène numérique" affichée sous le TrustiScore du téléphone dans
// "Mes Apps" : jauge du bilan (x/5), conseil contextuel sur le gestionnaire
// de mots de passe détecté (ou non) et accès à la fiche de bonnes pratiques.
// Aucune donnée ne quitte l'appareil (voir hygieneStorage).
const DataHygieneCard = ({ myApps, catalogApps }) => {
  const isKid = useAgeMode() === AGE_MODE.KID;
  const [state, setState] = useState(getHygieneState);
  const [isOpen, setIsOpen] = useState(false);

  const { dedicated, ecosystem } = useMemo(() => detectPasswordManagers(myApps), [myApps]);
  const managerDetected = !!dedicated || !!state.checks.manager;
  const hygiene = useMemo(() => computeHygiene(state.checks, managerDetected), [state.checks, managerDetected]);
  const suggestions = useMemo(() => buildManagerSuggestions(catalogApps), [catalogApps]);

  const update = (next) => {
    setState(next);
    saveHygieneState(next);
  };

  const toggleCheck = (id) => update({ ...state, checks: { ...state.checks, [id]: !state.checks[id] } });
  const dismiss = (event) => {
    event.stopPropagation();
    update({ ...state, cardDismissed: true });
  };

  if (state.cardDismissed) return null;

  let advice;
  if (dedicated) {
    advice = isKid
      ? `Bravo, ${dedicated.name} garde tes mots de passe en sécurité !`
      : `${dedicated.name} protège déjà vos mots de passe. Pensez à la double authentification.`;
  } else if (ecosystem && !state.checks.manager) {
    advice = isKid
      ? 'Ton coffre-fort est lié à une grande entreprise. Il existe des alternatives indépendantes.'
      : `Vos mots de passe sont chez ${ecosystem.name}. Un gestionnaire indépendant vous laisse plus libre.`;
  } else if (state.checks.manager) {
    advice = isKid ? 'Tu as un coffre-fort pour tes mots de passe, super !' : 'Vous avez déclaré utiliser un gestionnaire de mots de passe.';
  } else {
    advice = isKid
      ? 'Aucun coffre-fort à mots de passe trouvé. On t\'en montre de bons ?'
      : 'Aucun gestionnaire de mots de passe détecté sur ce téléphone.';
  }

  const showDeclare = !dedicated && !state.checks.manager;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(true); } }}
        className="w-full text-left cursor-pointer bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-2xl px-4 py-3.5 mb-4 transition-colors relative"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white">
            <KeyRound size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-5">
            <p className="text-[15px] font-bold text-slate-900 truncate">
              {isKid ? 'Mes mots de passe' : 'Hygiène numérique'}
            </p>
            <p className="text-xs text-slate-600 leading-snug">{advice}</p>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-sm font-bold text-indigo-600 whitespace-nowrap">
            {hygiene.done}/{hygiene.total}
            <ChevronRight size={18} className="text-indigo-300" />
          </span>
        </div>

        <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden bg-indigo-100">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${hygiene.pct}%` }} />
        </div>

        {showDeclare && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleCheck('manager'); }}
            className="mt-2.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
          >
            {isKid ? 'J\'en ai déjà un' : 'J\'en utilise déjà un'}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Masquer cette carte"
          className="absolute top-2 right-2 p-1 text-indigo-300 hover:text-indigo-500"
        >
          <X size={14} />
        </button>
      </div>

      {isOpen && (
        <DataHygieneModal
          hygiene={hygiene}
          managerDetected={!!dedicated}
          managerSuggestions={suggestions}
          ecosystemManager={ecosystem}
          onToggleCheck={toggleCheck}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DataHygieneCard;
