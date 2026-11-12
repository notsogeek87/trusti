import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ClipboardList, HelpCircle, RotateCcw } from 'lucide-react';
import { AUDIT_ANSWERS, AUDIT_THEMES, AUDIT_WEIGHTS } from '../../constants/auditChecklist';
import { ORG_PROFILES } from '../../constants/orgProfiles';
import { questionsForProfile, computeAuditResult } from '../../utils/auditChecklist';

const WEIGHT_STYLES = {
  haute: 'bg-rose-50 text-rose-700',
  moyenne: 'bg-amber-50 text-amber-700',
};

const AnswerPicker = ({ question, value, onAnswer }) => (
  <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label={question.label}>
    {AUDIT_ANSWERS.map(answer => (
      <button
        key={answer.id}
        type="button"
        role="radio"
        aria-checked={value === answer.id}
        onClick={() => onAnswer(question.id, value === answer.id ? null : answer.id)}
        className={`px-2.5 py-1.5 rounded-md text-xs font-black transition-colors
          ${value === answer.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        {answer.label}
      </button>
    ))}
  </div>
);

/**
 * Questionnaire d'audit de terrain (pratiques, en plus de la note des outils)
 * et ses points de vigilance. Les réponses restent dans le navigateur.
 */
const AuditChecklist = ({ profile, answers, onAnswer, onReset, onProfileChange }) => {
  const questions = useMemo(() => questionsForProfile(profile), [profile]);
  const result = useMemo(() => computeAuditResult(answers, profile), [answers, profile]);
  const [open, setOpen] = useState(result.answered === 0);

  return (
    <section className="bg-white/90 rounded-2xl p-5 shadow-sm" aria-labelledby="audit-titre">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <ClipboardList size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="audit-titre" className="font-black text-slate-800">Questionnaire d'audit</h3>
          <p className="text-xs text-slate-500">
            Les pratiques comptent autant que les outils : comptes, sauvegardes, contrats, données sensibles.
          </p>
        </div>
      </div>

      {!profile && onProfileChange && (
        <div className="mt-3">
          <p className="text-xs font-bold text-slate-600 mb-1.5">Type de structure, pour ajouter les questions qui lui sont propres :</p>
          <div className="flex flex-wrap gap-1.5">
            {ORG_PROFILES.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProfileChange(p.id)}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-indigo-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(result.answered / Math.max(result.total, 1)) * 100}%` }} />
        </div>
        <span className="text-xs font-black text-slate-500 shrink-0">{result.answered} / {result.total} réponses</span>
      </div>

      {result.answered > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {result.risks.length === 0 && result.unknown.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">Aucun point de vigilance sur les questions répondues.</p>
          ) : null}
          {result.risks.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-black text-slate-800 mb-2">
                <AlertTriangle size={15} className="text-rose-600" aria-hidden="true" />
                {result.risks.length} point{result.risks.length > 1 ? 's' : ''} de vigilance
              </p>
              <ol className="flex flex-col gap-2">
                {result.risks.map(q => (
                  <li key={q.id} className="rounded-xl border border-slate-100 p-3">
                    <span className={`inline-block text-[10px] font-black uppercase rounded px-1.5 py-0.5 ${WEIGHT_STYLES[q.weight]}`}>
                      {AUDIT_WEIGHTS[q.weight].label}
                    </span>
                    <p className="mt-1 text-sm font-bold text-slate-700">{q.recommendation}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{q.theme}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {result.unknown.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-black text-slate-800 mb-1">
                <HelpCircle size={15} className="text-slate-400" aria-hidden="true" /> À vérifier
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-0.5">
                {result.unknown.map(q => <li key={q.id}>{q.label}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {open ? 'Masquer les questions' : result.answered === 0 ? 'Répondre au questionnaire' : 'Modifier mes réponses'}
        </button>
        {result.answered > 0 && (
          <button type="button" onClick={onReset} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-600">
            <RotateCcw size={13} /> Effacer les réponses
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          {AUDIT_THEMES.map(theme => {
            const themed = questions.filter(q => q.theme === theme);
            if (themed.length === 0) return null;
            return (
              <fieldset key={theme}>
                <legend className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-2">{theme}</legend>
                <ul className="flex flex-col divide-y divide-slate-100">
                  {themed.map(q => (
                    <li key={q.id} className="py-2.5 first:pt-0 flex flex-col gap-1.5">
                      <p className="text-sm font-bold text-slate-700">{q.label}</p>
                      {q.help && <p className="text-xs text-slate-500">{q.help}</p>}
                      <AnswerPicker question={q} value={answers?.[q.id]} onAnswer={onAnswer} />
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AuditChecklist;
