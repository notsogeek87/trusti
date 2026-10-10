import React from 'react';
import { AlertTriangle, ExternalLink, Info } from 'lucide-react';

const CONFIDENCE_LABEL = { high: 'Confiance élevée', medium: 'Confiance moyenne', low: 'Confiance faible' };

// Barre de niveau : 0 à 4 segments remplis (0 = niveau le plus faible).
const LevelBar = ({ points }) => (
  <div className="flex gap-0.5 shrink-0" role="img" aria-label={points === null ? 'Non évalué' : `Niveau ${points} sur 4`}>
    {[0, 1, 2, 3].map(i => (
      <div key={i} className={`h-1.5 w-5 rounded-full ${points !== null && i < points ? 'bg-indigo-500' : 'bg-slate-200'}`} />
    ))}
  </div>
);

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
        <span>Connaissance générale</span>
      )}
      {source.toConfirm && (
        <span className="ml-1.5 inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-px font-semibold">
          <AlertTriangle size={10} /> Information non vérifiée, à confirmer
        </span>
      )}
      {source.quote && <q className="block mt-0.5 text-slate-400 italic">{source.quote}</q>}
    </li>
  );
};

/**
 * Détail d'évaluation TrustiScore d'une app : score, critères, justifications et
 * sources. Les sources « background » portent la mention « à confirmer ».
 * Données : useAssessment -> GET /api/apps?assessment_for=:id.
 */
const AssessmentDetail = ({ status, assessment }) => {
  if (status === 'loading') {
    return <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 h-32 animate-pulse" />;
  }
  if (!assessment) return null;

  const { score, scoreRange, provisional, overridden, computedGrade, grade, hasUnverifiedSources, criteria } = assessment;
  const hasCriteria = criteria.length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3">Détail de l'évaluation</h3>

      {score !== null && (
        <p className="text-sm text-slate-700 mb-1">
          <span className="font-black">{score}/100</span>
          {provisional && scoreRange && scoreRange.min !== scoreRange.max && (
            <span className="text-slate-500"> (provisoire : entre {scoreRange.min} et {scoreRange.max})</span>
          )}
        </p>
      )}
      {!hasCriteria && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Note fixée par l'équipe Trusti, sans évaluation critère par critère.
        </p>
      )}
      {overridden && hasCriteria && computedGrade && computedGrade !== grade && (
        <p className="text-xs text-slate-500 leading-relaxed mb-2">
          Le calcul donnait {computedGrade} ; la note finale {grade} a été fixée par l'équipe Trusti.
        </p>
      )}
      {hasUnverifiedSources && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2">
          Certaines informations ne sont pas encore vérifiées sur une source et restent à confirmer.
        </p>
      )}

      {hasCriteria && (
        <p className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 mb-3 leading-snug">
          <Info size={12} className="shrink-0 mt-px text-slate-400" />
          <span>
            Ces éléments sont des repères <span className="font-semibold">non exhaustifs</span> : ils éclairent la note
            sans l'expliquer entièrement. L'évaluation complète repose sur d'autres informations qui ne sont pas toutes
            affichées ici.
          </span>
        </p>
      )}

      {hasCriteria && (
        <ul className="divide-y divide-slate-100">
          {criteria.map(c => (
            <li key={c.key} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-800">{c.name}</span>
                <LevelBar points={c.points} />
              </div>
              {c.levelTitle && <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">{c.levelTitle}</p>}
              {c.rationale && <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{c.rationale}</p>}
              <p className="text-[11px] text-slate-400 mt-0.5">
                {CONFIDENCE_LABEL[c.confidence]}
                {c.provisional && <span className="text-amber-700 font-semibold"> · Note provisoire</span>}
              </p>
              {c.sources.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {c.sources.map((s, i) => <SourceLink key={i} source={s} />)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentDetail;
