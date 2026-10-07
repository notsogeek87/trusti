import React, { useMemo, useState } from 'react';
import { KeyRound, ChevronRight } from 'lucide-react';
import DataHygieneModal from './modals/DataHygieneModal';
import { computeHygiene, detectPasswordManagers, buildManagerSuggestions } from '../utils/passwordManagers';
import { getHygieneState, saveHygieneState } from '../utils/hygieneStorage';
import { useAgeMode } from '../contexts/AgeModeContext';
import { AGE_MODE } from '../utils/ageMode';

// Ligne "Hygiène numérique" intégrée à la carte de bilan de "Mes Apps"
// (sous le TrustiScore du téléphone) : une seule ligne avec un statut court
// sur le gestionnaire de mots de passe et le score du bilan (x/5). Le détail
// (conseil complet, cases à cocher, gestionnaires conseillés) est dans la fiche.
// Aucune donnée ne quitte l'appareil (voir hygieneStorage).
const DataHygieneCard = ({ myApps, catalogApps }) => {
  const isKid = useAgeMode() === AGE_MODE.KID;
  const [state, setState] = useState(getHygieneState);
  const [isOpen, setIsOpen] = useState(false);

  const { dedicated, ecosystem } = useMemo(() => detectPasswordManagers(myApps), [myApps]);
  const managerDetected = !!dedicated || !!state.checks.manager;
  const hygiene = useMemo(() => computeHygiene(state.checks, managerDetected), [state.checks, managerDetected]);
  const suggestions = useMemo(() => buildManagerSuggestions(catalogApps), [catalogApps]);

  const toggleCheck = (id) => {
    const next = { ...state, checks: { ...state.checks, [id]: !state.checks[id] } };
    setState(next);
    saveHygieneState(next);
  };

  let status;
  let needsAttention = false;
  if (dedicated) {
    status = isKid ? `${dedicated.name} protège tes mots de passe` : `${dedicated.name} détecté`;
  } else if (state.checks.manager) {
    status = isKid ? 'Tu as un coffre-fort à mots de passe' : 'Gestionnaire déclaré';
  } else if (ecosystem) {
    status = isKid ? `Coffre-fort ${ecosystem.name}` : `${ecosystem.name} : préférez un indépendant`;
    needsAttention = true;
  } else {
    status = isKid ? 'Pas de coffre-fort à mots de passe' : 'Aucun gestionnaire de mots de passe';
    needsAttention = true;
  }

  const isComplete = hygiene.done === hygiene.total;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors"
      >
        <div className="w-11 flex justify-center shrink-0">
          <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center">
            <KeyRound size={15} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-900 truncate">
            {isKid ? 'Mes mots de passe' : 'Hygiène numérique'}
          </p>
          <p className={`text-xs truncate ${needsAttention ? 'text-amber-600' : 'text-slate-500'}`}>{status}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'}`}>
            {hygiene.done}/{hygiene.total}
          </span>
          <ChevronRight size={18} className="text-slate-300" />
        </div>
      </button>

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
