import React from 'react';
import { t } from '../../i18n/index.js';
import SourceLink from './SourceLink';

// Pastille de la valeur observée selon sa lecture (le texte reste toujours affiché).
const TONE_CLASS = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bad: 'bg-rose-50 text-rose-700 border-rose-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  unknown: 'bg-amber-50 text-amber-700 border-amber-200 border-dashed',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  missing: 'bg-white text-slate-400 border-slate-200 border-dashed',
};
export const DOT_CLASS = { good: 'bg-emerald-500', bad: 'bg-rose-500', warn: 'bg-amber-400', unknown: 'bg-amber-300', neutral: 'bg-slate-300', missing: 'bg-slate-200' };

/** Points de couleur : un par donnée, pour lire un critère d'un coup d'œil sans l'ouvrir. */
export const FactDots = ({ rows }) => (
  <span className="flex gap-0.5" aria-hidden="true">
    {rows.map(r => <span key={r.key} className={`w-1.5 h-1.5 rounded-full ${DOT_CLASS[r.tone]}`} />)}
  </span>
);

const FactRow = ({ item }) => (
  <li className="py-2 first:pt-1 last:pb-0">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800">{t(`assessment.facts.items.${item.key}`)}</p>
        <p className="text-[10px] text-slate-400 leading-snug">
          <span className="font-semibold uppercase tracking-wide">{t('assessment.facts.expected.label')}</span> {item.expected}
        </p>
      </div>
      <span className={`shrink-0 max-w-[50%] text-right text-[11px] font-bold border rounded-lg px-1.5 py-0.5 ${TONE_CLASS[item.tone]}`}>
        {item.observed ?? t('assessment.facts.notFilled')}
      </span>
    </div>
    {item.siteOnly && (
      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{t('assessment.facts.siteOnly')}</p>
    )}
    {(item.countries.length > 0 || item.detail) && (
      <p className="text-[11px] text-slate-600 mt-0.5">
        {item.countries.length > 0 && <span>{t('assessment.facts.countries', { countries: item.countries.join(', ') })}</span>}
        {item.countries.length > 0 && item.detail && ' · '}
        {item.detail}
      </p>
    )}
    {item.sources.length > 0 && (
      <ul className="mt-0.5 space-y-0.5">
        {item.sources.map((s, i) => <SourceLink key={i} source={s} />)}
      </ul>
    )}
  </li>
);

/**
 * Données vérifiées d'un critère : pour chaque donnée attendue, la valeur observée et sa source.
 * Lignes construites par buildCriterionFacts (src/utils/assessmentFacts.js).
 */
const FactList = ({ rows }) => (
  <div className="mt-2 border border-slate-200 rounded-xl px-2.5 py-1.5">
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('assessment.facts.heading')}</p>
    <ul className="divide-y divide-slate-100">
      {rows.map(item => <FactRow key={item.key} item={item} />)}
    </ul>
  </div>
);

export default FactList;
