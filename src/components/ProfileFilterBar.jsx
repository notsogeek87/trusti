import React from 'react';
import { Scale, MapPin, Lock, Code2, BadgeCheck, Share2, X } from 'lucide-react';
import { APP_PROFILES } from '../utils/appProfiles.js';
import InlineSpinner from './ui/InlineSpinner';
import { t } from '../i18n/index.js';

const ICONS = { Scale, MapPin, Lock, Code2, BadgeCheck };

/**
 * Filtres avancés du catalogue (onglet Applications) : pastilles de profils (cumulables),
 * option « inclure les données non vérifiées », nombre d'apps retenues, partage du lien.
 * Les profils lisent des faits observés dans la fiche factuelle, pas une conformité.
 */
const ProfileFilterBar = ({
  profiles,
  includeUnknown,
  onToggleProfile,
  onIncludeUnknownChange,
  onClear,
  onShare,
  count,
  isLoading = false,
  hasError = false,
}) => {
  const isActive = profiles.length > 0;
  return (
    <div className="mb-3">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-center mb-2">
        {t('ui.profiles.title')}
      </p>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 pb-1.5 px-0.5" role="group" aria-label={t('ui.profiles.title')}>
          {APP_PROFILES.map(({ key, icon }) => {
            const Icon = ICONS[icon];
            const isSelected = profiles.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isSelected}
                title={t(`ui.profiles.items.${key}.description`)}
                onClick={() => onToggleProfile(key)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all inline-flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                {Icon && <Icon size={12} aria-hidden="true" />}
                {t(`ui.profiles.items.${key}.label`)}
              </button>
            );
          })}
        </div>
      </div>

      {isActive && (
        <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2.5 text-xs text-slate-600 space-y-2">
          <ul className="space-y-0.5">
            {profiles.map(key => (
              <li key={key}>
                <span className="font-bold text-emerald-800">{t(`ui.profiles.items.${key}.label`)} : </span>
                {t(`ui.profiles.items.${key}.description`)}
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-600"
              checked={includeUnknown}
              onChange={(e) => onIncludeUnknownChange(e.target.checked)}
            />
            <span>{t('ui.profiles.includeUnknown')}</span>
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-700 inline-flex items-center gap-1.5" aria-live="polite">
              {isLoading ? <InlineSpinner /> : (hasError ? t('ui.profiles.error') : t('ui.profiles.count', { count }))}
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={onShare}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-full hover:bg-emerald-100"
              >
                <Share2 size={12} aria-hidden="true" /> {t('ui.profiles.share')}
              </button>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-full hover:bg-slate-100"
              >
                <X size={12} aria-hidden="true" /> {t('ui.profiles.clear')}
              </button>
            </span>
          </div>
          <p className="text-[10px] text-slate-400">{t('ui.profiles.disclaimer')}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileFilterBar;
