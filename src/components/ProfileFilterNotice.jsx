import React from 'react';
import InlineSpinner from './ui/InlineSpinner';
import { t } from '../i18n/index.js';

/**
 * Rappel discret des filtres avancés actifs du catalogue (repliés derrière l'icône) :
 * nombre d'apps, filtres, partage du lien et effacement, sur une ligne.
 */
const ProfileFilterNotice = ({ profiles, count, isLoading = false, hasError = false, onShare, onClear }) => (
  <div className="text-[11px] text-slate-400 -mt-1 mb-3 px-1" aria-live="polite">
    {isLoading ? <span className="inline-flex align-middle mr-1"><InlineSpinner /></span> : (
      <span className="font-bold text-slate-500">{hasError ? t('ui.profiles.error') : t('ui.profiles.count', { count })}</span>
    )}
    {' · '}
    {profiles.map(key => t(`ui.profiles.items.${key}.label`)).join(', ')}
    {' · '}
    <button type="button" onClick={onShare} className="font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2">
      {t('ui.profiles.share')}
    </button>
    {' · '}
    <button type="button" onClick={onClear} className="font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">
      {t('ui.profiles.clear')}
    </button>
  </div>
);

export default ProfileFilterNotice;
