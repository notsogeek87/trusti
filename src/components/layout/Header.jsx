import React from 'react';
import { HelpCircle, LogOut, User, RotateCcw, Settings, Lock, Smartphone, Monitor } from 'lucide-react';

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
  onRequestAdminUnlock,
  forceMobile,
  onToggleViewMode,
}) => {
  // Détection de l'environnement local
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-full md:max-w-none px-4 md:px-6 py-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img 
            src="/assets/logo.png" 
            alt="TrustiScore" 
            className="w-8"
          />
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            TrustiScore
          </h1>
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
                // Déverrouillé : roue crantée (Settings) partout
                <button
                  onClick={onOpenAdmin}
                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-all"
                  title="Administration des Applications"
                >
                  <Settings size={18} />
                </button>
              ) : (
                // Verrouillé : cadenas (Lock) partout
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
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2"
              >
                <User size={16} />
                Se connecter
              </button>
              
              {/* Cadenas visible en local même sans connexion */}
              {isLocal && (
                <button
                  onClick={onRequestAdminUnlock}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                  title="Mode Admin (connexion requise)"
                >
                  <Lock size={18} />
                </button>
              )}
            </div>
          )}
          
          {/* Toggle mobile / desktop (visible sur desktop uniquement) */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                forceMobile
                  ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              title={forceMobile ? 'Passer en mode desktop' : 'Passer en mode mobile'}
            >
              {forceMobile ? <Monitor size={14} /> : <Smartphone size={14} />}
              <span>{forceMobile ? 'Desktop' : 'Mobile'}</span>
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
