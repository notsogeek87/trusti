import React from 'react';
import { Globe, Zap, Star, Award } from 'lucide-react';
import { TABS } from '../../constants/tabs';

/**
 * Navigation en bas de l'écran
 */
const Navigation = ({ activeTab, onTabChange, myAppsCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-4 max-w-md mx-auto flex justify-around items-center z-40 rounded-t-[2.5rem] shadow-2xl">
      <button 
        onClick={() => onTabChange(TABS.MY_APPS)} 
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === TABS.MY_APPS 
            ? "text-indigo-600" 
            : "text-slate-300 hover:text-indigo-400"
        }`}
      >
        <div className="relative">
          <Zap size={22} />
          {myAppsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {myAppsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Mes Apps</span>
      </button>
      
      <button 
        onClick={() => onTabChange(TABS.APPLICATIONS)} 
        className={`flex flex-col items-center gap-1.5 transition-all ${
          activeTab === TABS.APPLICATIONS 
            ? "text-purple-600 scale-110" 
            : "text-slate-400 hover:text-purple-400"
        }`}
      >
        <div className="relative">
          {activeTab === TABS.APPLICATIONS && (
            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-30 animate-pulse-subtle"></div>
          )}
          <Globe size={activeTab === TABS.APPLICATIONS ? 28 : 24} className="relative z-10 transition-all" />
        </div>
        <span className={`font-black uppercase tracking-widest relative z-10 ${
          activeTab === TABS.APPLICATIONS ? 'text-[10px]' : 'text-[10px]'
        }`}>
          Catalogue
        </span>
      </button>
      
      <button 
        onClick={() => onTabChange(TABS.TOP_ALTERNATIVES)} 
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === TABS.TOP_ALTERNATIVES 
            ? "text-emerald-600" 
            : "text-slate-300 hover:text-emerald-400"
        }`}
      >
        <Award size={22} />
        <span className="text-[10px] font-black uppercase tracking-widest">Awards</span>
      </button>
    </nav>
  );
};

export default Navigation;
