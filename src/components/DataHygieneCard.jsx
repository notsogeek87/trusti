import React, { useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';
import DataHygieneModal from './modals/DataHygieneModal';
import { computeHygiene, detectPasswordManagers, buildManagerSuggestions } from '../utils/passwordManagers';
import { getHygieneState, saveHygieneState } from '../utils/hygieneStorage';

// Pastille "Mots de passe" en pied de la carte bilan de "Mes Apps" (à côté
// du compteur de migrations) : score du bilan (x/5), en orange quand aucun
// gestionnaire indépendant n'est utilisé, en vert à 5/5. Tout le détail
// (conseil, cases à cocher, gestionnaires conseillés) est dans la fiche.
// Aucune donnée ne quitte l'appareil (voir hygieneStorage).
const DataHygieneCard = ({ myApps, catalogApps }) => {
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

  // Statut court, gardé pour l'accessibilité et l'infobulle de la pastille.
  let status;
  let needsAttention = false;
  if (dedicated) {
    status = `${dedicated.name} détecté`;
  } else if (state.checks.manager) {
    status = 'Gestionnaire déclaré';
  } else if (ecosystem) {
    status = `${ecosystem.name} : un gestionnaire indépendant est conseillé`;
    needsAttention = true;
  } else {
    status = 'Aucun gestionnaire de mots de passe';
    needsAttention = true;
  }

  const isComplete = hygiene.done === hygiene.total;
  const tone = isComplete
    ? 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30'
    : needsAttention
      ? 'bg-amber-400/15 text-amber-200 border-amber-300/30'
      : 'bg-white/10 text-slate-100 border-white/20';
  const label = 'Hygiène';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={status}
        aria-label={`${label} ${hygiene.done} sur ${hygiene.total} : ${status}`}
        className={`shrink-0 inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors hover:brightness-95 ${tone}`}
      >
        <KeyRound size={12} />
        {label}
        <span className="font-black">{hygiene.done}/{hygiene.total}</span>
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
