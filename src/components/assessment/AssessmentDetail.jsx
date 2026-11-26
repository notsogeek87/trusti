import React from 'react';
import { ChevronDown, HelpCircle, ExternalLink, Eye, Hourglass, History, Info, Landmark, MapPin, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { isStrictlyBetterGrade } from '../../utils/alternatives';
import { formatDate, t } from '../../i18n/index.js';
import BoldText from '../ui/BoldText';
import SourceLink from './SourceLink';
import FactList, { FactDots } from './AssessmentFacts';
import { buildCriterionFacts } from '../../utils/assessmentFacts.js';
import { CRITERIA_ORDER } from '../../constants/assessmentFacts.js';

const confidenceLabel = (c) => (c ? t(`assessment.detail.confidence.${c}`) : '');

// Icône et explication pédagogique par critère (clés de rubric.json).
const CRITERION_META = {
  controle: { Icon: Wrench, get help() { return t('assessment.detail.help.controle'); } },
  conformite: { Icon: ShieldCheck, get help() { return t('assessment.detail.help.conformite'); } },
  gouvernance: { Icon: Landmark, get help() { return t('assessment.detail.help.gouvernance'); } },
  localisation: { Icon: MapPin, get help() { return t('assessment.detail.help.localisation'); } },
  transparence: { Icon: Eye, get help() { return t('assessment.detail.help.transparence'); } },
};
const FALLBACK_META = { Icon: HelpCircle, help: null };

// Titre du niveau atteint : grille fixe (critère × points), traduite ici ; sinon celui de la base.
const levelTitle = (c) => (CRITERION_META[c.key] && Number.isInteger(c.points) && c.points >= 0 && c.points <= 4
  ? t(`assessment.detail.levels.${c.key}.${c.points}`)
  : c.levelTitle);

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
  <div className="flex gap-0.5 shrink-0" role="img" aria-label={points === null ? t('assessment.detail.notRated') : t('assessment.detail.level', { points })}>
    {[0, 1, 2, 3].map(i => (
      <div key={i} className={`h-1.5 w-5 rounded-full ${points !== null && i < points ? 'bg-indigo-500' : 'bg-slate-200'}`} />
    ))}
  </div>
);

// Un critère : niveau et points de couleur des données en résumé ; justification, sources,
// données vérifiées (fiche factuelle) et explication en ouvrant la carte.
const CriterionItem = ({ c, facts }) => {
  const { Icon, help } = CRITERION_META[c.key] || FALLBACK_META;
  const tile = `shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${tileTone(c.points)}`;
  const rated = c.points !== null && c.points !== undefined;
  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <details className="group">
        <summary className="flex gap-2.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className={tile} aria-hidden="true"><Icon size={16} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-800">{CRITERION_META[c.key] ? t(`assessment.detail.criteria.${c.key}`) : c.name}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                {rated && <LevelBar points={c.points} />}
                <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" />
              </span>
            </span>
            <span className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-indigo-700">{rated ? levelTitle(c) : t('assessment.detail.notRated')}</span>
              {facts && <FactDots rows={facts} />}
            </span>
          </span>
        </summary>
        <div className="pl-[42px] mt-1">
          {c.rationale && <p className="text-xs text-slate-600 leading-relaxed">{c.rationale}</p>}
          {rated && (
            <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center">
              <ConfidenceSignal confidence={c.confidence} />
              <span>{confidenceLabel(c.confidence)}</span>
              {c.provisional && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-amber-700 font-semibold">
                  · <Hourglass size={10} /> {t('assessment.detail.provisional')}
                </span>
              )}
            </p>
          )}
          {c.sources.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {c.sources.map((s, i) => <SourceLink key={i} source={s} />)}
            </ul>
          )}
          {facts && <FactList rows={facts} />}
          {help && (
            <p className="mt-1.5 text-xs text-slate-700 leading-snug bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">{t('assessment.detail.measures')}</span>
              {help}
            </p>
          )}
        </div>
      </details>
    </li>
  );
};

const formatDay = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
};

// Historique de la note (gradeHistory, voir server/gradeChanges.js : buildGradeTimeline).
const GradeHistory = ({ history }) => {
  if (!history?.firstAssessedAt) return null;
  const { changes, firstAssessedAt } = history;
  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tight text-slate-500 mb-1.5">
        <History size={12} /> {t('assessment.detail.history')}
      </p>
      {changes.length === 0 ? (
        <p className="text-xs text-slate-500">{t('assessment.detail.unchanged', { date: formatDay(firstAssessedAt) })}</p>
      ) : (
        <ul className="space-y-1">
          {changes.map(c => {
            const up = isStrictlyBetterGrade(c.to, c.from);
            return (
              <li key={`${c.date}:${c.to}`} className="text-xs text-slate-600">
                <span className="text-slate-400">{formatDay(c.date)}</span>{' · '}
                <span className={`font-bold ${up ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {c.from} → {c.to} ({up ? t('assessment.detail.up') : t('assessment.detail.down')})
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/**
 * Détail d'évaluation TrustiScore d'une app : score et 5 critères ; chaque critère montre sa
 * justification, ses sources et les données vérifiées de la fiche factuelle qui s'y rattachent. Les sources « background » portent la mention « à confirmer ».
 * Données : useAssessment -> GET /api/apps?assessment_for=:id.
 */
const AssessmentDetail = ({ status, assessment, app = null }) => {
  if (status === 'loading') {
    return <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 h-32 animate-pulse" />;
  }
  if (!assessment) return null;

  const { score, scoreRange, provisional, overridden, computedGrade, grade, hasUnverifiedSources, criteria } = assessment;
  const criterionFacts = buildCriterionFacts(assessment.facts, app);
  // Critères notés, plus ceux qui n'ont que des données factuelles (note fixée par l'équipe).
  const items = [...criteria];
  if (criterionFacts) {
    for (const key of CRITERIA_ORDER) {
      if (!items.some(c => c.key === key)) items.push({ key, name: key, points: null, sources: [] });
    }
    items.sort((a, b) => CRITERIA_ORDER.indexOf(a.key) - CRITERIA_ORDER.indexOf(b.key));
  }
  const hasCriteria = criteria.length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3">{t('assessment.detail.title')}</h3>

      {score !== null && (
        <p className="text-sm text-slate-700 mb-1">
          <span className="font-black">{score}/100</span>
          {provisional && scoreRange && scoreRange.min !== scoreRange.max && (
            <span className="text-slate-500">{t('assessment.detail.provisionalRange', { min: scoreRange.min, max: scoreRange.max })}</span>
          )}
        </p>
      )}
      <a
        href={t('assessment.detail.discussUrl')}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl px-3 py-2.5 mb-3 transition-colors"
      >
        <MessageCircle size={14} className="shrink-0" />
        {t('assessment.detail.discuss')}
        <ExternalLink size={12} className="shrink-0 opacity-60" />
      </a>

      {!hasCriteria && (
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('assessment.detail.teamGrade')}
        </p>
      )}
      {overridden && hasCriteria && computedGrade && computedGrade !== grade && (
        <p className="text-xs text-slate-500 leading-relaxed mb-2">
          {t('assessment.detail.overridden', { computed: computedGrade, grade })}
        </p>
      )}
      {hasUnverifiedSources && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2">
          {t('assessment.detail.unverifiedSources')}
        </p>
      )}

      {items.length > 0 && (
        <p className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 mb-3 leading-snug">
          <Info size={12} className="shrink-0 mt-px text-slate-400" />
          <span>
            <BoldText text={t('assessment.detail.disclaimer')} strongClassName="font-semibold" />
          </span>
        </p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {items.map(c => <CriterionItem key={c.key} c={c} facts={criterionFacts?.[c.key]} />)}
        </ul>
      )}

      <GradeHistory history={assessment.gradeHistory} />
    </div>
  );
};

export default AssessmentDetail;
