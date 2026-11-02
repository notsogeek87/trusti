import React from 'react';
import { GRADES, GRADE_COLORS } from '../../constants/grades';
import { CRITICALITY_LEVELS, DEFAULT_CRITICALITY } from '../../constants/proFamilies';
import { familyForCategory } from '../../utils/organisationAssessment';

const ORG_GRADE_LABEL = {
  A: 'Parc très souverain',
  B: 'Parc plutôt souverain',
  C: 'Parc hybride, à surveiller',
  D: 'Forte dépendance, risque élevé',
  E: 'Dépendance critique',
};

const DARK_TEXT = new Set(['B', 'C', 'D']);
const percent = value => `${Math.round(value * 100)} %`;
const levelLabel = id => (CRITICALITY_LEVELS.find(l => l.id === (id || DEFAULT_CRITICALITY)) || {}).label;

const Badge = ({ grade, size = 'w-6 h-6 text-xs' }) => (
  <span className={`${GRADE_COLORS[grade]} ${DARK_TEXT.has(grade) ? 'text-slate-900' : 'text-white'} ${size} inline-flex items-center justify-center rounded font-black`}>
    {grade}
  </span>
);

/**
 * Rapport imprimable (impression ou « Enregistrer en PDF » du navigateur).
 * Invisible à l'écran, seul affiché à l'impression (classes print:).
 */
const OrganisationReport = ({ orgName, profileLabel, selectedApps, criticality, summary, plan }) => {
  if (summary.total === 0) return null;
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const sortedApps = [...selectedApps].sort((a, b) =>
    familyForCategory(a.category).label.localeCompare(familyForCategory(b.category).label, 'fr') || a.name.localeCompare(b.name, 'fr'));

  return (
    <div className="hidden print:block text-slate-900 bg-white text-[12px] leading-snug" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <style>{'@page { size: A4; margin: 14mm; } @media print { html, body { background: #fff !important; } }'}</style>

      <header className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rapport de souveraineté numérique</p>
          <h1 className="text-2xl font-black">{orgName?.trim() || 'Parc applicatif de l\'organisation'}</h1>
          <p className="text-slate-600">{profileLabel ? `${profileLabel} · ` : ''}{date}</p>
        </div>
        <p className="text-right text-[10px] text-slate-500">Établi avec Trusti<br />trusti.lielu.eu</p>
      </header>

      <section className="flex items-center gap-5 mb-4 break-inside-avoid">
        <span className={`${GRADE_COLORS[summary.overallGrade]} ${DARK_TEXT.has(summary.overallGrade) ? 'text-slate-900' : 'text-white'} w-20 h-24 rounded-xl inline-flex items-center justify-center text-5xl font-black shrink-0`}>
          {summary.overallGrade}
        </span>
        <div>
          <p className="text-lg font-black">{ORG_GRADE_LABEL[summary.overallGrade]}</p>
          <p className="text-slate-600">
            Note du parc pondérée par la criticité de {summary.total} outil{summary.total > 1 ? 's' : ''}
            {summary.rawGrade !== summary.overallGrade && ` (sans pondération : ${summary.rawGrade})`}.
          </p>
          <p className="mt-1 text-slate-600">
            Répartition : {GRADES.map(g => `${g} ${summary.counts[g]}`).join(' · ')}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2 mb-5 break-inside-avoid">
        {[
          ['Outils notés D ou E', percent(summary.weakShare)],
          ['Outils vitaux à risque', String(summary.criticalWeak.length)],
          ['Premier éditeur', summary.topEditor ? `${summary.topEditor.name} (${percent(summary.topEditor.share)})` : 'Aucune concentration'],
          ['Éditeurs européens', summary.europeanShare === null ? 'Non renseigné' : percent(summary.europeanShare)],
        ].map(([label, value]) => (
          <div key={label} className="border border-slate-300 rounded-lg p-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</p>
            <p className="font-black text-sm">{value}</p>
          </div>
        ))}
      </section>

      {plan.length > 0 && (
        <section className="mb-5">
          <h2 className="text-base font-black mb-2">Plan d'action prioritaire</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-400">
                <th className="py-1 pr-2 w-6">#</th>
                <th className="py-1 pr-2">Outil actuel</th>
                <th className="py-1 pr-2">Note</th>
                <th className="py-1 pr-2">Criticité</th>
                <th className="py-1 pr-2">Alternative proposée</th>
                <th className="py-1">Note</th>
              </tr>
            </thead>
            <tbody>
              {plan.map(({ app, alternative, criticality: level }, i) => (
                <tr key={app.id} className="border-b border-slate-200 break-inside-avoid">
                  <td className="py-1 pr-2 text-slate-500">{i + 1}</td>
                  <td className="py-1 pr-2 font-bold">{app.name}</td>
                  <td className="py-1 pr-2"><Badge grade={app.grade} /></td>
                  <td className="py-1 pr-2">{levelLabel(level)}</td>
                  <td className="py-1 pr-2">{alternative ? alternative.name : <span className="italic text-slate-500">aucune au catalogue</span>}</td>
                  <td className="py-1">{alternative && <Badge grade={alternative.grade} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mb-5" style={{ breakBefore: plan.length > 12 ? 'page' : 'auto' }}>
        <h2 className="text-base font-black mb-2">Annexe : outils évalués</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-400">
              <th className="py-1 pr-2">Outil</th>
              <th className="py-1 pr-2">Éditeur</th>
              <th className="py-1 pr-2">Famille</th>
              <th className="py-1 pr-2">Criticité</th>
              <th className="py-1">Note</th>
            </tr>
          </thead>
          <tbody>
            {sortedApps.map(app => (
              <tr key={app.id} className="border-b border-slate-200 break-inside-avoid">
                <td className="py-1 pr-2 font-bold">{app.name}</td>
                <td className="py-1 pr-2">{app.developer || '—'}</td>
                <td className="py-1 pr-2">{familyForCategory(app.category).label}</td>
                <td className="py-1 pr-2">{levelLabel(criticality[app.id])}</td>
                <td className="py-1"><Badge grade={app.grade} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 break-inside-avoid">
        <p>
          Les notes TrustiScore (A à E) évaluent la souveraineté numérique de chaque outil sur cinq critères : contrôle technique,
          conformité, gouvernance et juridiction, localisation des données, transparence. Certaines notes sont provisoires
          (sources à confirmer) ; le détail de chaque note est consultable sur la fiche de l'outil dans Trusti.
          Ce rapport est une aide à la décision, pas un audit de conformité.
        </p>
      </footer>
    </div>
  );
};

export default OrganisationReport;
