import React from 'react';
import { HelpCircle, LogOut, User, RotateCcw, Settings } from 'lucide-react';

/**
 * Header de l'application
 */
const Header = ({ showExplainer, onToggleExplainer, currentUser, onLogout, onLogin, onResetUserData, onOpenAdmin }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/assets/logo.png" 
            alt="TrustiScore" 
            className="w-8"
          />
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            TrustiScore
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Utilisateur connecté */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full flex items-center gap-2">
                <User size={14} />
                <span className="text-xs font-bold">{currentUser}</span>
              </div>
              {currentUser === 'admin0614' && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                  title="Administration Alternatives"
                >
                  <Settings size={18} />
                </button>
              )}
              <button
                onClick={onResetUserData}
                className="p-2 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                title="Réinitialiser mes données (démo)"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                title="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            >
              <User size={16} />
              Se connecter
            </button>
          )}
          
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
      </div>
    </header>
  );
};

export default Header;
