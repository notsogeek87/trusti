import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Lock, MessageSquarePlus, Pencil, Search, Upload } from 'lucide-react';
import { useProCatalog } from '../../hooks/useProCatalog';
import LoadingSpinner from '../ui/LoadingSpinner';
import FamilyPicker from './FamilyPicker';
import OrganisationResult from './OrganisationResult';
import AppDetailModal from '../modals/AppDetailModal';
import SuggestToolDialog from './SuggestToolDialog';
import { ORG_PROFILES, profileApps } from '../../constants/orgProfiles';
import { ViewModeContext } from '../../contexts/ViewModeContext';
import downloadJSON from '../../utils/downloadJSON';
import { saveBlob } from '../../utils/saveFile';
import { downloadOrganisationPdf } from '../../utils/organisationPdf';
import { GRADE_COLORS } from '../../constants/grades';
import { loadOrganisationState, saveOrganisationState, clearOrganisationState } from '../../utils/organisationStorage';
import {
  groupAppsByFamily,
  computeOrganisationSummary,
  buildActionPlan,
  toCsv,
  buildOrganisationExport,
  parseOrganisationImport,
} from '../../utils/organisationAssessment';

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function downloadCsv(content, filename) {
  // BOM UTF-8 : accents corrects à l'ouverture dans Excel
  return saveBlob(new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' }), filename);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/**
 * Évaluation du parc applicatif d'une organisation (adresse « ?organisation »).
 * Page autonome : n'utilise ni l'état ni la navigation de l'app principale.
 * La sélection reste dans le navigateur (localStorage) et s'exporte en fichier.
 *
 * Deux vues, rangées dans l'historique (bouton retour) :
 * - « synthese » : note, exports, criticités, plan d'action ; vue d'arrivée quand
 *   une évaluation est déjà enregistrée ;
 * - « saisie » : la liste des outils à cocher, avec le résultat à côté.
 */
const OrganisationPage = () => {
  const { status, apps, retry } = useProCatalog();
  const [selectedIds, setSelectedIds] = useState([]);
  const [criticality, setCriticality] = useState({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('idle');
  const [view, setView] = useState('saisie');
  const viewRef = useRef(view);
  viewRef.current = view;
  const restored = useRef(false);
  const fileInput = useRef(null);
  // Même seuil que l'app principale pour la mise en page mobile de la fiche
  const isMobile = useMediaQuery('(max-width: 767px)');
  // Au-delà de 1024 px, le résultat est dans la colonne de droite (étroite)
  const isWide = useMediaQuery('(min-width: 1024px)');

  // Fiche détail par-dessus la page : le bouton retour du navigateur la ferme.
  const detailOpen = useRef(false);
  const openApp = useCallback(app => {
    if (!detailOpen.current) {
      detailOpen.current = true;
      window.history.pushState({ trustiOrgDetail: true, trustiOrgView: viewRef.current }, '');
    }
    setDetailApp(app);
  }, []);
  const closeApp = useCallback(() => {
    if (window.history.state?.trustiOrgDetail) window.history.back();
    else { detailOpen.current = false; setDetailApp(null); }
  }, []);
  useEffect(() => {
    const onPop = event => {
      detailOpen.current = false;
      setDetailApp(null);
      const nextView = event.state?.trustiOrgView;
      if (nextView === 'synthese' || nextView === 'saisie') setView(nextView);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    if (!detailApp) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [detailApp]);

  useEffect(() => {
    document.title = 'Évaluer mon organisation · Trusti';
  }, []);

  const appsById = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);

  // Restaurer la sélection une fois le catalogue chargé (ids inconnus écartés).
  useEffect(() => {
    if (status !== 'ready' || restored.current) return;
    restored.current = true;
    const saved = loadOrganisationState();
    const ids = saved ? saved.ids.filter(id => appsById.has(id)) : [];
    // Évaluation déjà enregistrée : on arrive sur la synthèse, pas sur la saisie.
    const initialView = ids.length > 0 ? 'synthese' : 'saisie';
    window.history.replaceState({ ...(window.history.state || {}), trustiOrgView: initialView }, '');
    setView(initialView);
    if (!saved) return;
    setSelectedIds(ids);
    setCriticality(saved.criticality);
    if (ORG_PROFILES.some(p => p.id === saved.profile)) setProfile(saved.profile);
    setOrgName(saved.orgName);
  }, [status, appsById]);

  useEffect(() => {
    if (restored.current) saveOrganisationState(selectedIds, criticality, { profile, orgName });
  }, [selectedIds, criticality, profile, orgName]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedApps = useMemo(() => selectedIds.map(id => appsById.get(id)).filter(Boolean), [selectedIds, appsById]);

  const groups = useMemo(() => {
    const q = normalize(search.trim());
    const filtered = q
      ? apps.filter(a => normalize(a.name).includes(q) || normalize(a.developer).includes(q) || normalize(a.category).includes(q))
      : apps;
    const families = groupAppsByFamily(filtered);
    // Profil choisi : ses outils fréquents en tête (hors recherche)
    const suggested = !q && profile ? profileApps(profile, appsById) : [];
    if (suggested.length === 0) return families;
    const label = ORG_PROFILES.find(p => p.id === profile).label;
    return [{ family: { id: 'profil', label: `Outils fréquents : ${label}` }, apps: suggested }, ...families];
  }, [apps, search, profile, appsById]);
  const profileLabel = ORG_PROFILES.find(p => p.id === profile)?.label || null;

  const summary = useMemo(() => computeOrganisationSummary(selectedApps, criticality), [selectedApps, criticality]);
  const plan = useMemo(() => buildActionPlan(selectedApps, apps, criticality), [selectedApps, apps, criticality]);
  // Sans outil, la synthèse n'a rien à montrer : on reste sur la saisie.
  const isSynthese = status === 'ready' && view === 'synthese' && summary.total > 0;

  const showView = useCallback(next => {
    if (next === viewRef.current) return;
    window.scrollTo(0, 0);
    // Retour à la vue précédente : on recule dans l'historique plutôt que d'empiler.
    if (window.history.state?.trustiOrgPrevView === next) {
      window.history.back();
      return;
    }
    window.history.pushState({ trustiOrgView: next, trustiOrgPrevView: viewRef.current }, '');
    setView(next);
  }, []);

  const toggle = useCallback(id => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const setLevel = useCallback((id, level) => {
    setCriticality(prev => ({ ...prev, [id]: level }));
  }, []);

  const clearAll = useCallback(() => {
    if (!window.confirm('Retirer tous les outils de l\'évaluation ?')) return;
    setSelectedIds([]);
    setCriticality({});
    setProfile(null);
    setOrgName('');
    clearOrganisationState();
    window.history.replaceState({ ...(window.history.state || {}), trustiOrgView: 'saisie' }, '');
    setView('saisie');
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const reportExportError = err => {
    console.error('Export', err);
    window.alert('Le fichier n\'a pas pu être enregistré. Réessayez.');
  };
  const exportCsv = () => downloadCsv(toCsv(selectedApps, criticality, plan), `trusti-organisation-${today}.csv`).catch(reportExportError);
  const exportJson = () => downloadJSON(buildOrganisationExport(selectedIds, criticality, summary), `trusti-organisation-${today}.json`).catch(reportExportError);

  const downloadPdf = () => {
    setPdfStatus('working');
    downloadOrganisationPdf({ orgName, profileLabel, selectedApps, criticality, summary, plan })
      .then(() => setPdfStatus('idle'))
      .catch(err => {
        console.error('PDF', err);
        setPdfStatus('error');
      });
  };

  const importFile = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    file.text()
      .then(text => {
        const parsed = parseOrganisationImport(JSON.parse(text), apps.map(a => a.id));
        if (!parsed) throw new Error('format');
        setSelectedIds(parsed.ids);
        setCriticality(parsed.criticality);
        setMessage(`${parsed.ids.length} outil${parsed.ids.length > 1 ? 's' : ''} importé${parsed.ids.length > 1 ? 's' : ''}.`);
      })
      .catch(() => setMessage('Ce fichier n\'est pas une évaluation Trusti enregistrée.'));
  };

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600">
            <ArrowLeft size={16} /> Trusti
          </a>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-2 font-black text-indigo-600 truncate">
            <Building2 size={18} className="shrink-0" /> Évaluer mon organisation
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-24 lg:pb-6">
        {!isSynthese && (
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Quelle est la souveraineté numérique de votre parc applicatif ?</h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Cochez les outils utilisés dans votre entreprise, votre collectivité ou votre association. Trusti calcule une note globale,
            repère les outils à risque et propose des alternatives mieux notées.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Lock size={13} /> Votre sélection reste dans ce navigateur : elle n'est jamais envoyée à Trusti.
          </p>
        </div>
        )}

        {status === 'ready' && !isSynthese && (
          <section className="mb-5 bg-white/80 rounded-2xl border border-white p-4 shadow-sm">
            <p className="text-sm font-black text-slate-800 mb-2">Votre structure</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type de structure">
              {ORG_PROFILES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={profile === p.id}
                  onClick={() => setProfile(prev => (prev === p.id ? null : p.id))}
                  className={`px-3 py-1.5 rounded-full border text-sm font-bold transition-colors
                    ${profile === p.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {profile ? 'Les outils les plus courants pour ce type de structure sont proposés en tête de liste.' : 'Facultatif : met en avant les outils les plus courants pour votre type de structure.'}
            </p>
            <label className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm font-bold text-slate-700">
              <span className="shrink-0">Nom de l'organisation <span className="font-normal text-slate-400">(pour le rapport, facultatif)</span></span>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value.slice(0, 120))}
                placeholder="Ex. : Mairie de Saint-Clément"
                className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400"
              />
            </label>
          </section>
        )}

        {status === 'loading' && <LoadingSpinner message="Chargement des outils professionnels…" />}

        {status === 'error' && (
          <div className="bg-white/90 rounded-2xl p-5 text-sm shadow-sm">
            <p className="font-black text-slate-800">Impossible de charger le catalogue.</p>
            <p className="text-slate-600 mb-3">Vérifiez votre connexion puis réessayez.</p>
            <button type="button" onClick={retry} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black">Réessayer</button>
          </div>
        )}

        {isSynthese && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Synthèse de votre parc</p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 break-words">{orgName.trim() || 'Votre organisation'}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {profileLabel ? `${profileLabel} · ` : ''}{summary.total} outil{summary.total > 1 ? 's' : ''} évalué{summary.total > 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => showView('saisie')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-black text-indigo-600 hover:border-indigo-400 shadow-sm"
              >
                <Pencil size={16} /> Modifier mes outils
              </button>
            </div>
            {message && (
              <p className="mb-3 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl px-3 py-2" role="status">{message}</p>
            )}
            <OrganisationResult
              selectedApps={selectedApps}
              criticality={criticality}
              summary={summary}
              plan={plan}
              onCriticalityChange={setLevel}
              onRemove={toggle}
              onClear={clearAll}
              onExportCsv={exportCsv}
              onExportJson={exportJson}
              onOpenApp={openApp}
              onDownloadPdf={downloadPdf}
              pdfStatus={pdfStatus}
              compact={false}
            />
            <p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Lock size={13} /> Votre évaluation reste dans ce navigateur : elle n'est jamais envoyée à Trusti.
            </p>
          </div>
        )}

        {status === 'ready' && !isSynthese && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <label className="flex-1 min-w-[12rem] flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 focus-within:border-indigo-400">
                  <Search size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={`Rechercher parmi ${apps.length} outils`}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-indigo-300"
                >
                  <Upload size={15} /> Ouvrir une évaluation
                </button>
                <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
                <button
                  type="button"
                  onClick={() => setSuggesting(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-indigo-300"
                >
                  <MessageSquarePlus size={15} /> Il manque un outil
                </button>
              </div>
              {message && (
                <p className="mb-3 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl px-3 py-2" role="status">{message}</p>
              )}
              <FamilyPicker groups={groups} selectedIds={selectedSet} onToggle={toggle} onSuggest={() => setSuggesting(true)} />
              <p className="mt-4 text-xs text-slate-500">
                Les notes TrustiScore portent sur la souveraineté numérique (gouvernance, localisation des données, conformité,
                contrôle technique, transparence). Un outil manque ?{' '}
                <button type="button" onClick={() => setSuggesting(true)} className="font-bold text-purple-600 hover:underline">Proposez-le</button>.
              </p>
            </div>

            {/* Ordinateur : la colonne reste visible et défile seule, sans attendre la fin de la liste. */}
            <aside id="resultat" className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 lg:pb-2 scroll-mt-20">
              {summary.total > 0 && (
                <button
                  type="button"
                  onClick={() => showView('synthese')}
                  className="hidden lg:flex mb-3 w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 shadow-sm"
                >
                  <CheckCircle2 size={16} /> Terminer et voir la synthèse
                </button>
              )}
              <OrganisationResult
                selectedApps={selectedApps}
                criticality={criticality}
                summary={summary}
                plan={plan}
                onCriticalityChange={setLevel}
                onRemove={toggle}
                onClear={clearAll}
                onExportCsv={exportCsv}
                onExportJson={exportJson}
                onOpenApp={openApp}
                onDownloadPdf={downloadPdf}
                pdfStatus={pdfStatus}
                compact={isWide}
              />
            </aside>
          </div>
        )}
      </main>

      {/* Téléphone : le résultat est sous la liste ; une barre fixe mène à la synthèse. */}
      {status === 'ready' && !isSynthese && summary.total > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-white/60 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <span className={`${GRADE_COLORS[summary.overallGrade]} ${['B', 'C', 'D'].includes(summary.overallGrade) ? 'text-slate-900' : 'text-white'} w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shrink-0`}>
              {summary.overallGrade}
            </span>
            <span className="flex-1 text-sm font-bold text-slate-700">
              {summary.total} outil{summary.total > 1 ? 's' : ''} évalué{summary.total > 1 ? 's' : ''}
            </span>
            <button type="button" onClick={() => showView('synthese')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black shrink-0">Voir la synthèse</button>
          </div>
        </div>
      )}

      {detailApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#E9F0F6]" role="dialog" aria-modal="true" aria-label={`Fiche de ${detailApp.name}`}>
          <ViewModeContext.Provider value={isMobile}>
            <AppDetailModal
              key={detailApp.id}
              app={detailApp}
              onClose={closeApp}
              onSelectApp={openApp}
              allApps={apps}
            />
          </ViewModeContext.Provider>
        </div>
      )}

      {suggesting && <SuggestToolDialog initialName={search.trim()} onClose={() => setSuggesting(false)} />}
    </div>
  );
};

export default OrganisationPage;
