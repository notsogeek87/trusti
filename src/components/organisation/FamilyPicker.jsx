import React from 'react';
import { Check, Landmark } from 'lucide-react';
import { isPublicService } from '../../constants/publicServices';
import ScoreIndicator from '../ui/ScoreIndicator';
import ProAppIcon from './ProAppIcon';

const AppChip = React.memo(({ app, selected, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(app.id)}
    aria-pressed={selected}
    className={`flex items-center gap-2 w-full min-w-0 text-left rounded-xl border px-2.5 py-2 transition-colors
      ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
  >
    <ProAppIcon app={app} />
    <span className="flex-1 min-w-0 text-sm font-bold text-slate-800 truncate" title={app.name}>{app.name}</span>
    {isPublicService(app) && (
      <span title="Service opéré par l'État" className="flex items-center gap-0.5 shrink-0 text-[10px] font-black uppercase text-blue-700 bg-blue-50 rounded px-1.5 py-0.5">
        <Landmark size={11} aria-hidden="true" /> État
      </span>
    )}
    <ScoreIndicator grade={app.grade} />
    <span className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center
      ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent'}`}>
      <Check size={12} strokeWidth={3} />
    </span>
  </button>
));

const FamilySection = ({ group, selectedIds, onToggle }) => {
  const selectedCount = group.apps.filter(a => selectedIds.has(a.id)).length;
  return (
    <section className="bg-white/80 rounded-2xl border border-white p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-black text-slate-800">{group.family.label}</h3>
        {selectedCount > 0 && (
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 shrink-0">
            {selectedCount} choisi{selectedCount > 1 ? 's' : ''}
          </span>
        )}
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.apps.map(app => (
          <AppChip key={app.id} app={app} selected={selectedIds.has(app.id)} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
};

/**
 * Sélection des outils, famille par famille (toutes les apps sont affichées).
 * @param {{groups: Array<{family: object, apps: object[]}>, selectedIds: Set<string>, onToggle: (id: string) => void}} props
 */
const FamilyPicker = ({ groups, selectedIds, onToggle, onSuggest }) => {
  if (groups.length === 0) {
    return (
      <div className="text-sm text-slate-500 bg-white/80 rounded-2xl p-4">
        <p>Aucun outil ne correspond à cette recherche.</p>
        {onSuggest && (
          <button type="button" onClick={onSuggest} className="mt-2 font-bold text-purple-600 hover:underline">
            Proposer cet outil pour le catalogue
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {groups.map(group => (
        <FamilySection key={group.family.id} group={group} selectedIds={selectedIds} onToggle={onToggle} />
      ))}
    </div>
  );
};

export default FamilyPicker;
