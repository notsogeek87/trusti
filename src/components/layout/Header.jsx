import React from 'react';
import { HelpCircle } from 'lucide-react';
import TrustiLogo from '../ui/TrustiLogo';

/**
 * Header de l'application
 */
const Header = ({ showExplainer, onToggleExplainer }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrustiLogo className="w-9 h-9" />
          <h1 className="text-md font-black tracking-tight text-slate-900 leading-none">
            TrustiScore
          </h1>
        </div>
        
        {/* Bouton d'aide */}
        <div className="relative">
          {!showExplainer && (
            <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25"></span>
          )}
          <button 
            onClick={onToggleExplainer} 
            className={`relative p-2.5 rounded-full transition-all duration-300 shadow-sm ${
              showExplainer 
                ? 'bg-indigo-600 text-white scale-90' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
            aria-label="Aide et explications"
          >
            <HelpCircle size={22} className={!showExplainer ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
