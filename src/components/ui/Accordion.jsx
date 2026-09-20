import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Section repliable générique. Repliée par défaut (`defaultOpen = false`)
 * pour les blocs volumineux qui ne doivent pas prendre toute la place au
 * premier coup d'œil (ex. l'analyse technique dans AppDetailModal).
 */
const Accordion = ({ icon: Icon, title, subtitle, badge, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={18} className="text-indigo-600 shrink-0" />}
          <span className="min-w-0">
            <span className="block font-black text-sm uppercase tracking-tight text-slate-800">{title}</span>
            {subtitle && <span className="block text-[11px] text-slate-400 font-normal normal-case mt-0.5">{subtitle}</span>}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {/* Visible même repliée : on montre "de suite" s'il y a des points
              à surveiller, sans obliger à ouvrir la section pour le savoir. */}
          {badge}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export default Accordion;
