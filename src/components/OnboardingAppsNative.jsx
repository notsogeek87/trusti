import React, { useState, useEffect } from 'react';
import { ScanSearch, ShieldCheck, ArrowRight, ListChecks } from 'lucide-react';
import InstalledApps from '../native/InstalledApps';
import { AppTile, ANIM_CSS } from './OnboardingApps';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

// Onboarding Android natif : scanne les apps installées sur l'appareil au lieu
// de demander une sélection manuelle. Ne s'affiche que dans l'app Android
// packagée (voir src/utils/platform.js) — le web garde OnboardingApps.jsx.
const OnboardingAppsNative = ({ onComplete, onSignUp, onManualSelection }) => {
  // 'intro' | 'scanning' | 'results' | 'error'
  const [phase, setPhase] = useState('intro');
  const [matches, setMatches] = useState([]); // apps du catalogue trouvées installées
  const [selected, setSelected] = useState(new Set());

  const toggleApp = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const runScan = async () => {
    setPhase('scanning');
    try {
      const [catalogRes, installedRes] = await Promise.all([
        fetch(`${API_URL}/apps?onboarding=true`).then(r => r.json()),
        InstalledApps.getInstalledPackages(),
      ]);

      if (!catalogRes.success) throw new Error('catalog fetch failed');

      const installedPackages = new Set(installedRes.packages || []);
      const found = catalogRes.apps.filter(app => {
        const pkg = extractPackageId(app.playStoreUrl);
        return pkg && installedPackages.has(pkg);
      });

      setMatches(found);
      setSelected(new Set(found.map(a => a.id)));
      setPhase('results');
    } catch (err) {
      console.error('Scan des apps installées échoué:', err);
      setPhase('error');
    }
  };

  useEffect(() => {
    if (phase === 'intro') runScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── INTRO / SCAN EN COURS ────────────────────────────────────────────
  if (phase === 'intro' || phase === 'scanning') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
        <style>{ANIM_CSS}</style>
        <div style={{ animation: 'onbFadeUp 0.4s ease-out' }}>
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <ScanSearch size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">On scanne ton téléphone</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
            Trusti repère automatiquement les apps installées qu'on connaît, pour t'éviter
            de tout sélectionner à la main.
          </p>
          <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mx-auto" />
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
              <AppTile key={app.id} app={app} selected={selected.has(app.id)} onToggle={toggleApp} />
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
            onClick={() => onComplete(selected)}
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
