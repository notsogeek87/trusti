import React from 'react';
import InlineSpinner from './ui/InlineSpinner';
import { t } from '../i18n/index.js';

/** En-tête de l'onglet « Nos recommandations ». */
const AwardsHeader = ({ isLoading }) => (
  <div className="mb-3 text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {t('cards.awards.title')}
      </p>
      {isLoading && <InlineSpinner />}
    </div>
    <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
      {t('cards.awards.subtitle')}
    </p>
  </div>
);

export default AwardsHeader;
