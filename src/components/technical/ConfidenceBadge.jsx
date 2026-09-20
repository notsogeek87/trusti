import React from 'react';
import { CONFIDENCE_DOTS, CONFIDENCE_LABEL } from '../../technical';

/**
 * Petit badge de confiance pour une détection Google/SDK/tracker — la
 * fiabilité du signal de détection, PAS un jugement bon/mauvais sur
 * l'élément détecté. Volontairement neutre (pastilles indigo, pas de
 * vert/jaune/rouge) pour ne jamais être confondu avec les signaux
 * "favorable/à surveiller" utilisés ailleurs dans l'analyse technique (voir
 * technicalSignals.js) : une détection à "forte certitude" d'un tracker
 * publicitaire n'est pas une bonne nouvelle. Ne jamais présenter une
 * détection sans son niveau de confiance à côté.
 */
const ConfidenceBadge = ({ confidence }) => {
  const filled = CONFIDENCE_DOTS[confidence] ?? 0;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 shrink-0">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? 'bg-indigo-500' : 'bg-slate-200'}`} />
        ))}
      </span>
      <span>{CONFIDENCE_LABEL[confidence] || 'Détection : non déterminée'}</span>
    </span>
  );
};

export default ConfidenceBadge;
