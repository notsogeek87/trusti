import React from 'react';
import { HelpCircle, LogOut, User, RotateCcw, Settings, Lock, Trash2 } from 'lucide-react';

/**
 * Header de l'application
 */
const Header = ({ 
  currentUser, 
  onLogout, 
  onLogin, 
  onResetUserData, 
  onOpenAdmin, 
  onShowLandingPage,
  isAdminUnlocked,
  onRequestAdminUnlock
}) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img 
            src="/assets/logo.png" 
            alt="TrustiScore" 
            className="w-8"
          />
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            TrustiScore
          </h1>
          
          {/* Bouton de test pour vider le localStorage */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="p-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all flex items-center gap-1"
            title="Vider localStorage et recharger (Test)"
          >
            <Trash2 size={14} />
            <span className="text-[10px] font-bold">TEST</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink min-w-0">
          {/* Utilisateur connecté */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full flex items-center gap-2 max-w-[140px]">
                <User size={14} className="flex-shrink-0" />
                <span className="text-xs font-bold truncate">{currentUser.email || currentUser}</span>
              </div>
              
              {/* Bouton Lock ou Settings selon déverrouillage admin */}
              {isAdminUnlocked ? (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                  title="Administration Alternatives"
                >
                  <Settings size={18} />
                </button>
              ) : (
                <button
                  onClick={onRequestAdminUnlock}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                  title="Déverrouiller l'administration"
                >
                  <Lock size={18} />
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
          <button 
            onClick={onShowLandingPage} 
            className="p-2.5 rounded-full transition-all duration-300 shadow-sm bg-indigo-500 text-white hover:bg-indigo-600"
            aria-label="Aide et explications"
            title="À propos de TrustiScore"
          >
            <HelpCircle size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
