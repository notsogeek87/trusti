import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Étapes guidées par catégorie
const STEPS = [
  {
    id: 'messagerie',
    emoji: '💬',
    question: 'Pour communiquer avec tes proches ?',
    categories: ['Messagerie', 'Email', 'Visioconférence', 'Communication'],
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
const SUCCESS_STEP = STEPS.length;

const GRADE_DOT = {
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

const ANIM_CSS = `
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

const AppTile = ({ app, selected, onToggle }) => (
  <button
    onClick={() => onToggle(app.id)}
    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-150 active:scale-95 border-2
      ${selected
        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200'
        : 'bg-white border-transparent shadow-sm hover:border-indigo-200 hover:shadow-md'
      }`}
  >
    {selected && (
      <div className="absolute top-1.5 right-1.5 bg-white rounded-full w-5 h-5 flex items-center justify-center">
        <Check size={12} className="text-indigo-600" strokeWidth={3} />
      </div>
    )}
    {app.icon && app.icon.startsWith('http') ? (
      <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" />
    ) : (
      <div className={`w-12 h-12 rounded-xl ${app.color || 'bg-slate-400'} flex items-center justify-center text-2xl`}>
        {app.icon || app.name.charAt(0)}
      </div>
    )}
    <span className={`text-[11px] font-bold leading-tight text-center line-clamp-2 w-full ${selected ? 'text-white' : 'text-slate-800'}`}>
      {app.name}
    </span>
    <span className={`w-2 h-2 rounded-full ${GRADE_DOT[app.grade] || 'bg-slate-300'}`} title={`TrustiScore ${app.grade}`} />
  </button>
);

const OnboardingApps = ({ onComplete }) => {
  const [step, setStep] = useState(-1); // -1 = intro
  const [direction, setDirection] = useState('forward');
  const [selected, setSelected] = useState(new Set());
  const [stepApps, setStepApps] = useState([]);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const cache = useRef({});
  const stepRef = useRef(step); // ref pour lire le step courant dans les callbacks async
  useEffect(() => { stepRef.current = step; }, [step]);

  const toggleApp = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goNext = () => { setDirection('forward'); setStep(s => s + 1); };
  const goBack = () => { setDirection('back'); setStep(s => s - 1); };

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
          <button
            onClick={goNext}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transition-all active:scale-95 mx-auto"
          >
            C'est parti <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onComplete(new Set())}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
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

          {/* CTA */}
          <button
            onClick={() => onComplete(selected)}
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <style>{ANIM_CSS}</style>

      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={goBack}
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

        {/* Grille d'apps */}
        {isLoadingStep ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          </div>
        ) : stepApps.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {stepApps.map(app => (
              <AppTile key={app.id} app={app} selected={selected.has(app.id)} onToggle={toggleApp} />
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
            onClick={() => { setDirection('forward'); setStep(SUCCESS_STEP); }}
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
