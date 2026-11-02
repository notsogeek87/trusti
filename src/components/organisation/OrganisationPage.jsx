import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Building2, Lock, MessageSquarePlus, Search, Upload } from 'lucide-react';
import { useProCatalog } from '../../hooks/useProCatalog';
import LoadingSpinner from '../ui/LoadingSpinner';
import FamilyPicker from './FamilyPicker';
import OrganisationResult from './OrganisationResult';
import AppDetailModal from '../modals/AppDetailModal';
import OrganisationReport from './OrganisationReport';
import SuggestToolDialog from './SuggestToolDialog';
import { ORG_PROFILES, profileApps } from '../../constants/orgProfiles';
import { isNativeAndroid } from '../../utils/platform';
import { ViewModeContext } from '../../contexts/ViewModeContext';
import downloadJSON from '../../utils/downloadJSON';
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
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
      window.history.pushState({ trustiOrgDetail: true }, '');
    }
    setDetailApp(app);
  }, []);
  const closeApp = useCallback(() => {
    if (window.history.state?.trustiOrgDetail) window.history.back();
    else { detailOpen.current = false; setDetailApp(null); }
  }, []);
  useEffect(() => {
    const onPop = () => { detailOpen.current = false; setDetailApp(null); };
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
    if (!saved) return;
    setSelectedIds(saved.ids.filter(id => appsById.has(id)));
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
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const exportCsv = () => downloadCsv(toCsv(selectedApps, criticality, plan), `trusti-organisation-${today}.csv`);
  const exportJson = () => downloadJSON(buildOrganisationExport(selectedIds, criticality, summary), `trusti-organisation-${today}.json`);

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
    <>
    <div className="min-h-[100dvh] print:hidden">
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

        {status === 'ready' && (
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

        {status === 'ready' && (
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

            <aside id="resultat" className="lg:sticky lg:top-20 scroll-mt-20">
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
                onPrint={isNativeAndroid ? undefined : () => window.print()}
                compact={isWide}
              />
            </aside>
          </div>
        )}
      </main>

      {/* Téléphone : le résultat est sous la liste, une barre fixe y mène. */}
      {status === 'ready' && summary.total > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-white/60 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <span className={`${GRADE_COLORS[summary.overallGrade]} ${['B', 'C', 'D'].includes(summary.overallGrade) ? 'text-slate-900' : 'text-white'} w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shrink-0`}>
              {summary.overallGrade}
            </span>
            <span className="flex-1 text-sm font-bold text-slate-700">
              {summary.total} outil{summary.total > 1 ? 's' : ''} évalué{summary.total > 1 ? 's' : ''}
            </span>
            <a href="#resultat" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black shrink-0">Voir le résultat</a>
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

    <OrganisationReport
      orgName={orgName}
      profileLabel={profileLabel}
      selectedApps={selectedApps}
      criticality={criticality}
      summary={summary}
      plan={plan}
    />
    </>
  );
};

export default OrganisationPage;
