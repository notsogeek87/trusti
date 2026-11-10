import React from 'react';

/** Écran de chargement initial (logo, nom, points animés). */
const SplashScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-purple-50">
    <div style={{ animation: 'splashFadeIn 0.5s ease-out both' }}>
      <img src="/assets/logo.png" alt="Trusti" className="w-28 h-28 mb-3 drop-shadow-lg" />
    </div>

    <p className="text-2xl font-black text-slate-800 tracking-tight mb-1" style={{ animation: 'splashFadeIn 0.5s 0.1s ease-out both', opacity: 0 }}>
      Trusti
    </p>
    <p className="text-sm text-slate-400 font-medium mb-10" style={{ animation: 'splashFadeIn 0.5s 0.2s ease-out both', opacity: 0 }}>
      Votre guide pour maîtriser vos apps et vos données
    </p>

    <div className="flex items-center gap-2" style={{ animation: 'splashFadeIn 0.5s 0.35s ease-out both', opacity: 0 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: `splashBounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </div>

    <style>{`
      @keyframes splashFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes splashBounce {
        0%, 80%, 100% { transform: translateY(0);    opacity: 0.35; }
        40%            { transform: translateY(-8px); opacity: 1; }
      }
    `}</style>
  </div>
);

export default SplashScreen;
