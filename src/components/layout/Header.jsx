import React from 'react';
import { HelpCircle, LogOut, User, RotateCcw, Settings, Lock } from 'lucide-react';
import { useIsMobile } from '../../contexts/ViewModeContext';

const Header = ({
  currentUser,
  onLogout,
  onLogin,
  onResetUserData,
  onOpenAdmin,
  onShowLandingPage,
  isAdminUnlocked,
  onRequestAdminUnlock,
}) => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-full md:max-w-none px-4 md:px-6 py-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/assets/logo.png"
            alt="TrustiScore"
            className="w-11 h-11 object-contain"
          />
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
            TrustiScore
          </h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink min-w-0">
          {currentUser ? (
            <div className="flex items-center gap-1 md:gap-2">
              <div className="bg-indigo-100 text-indigo-700 px-2 md:px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User size={14} className="flex-shrink-0" />
                <span className="hidden md:block text-xs font-bold truncate max-w-[120px]">{currentUser.email || currentUser}</span>
              </div>

              {isAdminUnlocked ? (
                <button
                  onClick={onOpenAdmin}
                  className="p-1.5 md:p-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-all"
                  title="Administration des Applications"
                >
                  <Settings size={18} />
                </button>
              ) : (
                <button
                  onClick={onRequestAdminUnlock}
                  className="p-1.5 md:p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                  title="Déverrouiller l'administration"
                >
                  <Lock size={18} />
                </button>
              )}

              {!isMobile && (
                <button
                  onClick={onResetUserData}
                  className="p-1.5 md:p-2.5 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                  title="Réinitialiser mes données (démo)"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-1.5 md:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
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
            </div>
          )}

          <button
            onClick={onShowLandingPage}
            className="p-1.5 md:p-2.5 rounded-full transition-all duration-300 shadow-sm bg-indigo-500 text-white hover:bg-indigo-600"
            aria-label="Aide et explications"
            title="À propos de TrustiScore"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
