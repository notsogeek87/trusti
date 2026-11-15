import React from 'react';
import { t } from '../../i18n/index.js';
import LanguageSwitcher from '../ui/LanguageSwitcher';

/**
 * Modal de bienvenue affiché lors de la première visite
 */
const WelcomeModal = ({ onFirstTimeYes, onFirstTimeNo }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30 max-w-sm w-full overflow-hidden animate-in zoom-in duration-500">
        <div className="absolute top-3 right-3 z-10"><LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" /></div>
        {/* En-tête avec logo */}
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 p-6 text-center border-b border-indigo-500/20">
          <div className="flex justify-center mb-3">
            <img
              src="/assets/logo.png"
              alt="Trusti"
              className="w-16 h-16 animate-in spin-in duration-700"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">
            {t('onboarding.welcome.title')}
          </h2>
          <p className="text-slate-300 text-sm">
            {t('onboarding.welcome.subtitle')}
          </p>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-base text-white font-medium mb-1.5">
              {t('onboarding.welcome.question')}
            </p>
            <p className="text-sm text-slate-400">
              {t('onboarding.welcome.offer')}
            </p>
          </div>

          {/* Boutons de choix */}
          <div className="space-y-3">
            <button
              onClick={onFirstTimeYes}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 active:from-indigo-600 active:to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span>✨</span>
                <span>{t('onboarding.welcome.yes')}</span>
              </span>
            </button>

            {onFirstTimeNo && (
              <button
                onClick={onFirstTimeNo}
                className="w-full text-slate-300 active:text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-xs"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span>👍</span>
                  <span>{t('onboarding.welcome.no')}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 pb-6 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('onboarding.welcome.helpLater')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
