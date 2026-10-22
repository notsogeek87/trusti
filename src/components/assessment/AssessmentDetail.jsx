import React, { useState } from 'react';
import { AlertTriangle, HelpCircle, ExternalLink, Eye, Hourglass, Info, Landmark, MapPin, ShieldCheck, Wrench } from 'lucide-react';

const CONFIDENCE_LABEL = { high: 'Confiance élevée', medium: 'Confiance moyenne', low: 'Confiance faible' };

// Icône et explication pédagogique par critère (clés de rubric.json).
const CRITERION_META = {
  controle: { Icon: Wrench, help: "Peut-on garder la main sur l'app et ses données ? On regarde l'open source, la possibilité de partir et l'indépendance vis-à-vis des GAFAM." },
  conformite: { Icon: ShieldCheck, help: "L'éditeur respecte-t-il le RGPD, et peut-on le prouver ? On cherche un DPO et des certifications (SecNumCloud, ISO 27001...)." },
  gouvernance: { Icon: Landmark, help: "Qui possède l'éditeur et quelles lois s'imposent à lui ? Une société américaine ou chinoise peut être forcée de livrer des données (Cloud Act)." },
  localisation: { Icon: MapPin, help: "Où sont stockées les données, physiquement ? En Europe, elles restent sous les normes européennes." },
  transparence: { Icon: Eye, help: "L'éditeur explique-t-il clairement ce qu'il fait de vos données ? On lit les CGU, les rapports annuels et la procédure de droit à l'oubli." },
};
const FALLBACK_META = { Icon: HelpCircle, help: null };

// Couleur de la pastille selon le niveau (le texte du niveau reste affiché à côté).
const tileTone = points => {
  if (points === null || points === undefined) return 'bg-slate-100 text-slate-400';
  if (points <= 1) return 'bg-rose-50 text-rose-600';
  if (points === 2) return 'bg-amber-50 text-amber-600';
  return 'bg-emerald-50 text-emerald-600';
};

// Confiance : 1 à 3 barres de signal.
const ConfidenceSignal = ({ confidence }) => {
  const level = { low: 1, medium: 2, high: 3 }[confidence] || 0;
  return (
    <span className="inline-flex items-end gap-px h-2.5 mr-1" aria-hidden="true">
      {[1, 2, 3].map(i => (
        <span key={i} className={`w-[3px] rounded-sm ${i <= level ? 'bg-slate-400' : 'bg-slate-200'}`} style={{ height: 3 + i * 3 }} />
      ))}
    </span>
  );
};

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

const CriterionItem = ({ c }) => {
  const [open, setOpen] = useState(false);
  const { Icon, help } = CRITERION_META[c.key] || FALLBACK_META;
  const tile = `shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${tileTone(c.points)}`;
  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className="flex gap-2.5">
        {help ? (
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
            aria-label={`Que mesure « ${c.name} » ?`} className={`${tile} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}>
            <Icon size={16} />
          </button>
        ) : (
          <span className={tile} aria-hidden="true"><Icon size={16} /></span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-800">{c.name}</span>
            <LevelBar points={c.points} />
          </div>
          {c.levelTitle && <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">{c.levelTitle}</p>}
          {c.rationale && <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{c.rationale}</p>}
          <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center">
            <ConfidenceSignal confidence={c.confidence} />
            <span>{CONFIDENCE_LABEL[c.confidence]}</span>
            {c.provisional && (
              <span className="ml-1.5 inline-flex items-center gap-1 text-amber-700 font-semibold">
                · <Hourglass size={10} /> Note provisoire
              </span>
            )}
          </p>
          {c.sources.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {c.sources.map((s, i) => <SourceLink key={i} source={s} />)}
            </ul>
          )}
          {open && help && (
            <p className="mt-1.5 text-xs text-slate-700 leading-snug bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Ce que ça mesure</span>
              {help}
            </p>
          )}
        </div>
      </div>
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
        <p className="text-[11px] text-slate-400 mb-2">Appuyer sur une icône pour comprendre le critère.</p>
      )}

      {hasCriteria && (
        <ul className="divide-y divide-slate-100">
          {criteria.map(c => <CriterionItem key={c.key} c={c} />)}
        </ul>
      )}
    </div>
  );
};

export default AssessmentDetail;
