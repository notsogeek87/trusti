import React from 'react';

/**
 * Modal de bienvenue affiché lors de la première visite
 */
const WelcomeModal = ({ onFirstTimeYes, onFirstTimeNo }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30 max-w-sm w-full overflow-hidden animate-in zoom-in duration-500">
        {/* En-tête avec logo */}
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-6 text-center border-b border-indigo-500/20">
          <div className="flex justify-center mb-3">
            <img
              src="/assets/logo.png"
              alt="TrustiScore"
              className="w-16 h-16 animate-in spin-in duration-700"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">
            Bienvenue sur TrustiScore !
          </h2>
          <p className="text-slate-300 text-sm">
            Votre compagnon pour une souveraineté numérique
          </p>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-base text-white font-medium mb-1.5">
              Est-ce votre première visite ?
            </p>
            <p className="text-sm text-slate-400">
              Je peux vous guider à travers les fonctionnalités
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
                <span>Oui, c'est ma première fois</span>
              </span>
            </button>

            <button
              onClick={onFirstTimeNo}
              className="w-full text-slate-300 active:text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-xs"
            >
              <span className="flex items-center justify-center gap-1.5">
                <span>👍</span>
                <span>Non, je connais et souhaite me connecter</span>
              </span>
            </button>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 pb-6 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Vous pourrez toujours accéder à l'aide depuis le menu
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
