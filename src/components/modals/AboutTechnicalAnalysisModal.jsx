import React from 'react';
import { X, Info } from 'lucide-react';
import { t } from '../../i18n/index.js';

/**
 * Petite page explicative sur les limites de l'analyse technique (spec §16).
 * Accessible depuis la section "Analyse technique" de AppDetailModal.
 */
const AboutTechnicalAnalysisModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Info size={20} className="text-indigo-600" /> {t('technical.ui.about')}
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          {t('technical.ui.aboutP1')}
        </p>
        <p>
          {t('technical.ui.aboutP2')}
        </p>
        <p>
          {t('technical.ui.aboutP3')}
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-2">
          <p>
            {t('technical.ui.aboutP4')}
          </p>
          <p>
            {t('technical.ui.aboutP5')}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AboutTechnicalAnalysisModal;
