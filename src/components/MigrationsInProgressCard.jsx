import React from 'react';
import { Route, ChevronRight, X } from 'lucide-react';

/**
 * Carte « Migrations en cours » de « Mes Apps » : parcours de migration guidée commencés
 * et pas terminés (voir getMigrationsInProgress). Une ligne compacte par parcours :
 * toucher la ligne rouvre la fiche à l'étape où il s'était arrêté, la croix l'abandonne
 * (annulable, et relançable depuis la fiche de l'app).
 *
 * @param {{
 *   items: Array<{app, altName, completed, total}>,
 *   onResume: (app) => void,
 *   onAbandon: (app) => void,
 * }} props
 */
const MigrationsInProgressCard = ({ items, onResume, onAbandon }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-2 mb-3" aria-label="Migrations en cours">
      <h3 className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-slate-400">
        <Route size={11} className="text-indigo-500" /> Migrations en cours
      </h3>
      <ul className="divide-y divide-slate-100">
        {items.map(({ app, altName, completed, total }) => (
          <li key={app.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onResume(app)}
              className="min-w-0 flex-1 flex items-center gap-2 py-1.5 text-left"
              aria-label={`Reprendre la migration de ${app.name} (${completed} étape${completed > 1 ? 's' : ''} sur ${total})`}
            >
              <span className="min-w-0 flex-1 text-sm font-bold text-slate-800 truncate">
                {app.name}{altName ? ` → ${altName}` : ''}
              </span>
              <span className="shrink-0 flex gap-0.5" aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className={`w-2.5 h-1.5 rounded-full ${i < completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </span>
              <span className="shrink-0 inline-flex items-center text-xs font-bold text-indigo-600">
                Reprendre <ChevronRight size={14} />
              </span>
            </button>
            {onAbandon && (
              <button
                type="button"
                onClick={() => onAbandon(app)}
                className="shrink-0 p-2 -mr-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label={`Abandonner la migration de ${app.name}`}
                title="Abandonner cette migration"
              >
                <X size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MigrationsInProgressCard;
