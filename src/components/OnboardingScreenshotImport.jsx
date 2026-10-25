import React, { useState, useMemo, useRef } from 'react';
import { ImagePlus, ChevronLeft, ArrowRight, ListChecks, Lock, ShieldCheck } from 'lucide-react';
import { AppTile, ANIM_CSS, computeReplacementMap } from './OnboardingApps';
import { loadOnboardingCatalog } from '../utils/onboardingCatalog';
import { buildAppIndex, matchAppsFromText } from '../utils/screenshotAppMatcher';
import { isIOSWeb } from '../utils/platform';
import { useBackHandler } from '../hooks/useBackHandler';

// Onboarding web uniquement : sur iPhone, aucune API ne liste les apps
// installées. On fait importer une capture de Réglages → Apps, dont le texte
// est lu dans le navigateur puis comparé au catalogue.
const HOWTO_STEPS = isIOSWeb
  ? [
    <>
      Ouvre <strong>Réglages</strong>, descends tout en bas et touche <strong>Apps</strong>.
      <span className="block text-xs text-slate-400 mt-0.5">iOS 17 ou avant : Réglages → Général → Stockage iPhone</span>
    </>,
    <>Fais une capture d'écran (bouton latéral + volume haut). Fais défiler et recommence jusqu'en bas de la liste.</>,
    <>Reviens ici et choisis tes captures.</>,
  ]
  : [
    <>Ouvre les <strong>réglages</strong> de ton téléphone, puis la liste de tes <strong>applications</strong>.</>,
    <>Fais une capture d'écran. Fais défiler et recommence jusqu'en bas de la liste.</>,
    <>Reviens ici et choisis tes captures.</>,
  ];

// iCloud n'apparaît pas dans Réglages → Apps (il est dans le compte Apple),
// mais presque tout iPhone l'utilise : on l'ajoute coché, décochable.
const IPHONE_ALWAYS_PRESENT_IDS = ['apple-icloud'];

const PickScreenshotsButton = ({ onFiles, primary, children }) => {
  const inputRef = useRef(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = [...(e.target.files || [])];
          e.target.value = ''; // permet de choisir à nouveau la même capture
          if (files.length > 0) onFiles(files);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={primary
          ? 'w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95'
          : 'w-full flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors py-2'}
      >
        <ImagePlus size={primary ? 18 : 14} />
        {children}
      </button>
    </>
  );
};

// `initialApps` : apps déjà reconnues (retour depuis le récapitulatif), on
// rouvre directement sur les résultats.
const OnboardingScreenshotImport = ({ onConfirm, onManual, onBack, initialApps = [] }) => {
  // 'howto' | 'reading' | 'results' | 'error'
  const [phase, setPhase] = useState(initialApps.length > 0 ? 'results' : 'howto');
  const [matches, setMatches] = useState(initialApps);
  const [selected, setSelected] = useState(() => new Set(initialApps.map(a => a.id)));
  const [progress, setProgress] = useState({ index: 0, total: 1, ratio: 0, preparing: true });
  const [lastFiles, setLastFiles] = useState([]);

  const replacementMap = useMemo(() => computeReplacementMap(matches), [matches]);
  const alternativeIds = useMemo(
    () => new Set([...replacementMap.values()].map(a => String(a.id))),
    [replacementMap]
  );

  const selectedApps = () => matches.filter(app => selected.has(app.id));

  // Retour : résultats ou erreur → explications ; explications → écran
  // précédent ; pendant la lecture, rien (elle se termine d'elle-même).
  useBackHandler(() => {
    if (phase === 'reading') return;
    if (phase === 'results' || phase === 'error') {
      setPhase('howto');
      return;
    }
    onBack();
  });

  const toggleApp = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Les nouvelles captures s'ajoutent aux apps déjà reconnues (on peut
  // importer la liste en plusieurs fois).
  const readScreenshots = async (files) => {
    setLastFiles(files);
    setPhase('reading');
    setProgress({ index: 0, total: files.length, ratio: 0, preparing: true });
    try {
      const catalogPromise = loadOnboardingCatalog();
      const { readScreenshotsText } = await import('../utils/screenshotOcr');
      const text = await readScreenshotsText(files, setProgress);
      const catalog = await catalogPromise;
      const found = matchAppsFromText(text, buildAppIndex(catalog));
      if (isIOSWeb) {
        catalog
          .filter(app => IPHONE_ALWAYS_PRESENT_IDS.includes(String(app.id)))
          .forEach(app => { if (!found.some(f => f.id === app.id)) found.push(app); });
      }

      const knownIds = new Set(matches.map(a => a.id));
      const added = found.filter(app => !knownIds.has(app.id));
      setMatches(prev => [...prev, ...added]);
      setSelected(prev => new Set([...prev, ...added.map(a => a.id)]));
      setPhase('results');
    } catch (err) {
      console.error('Lecture de la capture échouée:', err);
      setPhase('error');
    }
  };

  // ── COMMENT FAIRE ────────────────────────────────────────────────────
  if (phase === 'howto') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 py-10">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }} className="w-full max-w-xs mx-auto">
          <button
            onClick={onBack}
            className="mb-4 -ml-1 p-1 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-200">
            <ImagePlus size={30} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2 text-center">Importe ta liste d'apps</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 text-center">
            Une capture d'écran suffit, Trusti reconnaît tes apps tout seul.
          </p>

          <ol className="space-y-3 mb-6">
            {HOWTO_STEPS.map((content, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 leading-snug pt-1">{content}</p>
              </li>
            ))}
          </ol>

          <div className="flex items-start gap-2 bg-emerald-50 rounded-2xl px-3 py-2.5 mb-6">
            <Lock size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-snug">
              La capture est lue directement sur ton téléphone. Elle n'est jamais envoyée.
            </p>
          </div>

          <PickScreenshotsButton onFiles={readScreenshots} primary>
            Choisir mes captures
          </PickScreenshotsButton>
          {matches.length > 0 && (
            <button
              onClick={() => setPhase('results')}
              className="w-full mt-3 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Revoir mes {matches.length} app{matches.length !== 1 ? 's' : ''} reconnue{matches.length !== 1 ? 's' : ''}
            </button>
          )}
          <button
            onClick={() => onManual([])}
            className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Choisir mes apps à la main plutôt
          </button>
        </div>
      </div>
    );
  }

  // ── LECTURE EN COURS ─────────────────────────────────────────────────
  if (phase === 'reading') {
    const { index, total, ratio, preparing } = progress;
    const percent = Math.round(((Math.min(index, total - 1) + ratio) / total) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }} className="w-full max-w-xs">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <ImagePlus size={36} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-3">
            {total > 1 ? `Lecture de la capture ${Math.min(index + 1, total)}/${total}` : 'Lecture de ta capture'}
          </h1>
          <div className="w-56 h-1.5 bg-indigo-100 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${preparing ? 4 : percent}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {preparing
              ? 'Préparation de la lecture, plus rapide les fois suivantes...'
              : 'Tout se passe sur ton téléphone, ça prend quelques secondes.'}
          </p>
        </div>
      </div>
    );
  }

  // ── ERREUR ────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }} className="w-full max-w-xs">
          <h1 className="text-xl font-black text-slate-900 mb-3">La lecture n'a pas fonctionné</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Vérifie ta connexion internet (nécessaire la première fois), puis réessaie. Tu peux aussi choisir tes apps à la main.
          </p>
          <button
            onClick={() => readScreenshots(lastFiles)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Réessayer
          </button>
          <button
            onClick={() => onManual(selectedApps())}
            className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Choisir mes apps à la main
          </button>
        </div>
      </div>
    );
  }

  // ── RÉSULTATS ─────────────────────────────────────────────────────────
  const count = selected.size;
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <style>{ANIM_CSS}</style>
      <div className="flex-1 max-w-md mx-auto w-full px-4 pb-40" style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
        <div className="pt-10 pb-6 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={30} className="text-white" />
          </div>
          {matches.length > 0 ? (
            <>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {matches.length} app{matches.length !== 1 ? 's' : ''} reconnue{matches.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Décoche celles qui ne sont pas à toi</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-black text-slate-900 leading-snug">Aucune app reconnue</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Vérifie que la capture montre bien la liste de Réglages → Apps, ou choisis tes apps à la main.
              </p>
            </>
          )}
        </div>

        {matches.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {matches.map(app => (
              <AppTile
                key={app.id}
                app={app}
                selected={selected.has(app.id)}
                onToggle={toggleApp}
                replacedBy={selected.has(app.id) ? replacementMap.get(String(app.id)) : undefined}
                isChosenAlternative={selected.has(app.id) && alternativeIds.has(String(app.id))}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <PickScreenshotsButton onFiles={readScreenshots}>
            Ajouter d'autres captures
          </PickScreenshotsButton>
          <button
            onClick={() => onManual(selectedApps())}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors py-2"
          >
            <ListChecks size={14} />
            Il en manque ? Compléter à la main
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => (count > 0 ? onConfirm(selectedApps()) : onManual([]))}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            {count > 0 ? 'Voir mon score' : 'Choisir à la main'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreenshotImport;
