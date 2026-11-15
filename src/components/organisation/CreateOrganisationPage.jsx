import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, ClipboardCheck, ExternalLink, FileDown, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { STANDALONE_URLS } from '../../utils/standalonePage';
import { useProCatalog } from '../../hooks/useProCatalog';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProAppIcon from './ProAppIcon';
import AppDetailModal from '../modals/AppDetailModal';
import { ViewModeContext } from '../../contexts/ViewModeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { GRADES, GRADE_COLORS } from '../../constants/grades';
import {
  CREATION_TYPES,
  CREATION_SIZES,
  CREATION_APPROACHES,
  COST_LABELS,
  kitStepLabel,
  KITS_REVIEWED_AT,
} from '../../constants/creationKits';
import { buildStarterKit, mergeKitIntoSelection } from '../../utils/creationKit';
import { computeOrganisationSummary, buildActionPlan } from '../../utils/organisationAssessment';
import { downloadOrganisationPdf } from '../../utils/organisationPdf';
import { loadOrganisationState, saveOrganisationState } from '../../utils/organisationStorage';
import { helpForProfile } from '../../constants/orgHelp';
import { t } from '../../i18n/index.js';

/**
 * Assistant « Créer mon organisation » (adresse « ?creer-organisation »), V1.
 * Trois questions (structure, taille, approche) puis un kit de démarrage choisi
 * à la main (src/constants/creationKits.js), avec sa note projetée. Le kit peut
 * être enregistré dans « Évaluer mon organisation » (même sauvegarde locale).
 * Aucun compte, aucune donnée envoyée.
 */
const QUESTIONS = [
  { key: 'type', title: t('org.create.k001'), options: CREATION_TYPES },
  { key: 'size', title: t('org.create.k002'), options: CREATION_SIZES },
  { key: 'approach', title: t('org.create.k003'), options: CREATION_APPROACHES },
];

const KIT_GRADE_LABEL = {
  A: t('org.create.k004'),
  B: t('org.create.k005'),
  C: t('org.create.k006'),
  D: t('org.create.k007'),
  E: t('org.create.k008'),
};

const PageHeader = () => (
  <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/60">
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3 min-w-0">
      <a href={STANDALONE_URLS.ORGANISATIONS} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 shrink-0">
        <ArrowLeft size={16} /> {t('org.create.k009')}
      </a>
      <span className="text-slate-300">/</span>
      <span className="flex items-center gap-2 font-black text-indigo-600 min-w-0">
        <Rocket size={18} className="shrink-0" /> <span className="truncate">{t('org.create.k010')}</span>
      </span>
    </div>
  </header>
);

const Intro = ({ onStart }) => (
  <div className="bg-white/80 rounded-3xl border border-white shadow-sm px-6 py-10 sm:px-12 sm:py-14 text-center">
    <div className="relative w-28 h-28 mx-auto mb-8" aria-hidden="true">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl rotate-6" />
      <div className="absolute inset-0 rounded-[2rem] bg-white border border-indigo-100 flex items-center justify-center">
        <Building2 size={48} className="text-indigo-600" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-md">
        <ShieldCheck size={20} className="text-white" />
      </div>
    </div>

    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-wide">
      <Sparkles size={14} aria-hidden="true" /> {t('org.create.k011')}
    </span>

    <h1 className="mt-5 text-2xl sm:text-4xl font-black text-slate-800 leading-tight">
      {t('org.create.k012')}
    </h1>
    <div className="mt-5 space-y-3 text-slate-600 sm:text-lg max-w-2xl mx-auto">
      <p>{t('org.create.k013')}</p>
      <p className="text-sm text-slate-500">{t('org.create.k014')}</p>
    </div>

    <button
      type="button"
      onClick={onStart}
      className="mt-10 inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
    >
      {t('org.create.k015')}
      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
    </button>
    <div className="mt-4">
      <a href={STANDALONE_URLS.ORGANISATIONS} className="text-sm font-bold text-slate-500 hover:text-indigo-600">
        {t('org.create.k016')}
      </a>
    </div>
  </div>
);

const Question = ({ index, question, value, onPick, onBack }) => (
  <div className="bg-white/80 rounded-3xl border border-white shadow-sm px-5 py-8 sm:px-10 sm:py-10">
    <div className="flex items-center justify-between gap-3 mb-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> {t('org.create.k017')}
      </button>
      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Question {index + 1} sur {QUESTIONS.length}</span>
    </div>
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-6" aria-hidden="true">
      <div className="h-full bg-indigo-600 transition-all" style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
    </div>
    <h1 className="text-xl sm:text-2xl font-black text-slate-800">{question.title}</h1>
    <div className="mt-5 grid gap-3" role="radiogroup" aria-label={question.title}>
      {question.options.map(option => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onPick(option.id)}
            className={`w-full text-left flex items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-all
              ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
          >
            <span className="flex-1 min-w-0">
              <span className="block font-black text-slate-800">{option.label}</span>
              <span className="block text-sm text-slate-500 mt-0.5">{option.hint}</span>
            </span>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
              {selected && <Check size={14} />}
            </span>
          </button>
        );
      })}
    </div>
    {question.key === 'type' && (
      <p className="mt-5 text-sm text-slate-500">
        {t('org.create.soonBefore')}{' '}
        <a href={STANDALONE_URLS.EVALUATE_ORGANISATION} className="font-bold text-indigo-600 hover:underline">{t('org.create.k018')}</a>.
      </p>
    )}
  </div>
);

/** Liens officiels d'un outil (site web en premier : certains outils n'ont pas d'appli). */
const AppLinks = ({ app }) => {
  const links = [
    [t('org.create.k019'), app.website],
    [t('org.create.k020'), app.playStoreUrl],
    [t('org.create.k021'), app.appleStoreUrl],
  ].filter(([, url]) => typeof url === 'string' && /^https?:\/\//i.test(url.trim()));
  if (links.length === 0) return null;
  return (
    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {links.map(([label, url]) => (
        <a
          key={label}
          href={url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
        >
          <ExternalLink size={12} aria-hidden="true" /> {label}
        </a>
      ))}
    </p>
  );
};

/**
 * Fiche détaillée d'un outil du kit. L'ouverture ajoute une entrée d'historique :
 * le bouton retour (navigateur ou Android) ferme la fiche avant de quitter le kit.
 */
const useKitDetail = () => {
  const [detailApp, setDetailApp] = useState(null);
  const openApp = useCallback(app => {
    const state = window.history.state || {};
    if (!state.trustiKitDetail) window.history.pushState({ ...state, trustiKitDetail: true }, '');
    setDetailApp(app);
  }, []);
  const closeApp = useCallback(() => {
    if (window.history.state?.trustiKitDetail) window.history.back();
    else setDetailApp(null);
  }, []);
  useEffect(() => {
    const onPop = event => {
      if (!event.state?.trustiKitDetail) setDetailApp(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return { detailApp, openApp, closeApp };
};

const KitResult = ({ answers, kit, catalog, onRestart, detailApp, openApp, closeApp, isWide }) => {
  // Écran large : le kit reste à gauche, la fiche s'affiche à droite.
  // Sinon : fiche en plein écran par-dessus le kit.
  const isMobile = useMediaQuery('(max-width: 767px)');
  const split = isWide && detailApp;
  const panelRef = useRef(null);
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [detailApp?.id]);
  useEffect(() => {
    if (!detailApp || isWide) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [detailApp, isWide]);
  const [confirming, setConfirming] = useState(null);
  const [pdfStatus, setPdfStatus] = useState('idle');
  const summary = useMemo(() => computeOrganisationSummary(kit.apps), [kit.apps]);
  const typeOption = CREATION_TYPES.find(t => t.id === answers.type);

  const downloadPdf = () => {
    setPdfStatus('working');
    downloadOrganisationPdf({
      orgName: t('org.create.k022'),
      profileLabel: typeOption?.label || null,
      selectedApps: kit.apps,
      criticality: {},
      summary,
      plan: buildActionPlan(kit.apps, catalog, {}),
      help: helpForProfile(typeOption?.evaluationProfile),
    })
      .then(() => setPdfStatus('idle'))
      .catch(err => {
        console.error('PDF', err);
        setPdfStatus('error');
      });
  };
  const labels = QUESTIONS.map(q => q.options.find(o => o.id === answers[q.key])?.label).filter(Boolean);
  const textColor = ['B', 'C', 'D'].includes(summary.overallGrade) ? 'text-slate-900' : 'text-white';
  let position = 0;

  const save = mode => {
    const saved = loadOrganisationState();
    const next = mergeKitIntoSelection(saved, kit.apps.map(a => a.id), mode);
    const profile = mode === 'merge' && saved?.profile ? saved.profile : typeOption?.evaluationProfile;
    saveOrganisationState(next.ids, next.criticality, { profile, orgName: next.orgName });
    window.location.href = STANDALONE_URLS.EVALUATE_ORGANISATION;
  };
  const onSave = () => {
    const saved = loadOrganisationState();
    if (saved && saved.ids.length > 0) setConfirming(saved.ids.length);
    else save('replace');
  };

  const detail = detailApp && (
    <AppDetailModal
      key={detailApp.id}
      app={detailApp}
      onClose={closeApp}
      onSelectApp={openApp}
      allApps={catalog}
      closeAsCross
    />
  );

  return (
    <div className={split ? 'grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start' : ''}>
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onRestart} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600">
          <ArrowLeft size={16} /> {t('org.create.k023')}
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{t('org.create.k024')}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {labels.map(l => (
            <span key={l} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600">{l}</span>
          ))}
        </div>
      </div>

      {summary.total > 0 && (
        <section className="bg-white/90 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className={`${GRADE_COLORS[summary.overallGrade]} ${textColor} w-16 h-20 rounded-2xl flex items-center justify-center shrink-0`}>
            <span className="text-4xl font-black">{summary.overallGrade}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{t('org.create.k025')}</p>
            <p className="font-black text-slate-800">{KIT_GRADE_LABEL[summary.overallGrade]}</p>
            <p className="text-xs text-slate-500">
              {t('org.create.toolsCount', { count: summary.total })}{t('common.colon')}
              {GRADES.filter(g => summary.counts[g] > 0).map(g => t('org.create.ratedCount', { count: summary.counts[g], grade: g })).join(', ')}
            </p>
          </div>
        </section>
      )}

      {kit.steps.map(({ step, items }) => (
        <section key={step} className="bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-3">{kitStepLabel(step)}</h2>
          <ol className="flex flex-col gap-3">
            {items.map(item => {
              position += 1;
              const active = item.app && detailApp?.id === item.app.id;
              return (
                <li key={item.need.id} className={`flex gap-3 rounded-xl -mx-2 px-2 py-1 transition-colors ${active ? 'bg-indigo-50 ring-2 ring-indigo-200' : ''}`}>
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center shrink-0 mt-1">{position}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-400">{item.need.label}</p>
                    {item.app ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openApp(item.app)}
                          aria-label={t('org.create.seeSheet', { name: item.app.name })}
                          aria-current={active ? 'true' : undefined}
                          className="group w-full text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          <span className="mt-1 flex items-center gap-2 min-w-0">
                            <ProAppIcon app={item.app} size="w-8 h-8" />
                            <span className="font-black text-slate-800 truncate group-hover:text-indigo-700">{item.app.name}</span>
                            {item.app.grade && (
                              <span className={`${GRADE_COLORS[item.app.grade]} ${['B', 'C', 'D'].includes(item.app.grade) ? 'text-slate-900' : 'text-white'} text-xs font-black w-6 h-6 rounded-md flex items-center justify-center shrink-0`}>
                                {item.app.grade}
                              </span>
                            )}
                            <ChevronRight size={18} className={`ml-auto shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-500'}`} aria-hidden="true" />
                          </span>
                          <span className="block mt-1 text-sm text-slate-600">{item.why}</span>
                          <span className="block mt-1 text-[11px] font-bold text-slate-400">{COST_LABELS[item.cost]}</span>
                          <span className="block mt-1 text-xs font-bold text-indigo-600 group-hover:underline">
                            {active ? t('org.create.k026') : t('org.create.k027')}
                          </span>
                        </button>
                        <AppLinks app={item.app} />
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <section className="bg-white/90 rounded-2xl p-5 shadow-sm">
        <p className="font-black text-slate-800">{t('org.create.k028')}</p>
        <p className="mt-1 text-sm text-slate-600">
          {t('org.create.k029')}
        </p>
        {confirming ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">
              Vous avez déjà une évaluation enregistrée ({confirming} outil{confirming > 1 ? 's' : ''}). Que faire ?
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={() => save('merge')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl">
                {t('org.create.k030')}
              </button>
              <button type="button" onClick={() => save('replace')} className="flex-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold py-3 px-4 rounded-xl">
                {t('org.create.k031')}
              </button>
              <button type="button" onClick={() => setConfirming(null)} className="sm:flex-none text-slate-500 font-bold py-3 px-4">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <ClipboardCheck size={18} /> {t('org.create.k032')}
          </button>
        )}
        {summary.total > 0 && (
          <>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfStatus === 'working'}
              className="mt-2 w-full bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FileDown size={18} /> {pdfStatus === 'working' ? t('org.create.k033') : t('org.create.k034')}
            </button>
            {pdfStatus === 'error' && <p className="mt-2 text-sm font-bold text-rose-600" role="alert">{t('org.create.k035')}</p>}
          </>
        )}
      </section>

      <p className="text-xs text-slate-500 px-1">
        {t('org.create.kitsDisclaimer', { date: KITS_REVIEWED_AT })}
        {t('org.create.k036')}
      </p>
    </div>

    {split && (
      <aside
        ref={panelRef}
        aria-label={`Fiche de ${detailApp.name}`}
        className="sticky top-[4.5rem] h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-3xl bg-[#E9F0F6] border border-white shadow-sm"
      >
        <ViewModeContext.Provider value>{detail}</ViewModeContext.Provider>
      </aside>
    )}
    {detailApp && !isWide && (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#E9F0F6]" role="dialog" aria-modal="true" aria-label={`Fiche de ${detailApp.name}`}>
        <ViewModeContext.Provider value={isMobile}>{detail}</ViewModeContext.Provider>
      </div>
    )}
    </div>
  );
};

const EMPTY_ANSWERS = { type: null, size: null, approach: null };

/** État de l'assistant rangé dans l'historique : bouton retour et rechargement le retrouvent. */
const readHistoryState = () => {
  const state = window.history.state?.trustiCreateOrg;
  if (!state || typeof state.step !== 'number') return { step: 0, answers: EMPTY_ANSWERS };
  return { step: state.step, answers: { ...EMPTY_ANSWERS, ...state.answers } };
};

const CreateOrganisationPage = () => {
  const { status, apps, retry } = useProCatalog();
  const { detailApp, openApp, closeApp } = useKitDetail();
  const isWide = useMediaQuery('(min-width: 1024px)');
  const initial = useMemo(readHistoryState, []);
  const [step, setStep] = useState(initial.step); // 0 : intro ; 1..3 : questions ; 4 : résultat
  const [answers, setAnswers] = useState(initial.answers);

  // Chaque étape est une entrée d'historique : le retour (navigateur ou Android)
  // revient à la question précédente au lieu de quitter l'assistant.
  useEffect(() => {
    // Les réponses déjà données restent cochées quand on revient en arrière.
    const onPop = () => setStep(readHistoryState().step);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const goTo = (nextStep, nextAnswers = answers) => {
    window.history.pushState({ trustiCreateOrg: { step: nextStep, answers: nextAnswers } }, '');
    setAnswers(nextAnswers);
    setStep(nextStep);
  };
  const goBack = () => window.history.back();

  useEffect(() => {
    document.title = t('org.create.k037');
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const appsById = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);
  const kit = useMemo(
    () => (step === QUESTIONS.length + 1 ? buildStarterKit(answers, appsById) : null),
    [step, answers, appsById],
  );

  const pick = (key, value) => goTo(step + 1, { ...answers, [key]: value });

  let content;
  if (step === 0) {
    content = <Intro onStart={() => goTo(1)} />;
  } else if (step <= QUESTIONS.length) {
    const question = QUESTIONS[step - 1];
    content = (
      <Question
        index={step - 1}
        question={question}
        value={answers[question.key]}
        onPick={value => pick(question.key, value)}
        onBack={goBack}
      />
    );
  } else if (status === 'loading') {
    content = <div className="py-16 flex justify-center"><LoadingSpinner /></div>;
  } else if (status === 'error') {
    content = (
      <div className="bg-white/80 rounded-3xl p-8 text-center shadow-sm">
        <p className="font-black text-slate-800">{t('org.create.k038')}</p>
        <button type="button" onClick={retry} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl">
          {t('org.create.retry')}
        </button>
      </div>
    );
  } else {
    content = <KitResult
        answers={answers}
        kit={kit}
        catalog={apps}
        detailApp={detailApp}
        openApp={openApp}
        closeApp={closeApp}
        isWide={isWide}
        onRestart={() => window.history.go(1 - step - (window.history.state?.trustiKitDetail ? 1 : 0))}
      />;
  }

  return (
    <div className="min-h-[100dvh]">
      <PageHeader />
      <main className={`${content.type === KitResult && detailApp && isWide ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 pt-8 pb-16 sm:pt-12`}>{content}</main>
    </div>
  );
};

export default CreateOrganisationPage;
