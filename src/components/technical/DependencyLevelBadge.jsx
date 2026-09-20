import React from 'react';
import { DEPENDENCY_LEVEL_EMOJI, DEPENDENCY_LEVEL_LABEL, DEPENDENCY_LEVEL_EXPLANATION } from '../../technical';

/**
 * Niveau de dépendance technique — bien distinct du Trusti-Score. Le texte
 * d'explication est toujours affiché à côté pour éviter toute confusion avec
 * un score de sécurité/confidentialité/qualité (voir spec §9).
 */
const DependencyLevelBadge = ({ level }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{DEPENDENCY_LEVEL_EMOJI[level] || '⚪'}</span>
      <span className="font-black text-sm text-slate-800">Niveau de dépendance : {DEPENDENCY_LEVEL_LABEL[level] || 'Non déterminé'}</span>
    </div>
    <p className="text-[11px] text-slate-500 leading-relaxed">{DEPENDENCY_LEVEL_EXPLANATION}</p>
  </div>
);

export default DependencyLevelBadge;
