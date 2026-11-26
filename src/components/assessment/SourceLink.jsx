import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { t } from '../../i18n/index.js';

/** Source d'une évaluation (critère ou donnée de la fiche factuelle) : lien, mention « à confirmer », citation. */
const SourceLink = ({ source }) => {
  const host = source.url ? source.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : null;
  return (
    <li className="text-[11px] text-slate-500 leading-snug">
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold break-all">
          <ExternalLink size={10} className="shrink-0" /> {host}
        </a>
      ) : (
        <span>{t('assessment.detail.generalKnowledge')}</span>
      )}
      {source.toConfirm && (
        <span className="ml-1.5 inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-px font-semibold">
          <AlertTriangle size={10} /> {t('assessment.detail.unverified')}
        </span>
      )}
      {source.quote && <q className="block mt-0.5 text-slate-400 italic">{source.quote}</q>}
    </li>
  );
};

export default SourceLink;
