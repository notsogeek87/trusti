import React from 'react';
import { Globe, BookmarkCheck, Award } from 'lucide-react';
import { TABS } from '../../constants/tabs';
import { useIsMobile } from '../../contexts/ViewModeContext';

const TABS_CONFIG = [
  {
    id: TABS.MY_APPS,
    label: 'Mes Apps',
    icon: BookmarkCheck,
    activeColor: 'text-indigo-600',
    activeBg: 'bg-indigo-50',
    inactiveColor: 'text-slate-400 hover:text-indigo-400',
    badge: true,
  },
  {
    id: TABS.APPLICATIONS,
    label: 'Catalogue',
    icon: Globe,
    activeColor: 'text-purple-600',
    activeBg: 'bg-purple-50',
    inactiveColor: 'text-slate-400 hover:text-purple-400',
  },
  {
    id: TABS.TOP_ALTERNATIVES,
    label: 'Palmarès',
    icon: Award,
    activeColor: 'text-emerald-600',
    activeBg: 'bg-emerald-50',
    inactiveColor: 'text-slate-400 hover:text-emerald-400',
  },
];

const Navigation = ({ activeTab, onTabChange, myAppsCount }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-4 max-w-md mx-auto flex justify-around items-center z-40 rounded-t-[2.5rem] shadow-2xl">
        {TABS_CONFIG.map(({ id, label, icon: Icon, activeColor, inactiveColor, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 transition-all ${active ? activeColor : inactiveColor}`}
            >
              <div className="relative">
                <Icon size={active && id === TABS.APPLICATIONS ? 28 : 22} className="transition-all" />
                {badge && myAppsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {myAppsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    // `aside` ne fait que réserver la largeur dans le flux (le menu réel est
    // en `fixed`, donc hors flux) pour que le contenu principal ne passe pas
    // dessous. `fixed` plutôt que `sticky` : le menu ne doit jamais bouger,
    // même d'un pixel, pendant le scroll.
    <aside className="w-52 shrink-0">
      <nav className="fixed top-14 left-0 bottom-0 w-52 flex flex-col gap-1 py-6 px-3 border-r border-slate-100 bg-white overflow-y-auto z-20">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-3 mb-2">Navigation</p>
        {TABS_CONFIG.map(({ id, label, icon: Icon, activeColor, activeBg, inactiveColor, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full
                ${active ? `${activeColor} ${activeBg}` : inactiveColor}`}
            >
              <div className="relative shrink-0">
                <Icon size={18} />
                {badge && myAppsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                    {myAppsCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navigation;
