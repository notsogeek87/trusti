import React from 'react';
import { ArrowRight, Download, FileSpreadsheet, Trash2, X } from 'lucide-react';
import { GRADES, GRADE_COLORS } from '../../constants/grades';
import { CRITICALITY_LEVELS, DEFAULT_CRITICALITY } from '../../constants/proFamilies';
import ScoreIndicator from '../ui/ScoreIndicator';
import ProAppIcon from './ProAppIcon';

const ORG_GRADE_LABEL = {
  A: 'Parc très souverain',
  B: 'Parc plutôt souverain',
  C: 'Parc hybride, à surveiller',
  D: 'Forte dépendance, risque élevé',
  E: 'Dépendance critique',
};

const percent = value => `${Math.round(value * 100)} %`;

const Indicator = ({ label, value, hint }) => (
  <div className="bg-slate-50 rounded-xl p-3">
    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-lg font-black text-slate-800">{value}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const GradeBar = ({ counts, total }) => (
  <div>
    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100" role="img" aria-label="Répartition des notes">
      {GRADES.filter(g => counts[g] > 0).map(g => (
        <div key={g} className={GRADE_COLORS[g]} style={{ width: `${(counts[g] / total) * 100}%` }} />
      ))}
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-bold text-slate-500">
      {GRADES.map(g => (
        <span key={g} className="flex items-center gap-1">
          <span className={`w-2.5 h-2.5 rounded-sm ${GRADE_COLORS[g]}`} />{g} : {counts[g]}
        </span>
      ))}
    </div>
  </div>
);

const CriticalityPicker = ({ value, onChange, appName }) => (
  <div className="flex rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label={`Criticité de ${appName}`}>
    {CRITICALITY_LEVELS.map(level => (
      <button
        key={level.id}
        type="button"
        role="radio"
        aria-checked={value === level.id}
        onClick={() => onChange(level.id)}
        className={`px-2 py-1 rounded-md text-[11px] font-black transition-colors
          ${value === level.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        {level.label}
      </button>
    ))}
  </div>
);

/**
 * Résultat de l'évaluation : note, indicateurs, criticités, plan d'action, exports.
 */
const OrganisationResult = ({ selectedApps, criticality, summary, plan, onCriticalityChange, onRemove, onClear, onExportCsv, onExportJson }) => {
  if (summary.total === 0) {
    return (
      <div className="bg-white/80 rounded-2xl p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-black text-slate-800 mb-1">Votre résultat apparaîtra ici</p>
        <p>Cochez les outils utilisés dans votre organisation, famille par famille. La note se calcule au fur et à mesure.</p>
      </div>
    );
  }

  const textColor = ['B', 'C', 'D'].includes(summary.overallGrade) ? 'text-slate-900' : 'text-white';

  return (
    <div className="flex flex-col gap-3">
      <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`${GRADE_COLORS[summary.overallGrade]} ${textColor} w-16 h-20 rounded-2xl flex items-center justify-center shrink-0`}>
            <span className="text-4xl font-black">{summary.overallGrade}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Note du parc</p>
            <p className="font-black text-slate-800">{ORG_GRADE_LABEL[summary.overallGrade]}</p>
            <p className="text-xs text-slate-500">
              {summary.total} outil{summary.total > 1 ? 's' : ''}, note pondérée par la criticité
              {summary.rawGrade !== summary.overallGrade && ` (sans pondération : ${summary.rawGrade})`}
            </p>
          </div>
        </div>
        <div className="mt-4"><GradeBar counts={summary.counts} total={summary.total} /></div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Indicator label="Outils notés D ou E" value={percent(summary.weakShare)} />
          <Indicator
            label="Outils vitaux à risque"
            value={summary.criticalWeak.length}
            hint={summary.criticalWeak.length > 0 ? summary.criticalWeak.map(a => a.name).join(', ') : 'Aucun outil vital noté D ou E'}
          />
          <Indicator
            label="Premier éditeur"
            value={summary.topEditor ? percent(summary.topEditor.share) : '—'}
            hint={summary.topEditor ? `${summary.topEditor.name} : ${summary.topEditor.count} outils` : 'Pas de concentration notable'}
          />
          <Indicator
            label="Éditeurs européens"
            value={summary.europeanShare === null ? '—' : percent(summary.europeanShare)}
            hint={summary.europeanShare === null ? 'Non renseigné' : `Sur ${summary.europeanKnown} fiche${summary.europeanKnown > 1 ? 's' : ''} renseignée${summary.europeanKnown > 1 ? 's' : ''}`}
          />
        </div>
      </section>

      <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800">Vos outils et leur criticité</h3>
          <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600">
            <Trash2 size={14} /> Tout retirer
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {selectedApps.map(app => (
            <li key={app.id} className="flex flex-wrap items-center gap-2">
              <ProAppIcon app={app} size="w-7 h-7" />
              <span className="flex-1 min-w-[6rem] text-sm font-bold text-slate-700 truncate">{app.name}</span>
              <ScoreIndicator grade={app.grade} />
              <CriticalityPicker
                value={criticality[app.id] || DEFAULT_CRITICALITY}
                onChange={level => onCriticalityChange(app.id, level)}
                appName={app.name}
              />
              <button type="button" onClick={() => onRemove(app.id)} aria-label={`Retirer ${app.name}`} className="p-1 text-slate-300 hover:text-rose-600">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {plan.length > 0 && (
        <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-slate-800">Plan d'action</h3>
          <p className="text-xs text-slate-500 mb-3">Outils notés C, D ou E, du plus prioritaire au moins prioritaire, avec l'alternative mieux notée du catalogue.</p>
          <ol className="flex flex-col divide-y divide-slate-100">
            {plan.map(({ app, alternative, criticality: level }) => (
              <li key={app.id} className="py-2 first:pt-0 last:pb-0 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 min-w-0 truncate">{app.name}</span>
                  <ScoreIndicator grade={app.grade} />
                  {level === 'vitale' && <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 rounded px-1.5 py-0.5 shrink-0">Vital</span>}
                </div>
                <div className="flex items-center gap-2 mt-1 pl-1">
                  <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  {alternative ? (
                    <>
                      <span className="text-slate-600 min-w-0 truncate">{alternative.name}</span>
                      <ScoreIndicator grade={alternative.grade} />
                    </>
                  ) : (
                    <span className="text-slate-400 italic">pas encore d'alternative mieux notée au catalogue</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-wrap gap-2">
        <button type="button" onClick={onExportCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700">
          <FileSpreadsheet size={16} /> Exporter en tableur (CSV)
        </button>
        <button type="button" onClick={onExportJson} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-600 border border-indigo-200 text-sm font-black hover:border-indigo-400">
          <Download size={16} /> Enregistrer l'évaluation
        </button>
      </section>
    </div>
  );
};

export default OrganisationResult;
