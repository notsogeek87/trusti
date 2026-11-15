import React from 'react';
import { ArrowRight, ChevronRight, Download, FileDown, FileSpreadsheet, Trash2, X } from 'lucide-react';
import { GRADES, GRADE_COLORS } from '../../constants/grades';
import { CRITICALITY_LEVELS, DEFAULT_CRITICALITY } from '../../constants/proFamilies';
import ScoreIndicator from '../ui/ScoreIndicator';
import ProAppIcon from './ProAppIcon';
import { t } from '../../i18n/index.js';

const ORG_GRADE_LABEL = {
  A: t('org.result.k001'),
  B: t('org.result.k002'),
  C: t('org.result.k003'),
  D: t('org.result.k004'),
  E: t('org.result.k005'),
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
    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100" role="img" aria-label={t('org.result.k006')}>
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

/** Nom d'app cliquable : ouvre la fiche détail. */
const AppLink = ({ app, onOpenApp, muted = false }) => (
  <button
    type="button"
    onClick={() => onOpenApp(app)}
    title={t('org.result.seeSheet', { name: app.name })}
    className="group flex items-center gap-2 min-w-0 text-left rounded-lg -mx-1 px-1 py-0.5 hover:bg-indigo-50"
  >
    <ProAppIcon app={app} size="w-7 h-7" />
    <span className={`min-w-0 truncate text-sm ${muted ? 'text-slate-600' : 'font-bold text-slate-700'} group-hover:text-indigo-600`}>
      {app.name}
    </span>
    <ChevronRight size={14} className="shrink-0 text-slate-300 group-hover:text-indigo-500" />
  </button>
);

const CriticalityPicker = ({ value, onChange, appName }) => (
  <div className="inline-flex rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label={t('org.result.criticalityOf', { name: appName })}>
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
 * Résultat de l'évaluation : note, exports (juste sous la note, pour être vus),
 * criticités, plan d'action.
 */
const OrganisationResult = ({ selectedApps, criticality, summary, plan, onCriticalityChange, onRemove, onClear, onExportCsv, onExportJson, onOpenApp, onDownloadPdf, pdfStatus = 'idle', compact = false }) => {
  if (summary.total === 0) {
    return (
      <div className="bg-white/80 rounded-2xl p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-black text-slate-800 mb-1">{t('org.result.k007')}</p>
        <p>{t('org.result.k008')}</p>
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
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{t('org.result.k009')}</p>
            <p className="font-black text-slate-800">{ORG_GRADE_LABEL[summary.overallGrade]}</p>
            <p className="text-xs text-slate-500">
              {t('org.result.toolsWeighted', { count: summary.total })}
              {summary.rawGrade !== summary.overallGrade && t('org.result.unweighted', { grade: summary.rawGrade })}
            </p>
          </div>
        </div>
        <div className="mt-4"><GradeBar counts={summary.counts} total={summary.total} /></div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Indicator label={t('org.result.k010')} value={percent(summary.weakShare)} />
          <Indicator
            label={t('org.result.k011')}
            value={summary.criticalWeak.length}
            hint={summary.criticalWeak.length > 0 ? summary.criticalWeak.map(a => a.name).join(', ') : t('org.result.k012')}
          />
          <Indicator
            label={t('org.result.k013')}
            value={summary.topEditor ? percent(summary.topEditor.share) : '—'}
            hint={summary.topEditor ? t('org.result.editorTools', { name: summary.topEditor.name, count: summary.topEditor.count }) : t('org.result.k014')}
          />
          <Indicator
            label={t('org.result.k015')}
            value={summary.europeanShare === null ? '—' : percent(summary.europeanShare)}
            hint={summary.europeanShare === null ? t('org.result.k016') : t('org.result.onSheets', { count: summary.europeanKnown })}
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={pdfStatus === 'working'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 disabled:opacity-60"
          >
            <FileDown size={16} /> {pdfStatus === 'working' ? t('org.result.k017') : t('org.result.k018')}
          </button>
        )}
        {pdfStatus === 'error' && <p className="w-full text-sm font-bold text-rose-600" role="alert">{t('org.result.k019')}</p>}
        <button type="button" onClick={onExportCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700">
          <FileSpreadsheet size={16} /> {t('org.result.k025')}
        </button>
        <button type="button" onClick={onExportJson} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-600 border border-indigo-200 text-sm font-black hover:border-indigo-400">
          <Download size={16} /> {t('org.result.k027')}
        </button>
      </section>

      <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800">{t('org.result.k020')}</h3>
          <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600">
            <Trash2 size={14} /> {t('org.result.k026')}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3">{t('org.result.k021')}</p>
        <ul className="flex flex-col divide-y divide-slate-100">
          {selectedApps.map(app => (
            <li
              key={app.id}
              className={`py-2 first:pt-0 last:pb-0 grid items-center gap-x-3 gap-y-1.5
                grid-cols-[minmax(0,1fr)_auto_auto]
                ${compact ? '' : 'sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]'}`}
            >
              <AppLink app={app} onOpenApp={onOpenApp} />
              <ScoreIndicator grade={app.grade} />
              <button
                type="button"
                onClick={() => onRemove(app.id)}
                aria-label={t('org.result.remove', { name: app.name })}
                className={`p-1 text-slate-300 hover:text-rose-600 ${compact ? '' : 'sm:order-last'}`}
              >
                <X size={16} />
              </button>
              <div className={`col-span-3 ${compact ? '' : 'sm:col-span-1'}`}>
                <CriticalityPicker
                  value={criticality[app.id] || DEFAULT_CRITICALITY}
                  onChange={level => onCriticalityChange(app.id, level)}
                  appName={app.name}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {plan.length > 0 && (
        <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-slate-800">{t('org.result.k022')}</h3>
          <p className="text-xs text-slate-500 mb-3">{t('org.result.k023')}</p>
          <ol className="flex flex-col divide-y divide-slate-100">
            {plan.map(({ app, alternative, criticality: level }) => (
              <li
                key={app.id}
                className={`py-2.5 first:pt-0 last:pb-0 grid items-center gap-x-3 gap-y-1
                  grid-cols-[minmax(0,1fr)_auto]
                  ${compact ? '' : 'sm:grid-cols-[minmax(0,1fr)_2.75rem_1rem_minmax(0,1fr)_auto]'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AppLink app={app} onOpenApp={onOpenApp} />
                  {level === 'vitale' && <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 rounded px-1.5 py-0.5 shrink-0">{t('org.result.k024')}</span>}
                </div>
                <div className="justify-self-end"><ScoreIndicator grade={app.grade} /></div>
                <ArrowRight size={16} className={`text-slate-400 ${compact ? 'hidden' : 'hidden sm:block'}`} />
                {alternative ? (
                  <>
                    <div className={`flex items-center gap-1.5 min-w-0 ${compact ? 'pl-3' : 'pl-3 sm:pl-0'}`}>
                      <ArrowRight size={14} className={`shrink-0 text-slate-400 ${compact ? '' : 'sm:hidden'}`} />
                      <AppLink app={alternative} onOpenApp={onOpenApp} muted />
                    </div>
                    <div className="justify-self-end"><ScoreIndicator grade={alternative.grade} /></div>
                  </>
                ) : (
                  <p className={`col-span-2 text-slate-400 italic text-sm ${compact ? 'pl-3' : 'pl-3 sm:pl-0'}`}>
                    {t('org.result.k028')}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

    </div>
  );
};

export default OrganisationResult;
