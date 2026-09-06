import React from 'react';
import { AGE_MODE } from '../../utils/ageMode';

/**
 * Demande d'âge affichée au tout premier démarrage, avant tout le reste.
 * Détermine si l'app s'affiche en mode classique (15 ans ou plus) ou dans
 * un style graphique dédié aux moins de 15 ans.
 */
const AgePromptModal = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30 max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-6 text-center border-b border-indigo-500/20">
          <div className="flex justify-center mb-3">
            <img src="/assets/logo.png" alt="TrustiScore" className="w-16 h-16" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">
            Avant de commencer
          </h2>
          <p className="text-slate-300 text-sm">
            Quel âge as-tu ?
          </p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={() => onSelect(AGE_MODE.ADULT)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 active:from-indigo-600 active:to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🧑</span>
              <span>J'ai 15 ans ou plus</span>
            </span>
          </button>

          <button
            onClick={() => onSelect(AGE_MODE.KID)}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 active:from-amber-500 active:to-orange-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🧒</span>
              <span>J'ai moins de 15 ans</span>
            </span>
          </button>
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Cela nous permet d'adapter l'affichage de l'application
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgePromptModal;
