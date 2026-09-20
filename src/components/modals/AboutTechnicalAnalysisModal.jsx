import React from 'react';
import { X, Info } from 'lucide-react';

/**
 * Petite page explicative sur les limites de l'analyse technique (spec §16).
 * Accessible depuis la section "Analyse technique" de AppDetailModal.
 */
const AboutTechnicalAnalysisModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Info size={20} className="text-indigo-600" /> À propos de l'analyse
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          Trusti-Score analyse localement les informations accessibles depuis
          les applications installées sur votre téléphone.
        </p>
        <p>
          La présence d'une permission, d'un SDK ou d'une bibliothèque ne
          signifie pas nécessairement que cette fonctionnalité est
          effectivement utilisée par l'application.
        </p>
        <p>
          Les résultats sont basés sur des signatures et informations
          techniques détectables et peuvent être incomplets.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-2">
          <p>
            Cette analyse se déroule entièrement sur votre appareil : aucune
            donnée n'est envoyée à un serveur sans action explicite de votre
            part (ex. export JSON que vous partagez vous-même).
          </p>
          <p>
            L'analyse technique est indépendante du Trusti-Score, qui reste
            la note de la communauté/de l'équipe Trusti sur l'application.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AboutTechnicalAnalysisModal;
