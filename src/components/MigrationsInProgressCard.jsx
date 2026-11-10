import React from 'react';
import { Route, ChevronRight } from 'lucide-react';

/**
 * Carte « Migrations en cours » de « Mes Apps » : parcours de migration guidée commencés
 * et pas terminés (voir getMigrationsInProgress). « Reprendre » rouvre la fiche de l'app
 * avec le parcours, à l'étape où il s'était arrêté.
 *
 * @param {{ items: Array<{app, altName, completed, total}>, onResume: (app) => void }} props
 */
const MigrationsInProgressCard = ({ items, onResume }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4" aria-label="Migrations en cours">
      <h3 className="flex items-center gap-1.5 font-black text-xs uppercase tracking-tight text-slate-800 mb-2">
        <Route size={13} className="text-indigo-500" /> Migrations en cours
      </h3>
      <ul className="divide-y divide-slate-100">
        {items.map(({ app, altName, completed, total }) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => onResume(app)}
              className="w-full flex items-center gap-3 py-2.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {app.name}{altName ? ` → ${altName}` : ''}
                </span>
                <span className="flex items-center gap-2 mt-1">
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: total }, (_, i) => (
                      <span key={i} className={`w-5 h-1.5 rounded-full ${i < completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                  </span>
                  <span className="text-[11px] text-slate-500">{completed}/{total} étapes</span>
                </span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600">
                Reprendre <ChevronRight size={14} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MigrationsInProgressCard;
