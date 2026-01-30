import React from 'react';
import { Trophy, Globe, Zap, Star } from 'lucide-react';
import { TABS } from '../../constants/tabs';

/**
 * Navigation en bas de l'écran
 */
const Navigation = ({ activeTab, onTabChange, myAppsCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-4 px-6 max-w-md mx-auto flex justify-around z-40 rounded-t-[2.5rem] shadow-2xl">
      <button 
        onClick={() => onTabChange(TABS.SELECTION)} 
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === TABS.SELECTION 
            ? "text-purple-600" 
            : "text-slate-300 hover:text-purple-400"
        }`}
      >
        <Star size={24} />
        <span className="text-[8px] font-black uppercase tracking-widest">Sélection</span>
      </button>
      
      <button 
        onClick={() => onTabChange(TABS.TOP)} 
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === TABS.TOP 
            ? "text-slate-900" 
            : "text-slate-300 hover:text-slate-400"
        }`}
      >
        <Trophy size={24} />
        <span className="text-[8px] font-black uppercase tracking-widest">Classement</span>
      </button>
      
      <button 
        onClick={() => onTabChange(TABS.MY_APPS)} 
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === TABS.MY_APPS 
            ? "text-indigo-600" 
            : "text-slate-300 hover:text-indigo-400"
        }`}
      >
        <div className="relative">
          <Zap size={24} />
          {myAppsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {myAppsCount}
            </span>
          )}
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">Mes Apps</span>
      </button>
      
      <button 
        onClick={() => onTabChange(TABS.ALTERNATIVES)} 
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === TABS.ALTERNATIVES 
            ? "text-emerald-600" 
            : "text-slate-300 hover:text-emerald-400"
        }`}
      >
        <Globe size={24} />
        <span className="text-[8px] font-black uppercase tracking-widest">TrustiApps</span>
      </button>
    </nav>
  );
};

export default Navigation;
