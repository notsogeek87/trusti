import React from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';
import { t } from '../../i18n/index.js';
import { buildFactSections } from '../../utils/assessmentFacts.js';
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
const DOT_CLASS = { good: 'bg-emerald-500', bad: 'bg-rose-500', warn: 'bg-amber-400', unknown: 'bg-amber-300', neutral: 'bg-slate-300', missing: 'bg-slate-200' };

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
 * Fiche factuelle de l'évaluation : pour chaque donnée attendue (souveraineté juridique, technique,
 * RGPD, certifications), la valeur observée et sa source. N'affiche rien tant que la fiche est vide.
 * Données attendues : src/constants/assessmentFacts.js ; valeurs : colonne app_assessments.facts.
 */
const AssessmentFacts = ({ facts }) => {
  const sections = buildFactSections(facts);
  if (!sections) return null;
  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tight text-slate-500">
        <ClipboardList size={12} /> {t('assessment.facts.title')}
      </p>
      <p className="text-[11px] text-slate-500 leading-snug mb-1.5">{t('assessment.facts.intro')}</p>
      <div className="space-y-1.5">
        {sections.map(section => (
          <details key={section.key} className="group border border-slate-200 rounded-xl px-2.5 py-1.5">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="text-xs font-black text-slate-800">{t(`assessment.facts.sections.${section.key}`)}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="flex gap-0.5" aria-hidden="true">
                  {section.items.map(i => <span key={i.key} className={`w-1.5 h-1.5 rounded-full ${DOT_CLASS[i.tone]}`} />)}
                </span>
                <span className="text-[10px] text-slate-400">{t('assessment.facts.filled', { filled: section.filled, total: section.items.length })}</span>
                <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <ul className="divide-y divide-slate-100 mt-1">
              {section.items.map(item => <FactRow key={item.key} item={item} />)}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
};

export default AssessmentFacts;
