import React, { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ProfileFilterOptions from './ProfileFilterOptions';
import { t } from '../i18n/index.js';

/**
 * Filtres avancés du catalogue derrière une seule icône, à côté de la recherche (comme
 * « Mes Apps ») : l'écran garde une seule ligne de pastilles (les catégories).
 * Une pastille sur l'icône signale un filtre actif.
 */
const CatalogFilterMenu = ({ profiles, includeUnknown, onToggleProfile, onIncludeUnknownChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isActive = profiles.length > 0;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative h-[46px] w-[46px] flex items-center justify-center rounded-2xl border shadow-sm transition-colors ${
          isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700'
        }`}
        aria-label={t('ui.profiles.button')}
        aria-expanded={isOpen}
        title={t('ui.profiles.button')}
      >
        <SlidersHorizontal size={17} />
        {isActive && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-lg border border-slate-100 p-3 z-20 space-y-2">
          <ProfileFilterOptions
            profiles={profiles}
            includeUnknown={includeUnknown}
            onToggleProfile={onToggleProfile}
            onIncludeUnknownChange={onIncludeUnknownChange}
          />
          <div className="flex items-center justify-between px-2 pt-1">
            {isActive ? (
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2"
              >
                {t('ui.profiles.clear')}
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full"
            >
              {t('ui.profiles.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilterMenu;
