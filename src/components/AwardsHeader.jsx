import React from 'react';
import InlineSpinner from './ui/InlineSpinner';

/** En-tête de l'onglet « Nos recommandations ». */
const AwardsHeader = ({ isLoading }) => (
  <div className="mb-3 text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        Nos Awards
      </p>
      {isLoading && <InlineSpinner />}
    </div>
    <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
      Le podium des apps les plus respectueuses (TrustiScore A ou B), par catégorie
    </p>
  </div>
);

export default AwardsHeader;
