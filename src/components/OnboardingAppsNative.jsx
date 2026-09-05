import React, { useState, useMemo, useEffect } from 'react';
import { ScanSearch, ShieldCheck, ArrowRight, ListChecks, Globe, Lock, Eye } from 'lucide-react';
import InstalledApps from '../native/InstalledApps';
import { AppTile, ANIM_CSS, computeReplacementMap } from './OnboardingApps';
import OnboardingSummary from './OnboardingSummary';
import { API_URL } from '../utils/apiConfig';
import { extractPackageId } from '../utils/androidPackage';

const rand = (min, max) => Math.random() * (max - min) + min;

// Positionne l'icône hors de la zone centrale (logo + texte + spinner).
function randomFloatPosition() {
  let top, left;
  let guard = 0;
  do {
    top = rand(4, 88);
    left = rand(4, 88);
    guard += 1;
  } while (guard < 12 && top > 28 && top < 76 && left > 18 && left < 82);
  return { top, left };
}

const SPARKLE_ANGLES = Array.from({ length: 10 }, (_, i) => i * 36);

const FINALIZE_CSS = `
  @keyframes onbConverge {
    from { transform: translate(var(--sx), var(--sy)) scale(1); opacity: 1; }
    to   { transform: translate(0, 0) scale(0.15); opacity: 0; }
  }
  @keyframes onbSparkle {
    0%   { transform: rotate(var(--sangle)) translateX(0) scale(0); opacity: 1; }
    60%  { opacity: 1; }
    100% { transform: rotate(var(--sangle)) translateX(70px) scale(1); opacity: 0; }
  }
  @keyframes onbShieldPop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
`;

const FLOAT_CSS = `
  @keyframes onbFloatIn {
    0%   { opacity: 0; transform: scale(0.3); }
    60%  { opacity: 1; transform: scale(1.12); }
    100% { opacity: var(--fop, 0.9); transform: scale(1); }
  }
  @keyframes onbFloatDrift {
    0%   { transform: translate(0, 0) rotate(0deg); }
    25%  { transform: translate(var(--fx1), var(--fy1)) rotate(var(--fr1)); }
    50%  { transform: translate(var(--fx2), var(--fy2)) rotate(var(--fr2)); }
    75%  { transform: translate(var(--fx3), var(--fy3)) rotate(var(--fr3)); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
`;

const PROGRESS_CSS = `
  @keyframes onbProgressSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
`;

// Barre de chargement indéterminée : le scan (fetch catalogue + lecture des
// packages installés) prend jusqu'à ~5s sans qu'aucune icône n'apparaisse
// encore, cette barre rassure l'utilisateur pendant ce temps mort.
const ScanProgressBar = () => (
  <div className="w-56 h-1.5 bg-indigo-100 rounded-full overflow-hidden mx-auto">
    <style>{PROGRESS_CSS}</style>
    <div
      className="h-full w-1/3 bg-indigo-500 rounded-full"
      style={{ animation: 'onbProgressSlide 1.1s ease-in-out infinite' }}
    />
  </div>
);

// Icônes des vraies apps trouvées installées, révélées une à une (via `count`)
// à mesure que le scan les identifie, à des positions flottantes fixées une
// fois pour toutes par app (useMemo) pour qu'elles ne sautent pas d'écran.
const FloatingApps = ({ apps, count }) => {
  const layout = useMemo(() => (
    apps.map(app => {
      const duration = rand(4.5, 8);
      return {
        app,
        ...randomFloatPosition(),
        size: Math.round(rand(38, 54)),
        duration,
        driftDelay: -rand(0, duration),
        opacity: rand(0.65, 0.95),
        fx1: `${rand(-35, 35)}px`, fy1: `${rand(-35, 35)}px`, fr1: `${rand(-18, 18)}deg`,
        fx2: `${rand(-35, 35)}px`, fy2: `${rand(-35, 35)}px`, fr2: `${rand(-18, 18)}deg`,
        fx3: `${rand(-35, 35)}px`, fy3: `${rand(-35, 35)}px`, fr3: `${rand(-18, 18)}deg`,
      };
    })
  ), [apps]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style>{FLOAT_CSS}</style>
      {layout.slice(0, count).map(({ app, top, left, size, duration, driftDelay, opacity, fx1, fy1, fr1, fx2, fy2, fr2, fx3, fy3, fr3 }) => (
        <div
          key={app.id}
          className="absolute rounded-xl shadow-md overflow-hidden"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: size,
            height: size,
            '--fop': opacity,
            '--fx1': fx1, '--fy1': fy1, '--fr1': fr1,
            '--fx2': fx2, '--fy2': fy2, '--fr2': fr2,
            '--fx3': fx3, '--fy3': fy3, '--fr3': fr3,
            animation: `onbFloatIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, onbFloatDrift ${duration}s ease-in-out ${driftDelay}s infinite`,
          }}
        >
          {app.icon && app.icon.startsWith('http') ? (
            <img src={app.icon} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${app.color || 'bg-slate-400'} flex items-center justify-center text-lg`}>
              {app.icon || app.name.charAt(0)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Onboarding Android natif : scanne les apps installées sur l'appareil au lieu
// de demander une sélection manuelle. Ne s'affiche que dans l'app Android
// packagée (voir src/utils/platform.js) — le web garde OnboardingApps.jsx.
const OnboardingAppsNative = ({ onComplete, onSignUp, onManualSelection }) => {
  // 'intro' | 'scanning' | 'results' | 'finalizing' | 'summary' | 'error'
  const [phase, setPhase] = useState('intro');
  const [matches, setMatches] = useState([]); // apps du catalogue trouvées installées
  const [selected, setSelected] = useState(new Set());
  const [foundApps, setFoundApps] = useState([]); // sous-ensemble de `matches` révélé pendant l'animation de scan
  const [revealedCount, setRevealedCount] = useState(0);
  const [scanHint, setScanHint] = useState(null); // message de réassurance affiché pendant l'attente du scan

  // Messages de réassurance pendant le temps mort du scan (avant que les
  // premières icônes n'apparaissent), pour éviter que l'utilisateur ne
  // pense que l'app est figée et quitte l'onboarding.
  useEffect(() => {
    if (phase !== 'scanning') {
      setScanHint(null);
      return;
    }
    const t1 = setTimeout(
      () => setScanHint("Forcément, s'il y a beaucoup d'applications, c'est un peu plus long..."),
      2000
    );
    const t2 = setTimeout(() => setScanHint('Promis, c\'est bientôt fini !'), 7000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const toggleApp = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Repère, parmi les apps trouvées, celles déjà remplacées par une
  // alternative également trouvée sur le téléphone (ex: Facebook + Mastodon
  // installés tous les deux). Calculé avant les `return` conditionnels
  // ci-dessous pour respecter les règles des Hooks.
  const replacementMap = useMemo(() => computeReplacementMap(matches), [matches]);
  const alternativeIds = useMemo(
    () => new Set([...replacementMap.values()].map(a => String(a.id))),
    [replacementMap]
  );

  // Petite transition "magique" (icônes qui convergent + étincelles) entre la
  // validation et le récapitulatif, plutôt qu'un cut brutal vers la liste d'apps.
  const handleFinish = async () => {
    if (selected.size === 0) {
      onComplete(selected);
      return;
    }
    setPhase('finalizing');
    await new Promise(resolve => setTimeout(resolve, 2200));
    setPhase('summary');
  };

  const runScan = async () => {
    setPhase('scanning');
    setFoundApps([]);
    setRevealedCount(0);
    try {
      const installedPromise = InstalledApps.getInstalledPackages();
      const catalogRes = await fetch(`${API_URL}/apps?onboarding=true`).then(r => r.json());
      if (!catalogRes.success) throw new Error('catalog fetch failed');

      const installedRes = await installedPromise;
      const installedPackages = new Set(installedRes.packages || []);
      const found = catalogRes.apps.filter(app => {
        const pkg = extractPackageId(app.playStoreUrl);
        return pkg && installedPackages.has(pkg);
      });

      // Révèle les apps trouvées une à une (plafonné pour rester lisible à
      // l'écran) pour donner l'impression d'un scan qui les découvre en direct.
      const REVEAL_CAP = 14;
      const toReveal = found.slice(0, REVEAL_CAP);
      setFoundApps(toReveal);

      if (toReveal.length > 0) {
        const REVEAL_TOTAL_MS = 1800;
        const interval = Math.min(280, Math.max(90, REVEAL_TOTAL_MS / toReveal.length));
        for (let i = 0; i < toReveal.length; i++) {
          setRevealedCount(i + 1);
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // laisse voir la dernière icône trouvée
      } else {
        await new Promise(resolve => setTimeout(resolve, 900));
      }

      setMatches(found);
      setSelected(new Set(found.map(a => a.id)));
      setPhase('results');
    } catch (err) {
      console.error('Scan des apps installées échoué:', err);
      setPhase('error');
    }
  };

  // ── INTRO : explique l'app avant de pousser à lancer le scan ─────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }} className="max-w-xs mx-auto">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Découvre ce que tes apps savent de toi</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Trusti évalue plus de 100 apps populaires sur 12 critères objectifs, pour te donner
            une note claire et te dire ce qu'elles font vraiment de tes données.
          </p>

          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Globe size={16} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600 leading-snug pt-1.5">Hébergement des données en Europe, conformité RGPD</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600 leading-snug pt-1.5">Protection contre le Cloud Act et la surveillance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Eye size={16} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600 leading-snug pt-1.5">Scores transparents, basés sur des critères objectifs</p>
            </div>
          </div>

          <button
            onClick={runScan}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <ScanSearch size={18} />
            Scanner mon téléphone
          </button>
          <p className="text-xs text-slate-400 mt-3">On repère tes apps installées automatiquement, rien à saisir</p>
          {onManualSelection && (
            <button
              onClick={onManualSelection}
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sélection manuelle
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SCAN EN COURS ──────────────────────────────────────────────────
  if (phase === 'scanning') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <style>{ANIM_CSS}</style>
        <FloatingApps apps={foundApps} count={revealedCount} />
        <div className="relative z-10" style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <ScanSearch size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">On scanne ton téléphone</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
            Trusti repère automatiquement les apps installées qu'on connaît, pour t'éviter
            de tout sélectionner à la main.
          </p>
          <ScanProgressBar />
          <p key={scanHint || 'default'} className="text-xs text-slate-400 mt-3" style={{ animation: 'onbFadeUp 0.3s ease-out' }}>
            {scanHint || 'Analyse en cours, ça ne prend que quelques secondes...'}
          </p>
        </div>
      </div>
    );
  }

  // ── ERREUR (scan natif indisponible) ────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
          <h1 className="text-xl font-black text-slate-900 mb-3">Le scan n'a pas fonctionné</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
            Pas de souci, tu peux sélectionner tes apps à la main à la place.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={runScan}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Réessayer
            </button>
            {onManualSelection && (
              <button
                onClick={onManualSelection}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sélection manuelle
              </button>
            )}
            <button
              onClick={() => onComplete(new Set())}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Passer cette étape
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TRANSITION "MAGIQUE" AVANT L'ÉCRAN FINAL ──────────────────────────
  if (phase === 'finalizing') {
    const previewApps = matches.filter(app => selected.has(app.id)).slice(0, 8);
    const n = previewApps.length;
    const radius = 100;
    const stagger = n > 0 ? Math.min(120, 900 / n) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <style>{ANIM_CSS}</style>
        <style>{FINALIZE_CSS}</style>
        <div className="relative w-64 h-64 flex items-center justify-center">
          {previewApps.map((app, i) => {
            const angle = (360 / n) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const sx = Math.cos(rad) * radius;
            const sy = Math.sin(rad) * radius;
            return (
              <div
                key={app.id}
                className="absolute rounded-xl shadow-lg overflow-hidden"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 44,
                  height: 44,
                  marginTop: -22,
                  marginLeft: -22,
                  '--sx': `${sx}px`,
                  '--sy': `${sy}px`,
                  animation: `onbConverge 0.9s cubic-bezier(0.6, -0.28, 0.74, 0.05) ${i * stagger}ms forwards`,
                }}
              >
                {app.icon && app.icon.startsWith('http') ? (
                  <img src={app.icon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${app.color || 'bg-slate-400'} flex items-center justify-center text-lg`}>
                    {app.icon || app.name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}

          {SPARKLE_ANGLES.map(angle => (
            <div
              key={angle}
              className="absolute w-1.5 h-1.5 rounded-full bg-white"
              style={{
                top: '50%',
                left: '50%',
                marginTop: -3,
                marginLeft: -3,
                '--sangle': `${angle}deg`,
                animation: 'onbSparkle 0.7s ease-out 1.3s forwards',
                opacity: 0,
              }}
            />
          ))}

          <div
            className="w-24 h-24 bg-white/15 backdrop-blur rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ animation: 'onbShieldPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s both' }}
          >
            <ShieldCheck size={44} className="text-white" />
          </div>
        </div>

        <h2 className="text-white font-black text-xl mt-6" style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
          On prépare ton espace...
        </h2>
        <p className="text-indigo-100 text-sm mt-2 max-w-xs">
          Scores et alternatives plus respectueuses de ta vie privée arrivent
        </p>
      </div>
    );
  }

  // ── RÉCAPITULATIF (combien d'apps par TrustiScore, note du téléphone) ──
  if (phase === 'summary') {
    return (
      <OnboardingSummary
        apps={matches.filter(app => selected.has(app.id))}
        onDetails={() => onComplete(selected)}
      />
    );
  }

  // ── RÉSULTATS ─────────────────────────────────────────────────────────
  const count = selected.size;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <style>{ANIM_CSS}</style>

      <div className="flex-1 max-w-md mx-auto w-full px-4 pb-40" style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
        <div className="pt-10 pb-6 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={30} className="text-white" />
          </div>
          {matches.length > 0 ? (
            <>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {matches.length} app{matches.length !== 1 ? 's' : ''} reconnue{matches.length !== 1 ? 's' : ''} sur ton téléphone
              </h2>
              <p className="text-xs text-slate-400 mt-1">Décoche celles que tu ne veux pas suivre</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                Aucune app connue détectée
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Ton catalogue local d'apps reconnues est peut-être limité. Tu peux choisir tes apps à la main.
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
                replacedBy={replacementMap.get(String(app.id))}
                isChosenAlternative={alternativeIds.has(String(app.id))}
              />
            ))}
          </div>
        )}

        {onManualSelection && (
          <button
            onClick={onManualSelection}
            className="mt-8 w-full flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ListChecks size={14} />
            {matches.length > 0 ? 'Ajouter d\'autres apps à la main' : 'Sélectionner mes apps à la main'}
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto space-y-2">
          <button
            onClick={handleFinish}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            {count > 0 ? `Ajouter mes ${count} app${count !== 1 ? 's' : ''}` : 'Continuer'}
            <ArrowRight size={16} />
          </button>
          {onSignUp && count > 0 && (
            <button
              onClick={() => {
                localStorage.setItem('trusti_pending_onboarding_apps', JSON.stringify([...selected]));
                onComplete(selected);
                onSignUp();
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Créer un compte pour retrouver mes apps partout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAppsNative;
