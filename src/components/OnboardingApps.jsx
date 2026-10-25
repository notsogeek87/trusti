import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, ShieldCheck, ArrowRight, ImagePlus, Search, X, Hand } from 'lucide-react';
import { API_URL } from '../utils/apiConfig';
import { pickBestAlternative } from '../utils/alternatives';
import { isNativeAndroid, isIOSWeb, isMobileWeb } from '../utils/platform';
import { loadOnboardingCatalog } from '../utils/onboardingCatalog';
import { normalizeAppName } from '../utils/screenshotAppMatcher';
import { useBackHandler } from '../hooks/useBackHandler';
import OnboardingSummary from './OnboardingSummary';
import OnboardingScreenshotImport from './OnboardingScreenshotImport';
import AppIconImage from './ui/AppIconImage';

const GOOD_GRADES = ['A', 'B', 'C'];

// Pour une liste d'apps donnée (ex: résultats d'un scan), repère les paires
// "app à risque → sa bonne alternative", quand les deux sont présentes dans
// la même liste (ex: Facebook + Mastodon trouvés ensemble) — pour qu'on
// puisse le signaler visuellement plutôt que de laisser l'utilisateur
// deviner qu'il a déjà migré. Si plusieurs bonnes apps du scan remplacent la
// même app à risque, on ne retient que la mieux notée (pickBestAlternative),
// pour rester cohérent avec la même règle utilisée dans "Mes Apps".
export function computeReplacementMap(apps) {
  const idsPresent = new Set(apps.map(a => String(a.id)));
  const candidatesByTarget = new Map(); // id (string) de l'app à risque -> apps alternatives candidates
  apps.forEach(app => {
    if (!GOOD_GRADES.includes(app.grade)) return;
    const targets = Array.isArray(app.replacesAppIds) && app.replacesAppIds.length > 0
      ? app.replacesAppIds
      : (app.replacesAppId ? [app.replacesAppId] : []);
    targets.forEach(targetId => {
      const key = String(targetId);
      if (key === String(app.id) || !idsPresent.has(key)) return;
      const existing = candidatesByTarget.get(key) || [];
      candidatesByTarget.set(key, [...existing, app]);
    });
  });

  const map = new Map();
  candidatesByTarget.forEach((candidates, targetId) => {
    map.set(targetId, pickBestAlternative(candidates));
  });
  return map;
}

// Étapes guidées par catégorie
const STEPS = [
  {
    id: 'messagerie',
    emoji: '💬',
    question: 'Pour communiquer avec tes proches ?',
    categories: ['Messagerie', 'Email', 'Visioconférence', 'Communication', 'Téléphone & SMS'],
  },
  {
    id: 'social',
    emoji: '📱',
    question: 'Sur quels réseaux sociaux tu es ?',
    categories: ['Réseaux sociaux', 'Rencontres'],
  },
  {
    id: 'media',
    emoji: '🎵',
    question: 'Pour la musique et les vidéos ?',
    categories: ['Multimédia', 'Streaming Musical', 'Streaming Vidéo', 'Podcasts', 'Lecteurs Multimédia'],
  },
  {
    id: 'work',
    emoji: '💼',
    question: 'Pour travailler et t\'organiser ?',
    categories: ['Productivité/Organisation', 'Stockage Cloud', 'Bureautique', 'Prise de Notes', 'IA'],
  },
  {
    id: 'navigation',
    emoji: '🗺️',
    question: 'Pour te déplacer ?',
    categories: ['Navigation', 'Navigation GPS', 'Cartographie', 'Transport & Voyage', 'Transport & Mobilité'],
  },
  {
    id: 'finance',
    emoji: '💳',
    question: 'Pour gérer ton argent ?',
    categories: ['Finance', 'Banque & Finance', 'Paiement Mobile'],
  },
];

// step -1 = intro
// step 0..N-1 = catégories
// step N = écran succès
// step N+1 = récapitulatif (combien d'apps par TrustiScore, note du téléphone)
const SUCCESS_STEP = STEPS.length;
const SUMMARY_STEP = STEPS.length + 1;

// Import par capture d'écran : web uniquement (l'APK Android a son propre scan).
const CAN_IMPORT_SCREENSHOT = !isNativeAndroid;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_RESULTS = 30;

export const GRADE_DOT = {
  A: 'bg-emerald-500',
  B: 'bg-green-400',
  C: 'bg-amber-400',
  D: 'bg-orange-500',
  E: 'bg-red-500',
};

const SLIDE_IN = {
  forward: 'onbSlideRight 0.26s cubic-bezier(0.22,1,0.36,1)',
  back: 'onbSlideLeft 0.26s cubic-bezier(0.22,1,0.36,1)',
};

export const ANIM_CSS = `
  @keyframes onbSlideRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes onbSlideLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes onbFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// `replacedBy` : app alternative déjà trouvée dans le même scan pour CETTE
// app à risque (ex: sur la tuile Facebook → { name: 'Mastodon', ... }).
// `isChosenAlternative` : cette app EST l'alternative déjà trouvée pour une
// autre app à risque du scan (ex: sur la tuile Mastodon).
export const AppTile = ({ app, selected, onToggle, replacedBy, isChosenAlternative }) => (
  <button
    onClick={onToggle ? () => onToggle(app.id) : undefined}
    disabled={!onToggle}
    className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-150 border-2 ${onToggle ? 'active:scale-95' : 'cursor-default'}
      ${selected
        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200'
        : 'bg-white border-transparent shadow-sm hover:border-indigo-200 hover:shadow-md'
      }
      ${replacedBy && !selected ? 'bg-amber-50' : ''}
      ${isChosenAlternative && !selected ? 'bg-emerald-50' : ''}
      ${replacedBy ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
      ${isChosenAlternative ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}
    `}
  >
    {selected && (
      <div className="absolute top-1.5 right-1.5 bg-white rounded-full w-5 h-5 flex items-center justify-center">
        <Check size={12} className="text-indigo-600" strokeWidth={3} />
      </div>
    )}
    {app.icon && app.icon.startsWith('http') ? (
      <div className="w-12 h-12 rounded-xl overflow-hidden"><AppIconImage src={app.icon} name={app.name} /></div>
    ) : (
      <div className={`w-12 h-12 rounded-xl ${app.color || 'bg-slate-400'} flex items-center justify-center text-2xl`}>
        {app.icon || app.name.charAt(0)}
      </div>
    )}
    <span className={`text-[11px] font-bold leading-tight text-center line-clamp-2 w-full ${selected ? 'text-white' : 'text-slate-800'}`}>
      {app.name}
    </span>
    <span className={`w-2 h-2 rounded-full ${GRADE_DOT[app.grade] || 'bg-slate-300'}`} title={`TrustiScore ${app.grade}`} />
    {replacedBy && (
      <span className={`flex items-center gap-0.5 text-[9px] font-bold leading-none ${selected ? 'text-amber-100' : 'text-amber-600'}`} title={`Déjà remplacée par ${replacedBy.name}`}>
        <ArrowRight size={9} strokeWidth={3} />
        <span className="truncate max-w-[64px]">{replacedBy.name}</span>
      </span>
    )}
    {isChosenAlternative && (
      <span className={`flex items-center gap-0.5 text-[9px] font-bold leading-none ${selected ? 'text-emerald-100' : 'text-emerald-600'}`} title="Déjà utilisée à la place d'une app moins respectueuse trouvée dans le scan">
        <Sparkles size={9} />
        <span>Déjà migré</span>
      </span>
    )}
  </button>
);

// Carte d'appel à l'import par capture d'écran (web) : c'est le chemin le
// plus rapide, on le montre avec un aperçu de ce qu'il fait.
const IMPORT_PREVIEW = ['WhatsApp', 'Spotify', 'Waze'];

const ImportScreenshotCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="relative w-full text-left bg-white border-2 border-indigo-500 rounded-3xl p-4 pt-5 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] hover:shadow-indigo-200"
  >
    <span className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
      Le plus rapide
    </span>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
        <ImagePlus size={24} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900 text-base leading-tight">Importer une capture d'écran</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {isIOSWeb ? 'Réglages → Apps' : 'Ta liste d\'apps dans les réglages'}, on reconnaît tes apps tout seul
        </p>
      </div>
      <ChevronRight size={20} className="text-indigo-500 shrink-0" />
    </div>
    <div className="mt-3 flex gap-1.5" aria-hidden="true">
      {IMPORT_PREVIEW.map(name => (
        <span key={name} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded-lg">
          <Check size={11} strokeWidth={3} /> {name}
        </span>
      ))}
      <span className="text-[11px] font-bold text-indigo-400 px-1 py-1">…</span>
    </div>
  </button>
);

// Carte du choix à la main : même poids visuel que l'import, pour que
// l'utilisateur voie qu'il a deux options et ne se sente pas piégé.
const MANUAL_PREVIEW = ['💬', '📱', '🎵', '💼', '🗺️', '💳'];

const ManualChoiceCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm transition-all active:scale-[0.98] hover:border-indigo-300"
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
        <Hand size={24} className="text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-900 text-base leading-tight">Choisir mes apps à la main</p>
        <p className="text-xs text-slate-500 mt-0.5">6 thèmes, tu touches les apps que tu utilises</p>
      </div>
      <ChevronRight size={20} className="text-slate-400 shrink-0" />
    </div>
    <div className="mt-3 flex gap-1.5" aria-hidden="true">
      {MANUAL_PREVIEW.map(emoji => (
        <span key={emoji} className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg text-sm">{emoji}</span>
      ))}
    </div>
  </button>
);

// `onExit` : retour depuis l'intro (sinon le retour quitte l'onboarding en
// gardant les apps déjà choisies).
const OnboardingApps = ({ onComplete, onExit }) => {
  const [step, setStep] = useState(-1); // -1 = intro
  const [direction, setDirection] = useState('forward');
  const [selected, setSelected] = useState(new Set());
  const [stepApps, setStepApps] = useState([]);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState(null); // catalogue complet, chargé à la première recherche
  const [catalogError, setCatalogError] = useState(false);
  const cache = useRef({});
  // Apps sélectionnées hors des grilles par catégorie (capture d'écran,
  // recherche) : gardées ici pour le récapitulatif.
  const extraApps = useRef(new Map());
  // Où ramène le retour depuis l'écran succès / le récapitulatif
  const successBackStep = useRef(STEPS.length - 1);
  const summaryBackTo = useRef('success'); // 'success' | 'import'
  const importedApps = useRef([]); // dernières apps confirmées depuis la capture
  const stepRef = useRef(step); // ref pour lire le step courant dans les callbacks async
  useEffect(() => { stepRef.current = step; }, [step]);

  const toggleApp = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goNext = () => { setDirection('forward'); setQuery(''); setStep(s => s + 1); };
  const goBack = () => { setDirection('back'); setQuery(''); setStep(s => s - 1); };

  const goToSuccess = () => {
    successBackStep.current = step;
    setDirection('forward');
    setStep(SUCCESS_STEP);
  };

  // Bouton retour (geste/bouton Android, navigateur, flèche de l'en-tête) :
  // revient à l'écran précédent ; depuis l'intro, quitte l'onboarding.
  // L'import par capture gère son propre retour pendant qu'il est affiché.
  const handleBack = () => {
    if (step === -1) {
      if (onExit) onExit();
      // Les apps déjà importées ou cochées sont gardées (direction Mes Apps)
      else onComplete(selected);
      return;
    }
    if (query) {
      setQuery('');
      return;
    }
    if (step === SUMMARY_STEP) {
      setDirection('back');
      if (summaryBackTo.current === 'import') {
        setStep(-1);
        setImporting(true);
      } else {
        setStep(SUCCESS_STEP);
      }
      return;
    }
    if (step === SUCCESS_STEP) {
      setDirection('back');
      setStep(successBackStep.current);
      return;
    }
    goBack();
  };
  useBackHandler(handleBack, !importing);

  const rememberApps = (apps) => {
    apps.forEach(app => extraApps.current.set(app.id, app));
  };

  // Apps reconnues sur la capture → directement le récapitulatif. Une app
  // décochée lors d'un nouvel import (après un retour) est bien retirée.
  const handleImportConfirm = (apps) => {
    rememberApps(apps);
    const previouslyImported = new Set(importedApps.current.map(a => a.id));
    const ids = new Set([...[...selected].filter(id => !previouslyImported.has(id)), ...apps.map(a => a.id)]);
    importedApps.current = apps;
    setSelected(ids);
    setImporting(false);
    if (ids.size === 0) {
      onComplete(ids);
      return;
    }
    summaryBackTo.current = 'import';
    setDirection('forward');
    setStep(SUMMARY_STEP);
  };

  // "Il en manque ?" → les grilles par catégorie, avec les apps reconnues déjà cochées.
  const handleImportManual = (apps) => {
    rememberApps(apps);
    setSelected(prev => new Set([...prev, ...apps.map(a => a.id)]));
    setImporting(false);
    setDirection('forward');
    setStep(0);
  };

  const handleSearchChange = (value) => {
    setQuery(value);
    if (!catalog && value.trim().length >= SEARCH_MIN_LENGTH) {
      setCatalogError(false);
      loadOnboardingCatalog().then(setCatalog).catch(() => setCatalogError(true));
    }
  };

  const toggleSearchedApp = (app) => {
    rememberApps([app]);
    toggleApp(app.id);
  };

  const handleSeeScore = () => {
    if (selected.size === 0) {
      onComplete(selected);
      return;
    }
    summaryBackTo.current = 'success';
    setDirection('forward');
    setStep(SUMMARY_STEP);
  };

  // Précharge toutes les catégories de tous les steps en parallèle
  // Une requête par catégorie → affichage progressif dès les premières réponses
  useEffect(() => {
    STEPS.forEach((stepData, idx) => {
      if (cache.current[idx] === undefined) cache.current[idx] = [];

      stepData.categories.forEach(cat => {
        fetch(`${API_URL}/apps?onboarding=true&categories=${encodeURIComponent(cat)}`)
          .then(r => r.json())
          .then(data => {
            if (!data.success || data.apps.length === 0) return;
            const existingIds = new Set(cache.current[idx].map(a => a.id));
            const newApps = data.apps.filter(a => !existingIds.has(a.id));
            if (newApps.length === 0) return;
            cache.current[idx] = [...cache.current[idx], ...newApps]
              .sort((a, b) => (a.popularity ?? 9999) - (b.popularity ?? 9999));
            // Si l'utilisateur est déjà sur ce step, on ajoute les apps au fil de l'eau
            if (stepRef.current === idx) {
              setStepApps([...cache.current[idx]]);
              setIsLoadingStep(false);
            }
          })
          .catch(() => {});
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Affiche les apps du step courant (instantané si déjà en cache)
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) { setStepApps([]); return; }
    if (cache.current[step]?.length > 0) {
      setStepApps(cache.current[step]);
      setIsLoadingStep(false);
      return;
    }
    // Pas encore prêt → spinner ; le prefetch mettra à jour quand il termine
    setIsLoadingStep(true);
    setStepApps([]);
  }, [step]);

  const progress = step < 0 ? 0 : Math.round(((step + 1) / STEPS.length) * 100);

  // Données complètes (avec grade) des apps déjà sélectionnées par
  // l'utilisateur — reconstituées à partir de tout ce qui a été chargé en
  // cache pendant les étapes (une app peut avoir été sélectionnée à une
  // étape puis affichée dans une autre si elle appartient à plusieurs
  // catégories). Contrairement à la version native (qui a un vrai scan des
  // apps installées), ici il n'y a pas de scan : seule une app que
  // l'utilisateur a lui-même cochée peut être considérée comme "déjà
  // utilisée".
  const selectedAppsData = useMemo(() => {
    const loaded = new Map(extraApps.current);
    Object.values(cache.current).forEach(list => {
      list.forEach(app => { if (!loaded.has(app.id)) loaded.set(app.id, app); });
    });
    return [...selected].map(id => loaded.get(id)).filter(Boolean);
  }, [selected, stepApps]);

  // Repère, parmi les apps déjà sélectionnées par l'utilisateur, celles qui
  // remplacent une autre app également sélectionnée (ex: Facebook + Mastodon
  // cochées toutes les deux) — pour ne signaler "Déjà migré" que sur des
  // apps réellement confirmées par l'utilisateur, jamais sur le simple
  // catalogue de la catégorie. Calculé avant les `return` conditionnels
  // ci-dessous pour respecter les règles des Hooks (toujours appelés dans
  // le même ordre).
  const replacementMap = useMemo(() => computeReplacementMap(selectedAppsData), [selectedAppsData]);
  const alternativeIds = useMemo(
    () => new Set([...replacementMap.values()].map(a => String(a.id))),
    [replacementMap]
  );

  // Recherche dans tout le catalogue, toutes catégories confondues.
  const searchKey = normalizeAppName(query);
  const searchResults = useMemo(() => {
    if (searchKey.length < SEARCH_MIN_LENGTH || !catalog) return [];
    return catalog
      .filter(app => normalizeAppName(app.name).includes(searchKey))
      .slice(0, SEARCH_MAX_RESULTS);
  }, [searchKey, catalog]);
  const isSearching = searchKey.length >= SEARCH_MIN_LENGTH;

  // ── IMPORT PAR CAPTURE D'ÉCRAN (web) ───────────────────────────────────
  if (importing) {
    return (
      <OnboardingScreenshotImport
        onConfirm={handleImportConfirm}
        onManual={handleImportManual}
        onBack={() => setImporting(false)}
        initialApps={importedApps.current}
      />
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Personnalise ton espace</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
            En <strong className="text-slate-700">30 secondes</strong>, dis-nous quelles apps tu utilises.
            On te montrera leur score de confidentialité.
          </p>
          {CAN_IMPORT_SCREENSHOT ? (
            // Web : deux choix présentés à égalité (l'import d'abord sur téléphone)
            <div className="w-full max-w-xs mx-auto text-left">
              <p className="text-center text-sm font-black text-slate-700 mb-4">Deux façons de faire, au choix :</p>
              <div className={`flex gap-5 ${isMobileWeb ? 'flex-col' : 'flex-col-reverse'}`}>
                <ImportScreenshotCard onClick={() => setImporting(true)} />
                <ManualChoiceCard onClick={goNext} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Tu pourras ajouter ou retirer des apps à tout moment.</p>
            </div>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95 mx-auto"
            >
              C'est parti <ChevronRight size={18} />
            </button>
          )}
          <button
            onClick={() => onComplete(selected)}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    );
  }

  // ── RÉCAPITULATIF (combien d'apps par TrustiScore, note du téléphone) ──
  if (step === SUMMARY_STEP) {
    return (
      <OnboardingSummary
        apps={selectedAppsData}
        onDetails={() => onComplete(selected)}
      />
    );
  }

  // ── ÉCRAN SUCCÈS ──────────────────────────────────────────────────────
  if (step === SUCCESS_STEP) {
    const count = selected.size;
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex flex-col items-center justify-center px-6 text-center text-white">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }} className="flex flex-col items-center">

          {/* Icône succès */}
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck size={44} className="text-white" />
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-black mb-2">
            {count === 0 ? 'Prêt à explorer !' : `${count} app${count !== 1 ? 's' : ''} ajoutée${count !== 1 ? 's' : ''} !`}
          </h2>
          <p className="text-white/70 text-sm mb-10 max-w-xs leading-relaxed">
            {count === 0
              ? 'Tu pourras ajouter des apps à tout moment depuis le catalogue.'
              : 'TrustiScore va analyser chaque app et te proposer des alternatives plus respectueuses de ta vie privée.'}
          </p>

          {/* Ce qui va se passer */}
          {count > 0 && (
            <div className="w-full max-w-xs space-y-3 mb-10" style={{ animation: 'onbFadeUp 0.4s 0.1s ease-out both' }}>
              {[
                { emoji: '🔍', text: 'Analyse de ta vie privée par app' },
                { emoji: '⭐', text: 'Score de A à E pour chaque app' },
                { emoji: '✅', text: 'Alternatives recommandées si besoin' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 text-left">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm font-semibold text-white/90">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA principal */}
          <button
            onClick={handleSeeScore}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-black text-base shadow-xl transition-all active:scale-95"
            style={{ animation: 'onbFadeUp 0.4s 0.2s ease-out both' }}
          >
            {count === 0 ? 'Explorer le catalogue' : 'Voir mon score de confidentialité'}
            <ArrowRight size={18} />
          </button>

        </div>
      </div>
    );
  }

  // ── ÉTAPE CATÉGORIE ───────────────────────────────────────────────────
  const currentStepData = STEPS[step];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <style>{ANIM_CSS}</style>

      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {step + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      {/* Contenu animé */}
      <div
        key={step}
        className="flex-1 max-w-md mx-auto w-full px-4 pb-40"
        style={{ animation: SLIDE_IN[direction] }}
      >
        {/* Question */}
        <div className="pt-8 pb-6 text-center">
          <span className="text-4xl mb-3 block">{currentStepData.emoji}</span>
          <h2 className="text-lg font-black text-slate-900 leading-snug">
            {currentStepData.question}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Sélectionne tout ce que tu utilises</p>
        </div>

        {/* Rappel de l'import : évite de parcourir les 6 catégories à la main */}
        {CAN_IMPORT_SCREENSHOT && (
          <button
            onClick={() => setImporting(true)}
            className="w-full mb-3 flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl px-3 py-2.5 text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <ImagePlus size={16} className="text-white" />
            </div>
            <p className="flex-1 text-xs text-indigo-900 leading-snug">
              <strong>Plus rapide :</strong> importe une capture{isIOSWeb ? ' de Réglages → Apps' : ' de ta liste d\'apps'}
            </p>
            <ChevronRight size={16} className="text-indigo-500 shrink-0" />
          </button>
        )}

        {/* Recherche dans tout le catalogue : plus rapide que parcourir les grilles */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Chercher une app (ex : WhatsApp)"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Grille d'apps */}
        {isSearching ? (
          catalogError ? (
            <p className="text-center text-sm text-slate-400 py-12">
              Recherche indisponible, vérifie ta connexion
            </p>
          ) : !catalog ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {searchResults.map(app => (
                <AppTile
                  key={app.id}
                  app={app}
                  selected={selected.has(app.id)}
                  onToggle={() => toggleSearchedApp(app)}
                  replacedBy={replacementMap.get(String(app.id))}
                  isChosenAlternative={alternativeIds.has(String(app.id))}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-400 py-12">
              Aucune app trouvée pour « {query.trim()} »
            </p>
          )
        ) : isLoadingStep ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          </div>
        ) : stepApps.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {stepApps.map(app => (
              <AppTile
                key={app.id}
                app={app}
                selected={selected.has(app.id)}
                onToggle={toggleApp}
                replacedBy={replacementMap.get(String(app.id))}
                isChosenAlternative={alternativeIds.has(String(app.id))}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400 py-12">
            Aucune app dans cette catégorie pour l'instant
          </p>
        )}
      </div>

      {/* Footer fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto space-y-2">
          <button
            onClick={goNext}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            {selected.size > 0
              ? `Continuer (${selected.size} sélectionnée${selected.size !== 1 ? 's' : ''})`
              : 'Passer cette catégorie'}
            <ChevronRight size={16} />
          </button>
          <button
            onClick={goToSuccess}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Terminer maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingApps;
