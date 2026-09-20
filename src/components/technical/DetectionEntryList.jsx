import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';

/**
 * Liste générique d'entrées détectées (dépendances Google, SDK ou trackers).
 * Un seul composant, réutilisé 3 fois avec des props différentes, pour éviter
 * de dupliquer le rendu — cohérent avec l'idée d'un moteur générique côté
 * données (SignatureDatabase).
 */
const DetectionEntryList = ({ icon: Icon, title, intro, countLabel, entries, emptyLabel, accentClassName }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
        <Icon size={16} className={accentClassName || 'text-indigo-600'} /> {title}
      </h3>
      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${entries.length > 0 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'}`}>
        {countLabel(entries.length)}
      </span>
    </div>

    {/* Une phrase en langage clair sur ce que représente cette catégorie,
        pour un utilisateur non technique — avant même la liste détaillée. */}
    {intro && <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{intro}</p>}

    {entries.length === 0 ? (
      <p className="text-xs text-slate-400">{emptyLabel}</p>
    ) : (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-200">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{entry.name}</p>
              {entry.description ? (
                <p className="text-[11px] text-slate-500 leading-relaxed">{entry.description}</p>
              ) : (
                <p className="text-[11px] text-slate-500 truncate">{entry.detectionMethod}</p>
              )}
            </div>
            <ConfidenceBadge confidence={entry.confidence} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DetectionEntryList;
