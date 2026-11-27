import React from 'react';
import { Scale, MapPin, Lock, Code2, BadgeCheck, Check } from 'lucide-react';
import { APP_PROFILES } from '../utils/appProfiles.js';
import { t } from '../i18n/index.js';

const ICONS = { Scale, MapPin, Lock, Code2, BadgeCheck };

/**
 * Choix des filtres par profils (hors CLOUD Act, open source…), dans un menu de filtres
 * (catalogue et « Mes Apps ») : une ligne par profil (cumulables), option « inclure les
 * données non vérifiées » et rappel qu'il s'agit de faits observés, pas d'une conformité.
 */
const ProfileFilterOptions = ({ profiles, includeUnknown, onToggleProfile, onIncludeUnknownChange }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t('ui.profiles.title')}</p>
    <div className="space-y-1" role="group" aria-label={t('ui.profiles.title')}>
      {APP_PROFILES.map(({ key, icon }) => {
        const Icon = ICONS[icon];
        const isSelected = profiles.includes(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggleProfile(key)}
            className={`w-full flex items-start gap-2 text-left px-2 py-1.5 rounded-xl border transition-colors ${
              isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-transparent hover:bg-slate-50'
            }`}
          >
            <span className={`mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
              {Icon && <Icon size={14} aria-hidden="true" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-[12px] font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                {t(`ui.profiles.items.${key}.label`)}
              </span>
              <span className="block text-[10px] leading-snug text-slate-400">{t(`ui.profiles.items.${key}.description`)}</span>
            </span>
            {isSelected && <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
    <label className="mt-2 flex items-center gap-2 px-2 text-[11px] text-slate-600 cursor-pointer select-none">
      <input
        type="checkbox"
        className="h-4 w-4 accent-emerald-600"
        checked={includeUnknown}
        onChange={(e) => onIncludeUnknownChange(e.target.checked)}
      />
      <span>{t('ui.profiles.includeUnknown')}</span>
    </label>
    <p className="mt-1.5 px-2 text-[10px] text-slate-400">{t('ui.profiles.disclaimer')}</p>
  </div>
);

export default ProfileFilterOptions;
