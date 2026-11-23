import React from 'react';
import { Share2, X } from 'lucide-react';
import { t } from '../i18n/index.js';

/**
 * Barre flottante du mode sélection : nombre d'apps choisies, partage du lien
 * et sortie du mode. Placée au-dessus de la navigation basse sur mobile.
 */
const SelectionShareBar = ({ count, onShare, onCancel, isMobile = true }) => (
  <div
    className={`fixed left-0 right-0 z-40 px-4 ${isMobile ? 'bottom-20' : 'bottom-6'}`}
    role="region"
    aria-label={t('ui.selection.start')}
  >
    <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-2">
      <button
        onClick={onCancel}
        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
        aria-label={t('ui.selection.cancel')}
      >
        <X size={20} />
      </button>
      <p className="flex-1 min-w-0 text-sm font-bold truncate">
        {count > 0 ? t('ui.selection.count', { count }) : t('ui.selection.hint')}
      </p>
      <button
        onClick={onShare}
        disabled={count === 0}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 transition-colors"
      >
        <Share2 size={16} /> {t('ui.selection.share')}
      </button>
    </div>
  </div>
);

export default SelectionShareBar;
