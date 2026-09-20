import React from 'react';
import { CONFIDENCE_EMOJI, CONFIDENCE_LABEL } from '../../technical';

/**
 * Petit badge de confiance (🟢 forte / 🟡 probable / ⚪ indéterminé) pour une
 * détection Google/SDK/tracker. Ne jamais présenter une détection sans son
 * niveau de confiance à côté.
 */
const ConfidenceBadge = ({ confidence }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 shrink-0">
    <span>{CONFIDENCE_EMOJI[confidence] || '⚪'}</span>
    <span>{CONFIDENCE_LABEL[confidence] || 'Non déterminé'}</span>
  </span>
);

export default ConfidenceBadge;
