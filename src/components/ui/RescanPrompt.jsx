import React from 'react';
import { CheckCircle2, ScanSearch, X } from 'lucide-react';

// Proposé juste après une désinstallation : un vrai call-to-action plutôt
// qu'un toast discret, pour que « Mes Apps » reste à jour.
const RescanPrompt = ({ onScan, onDismiss }) => (
  <div
    className="fixed inset-x-0 bottom-0 z-[210] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
    style={{ animation: 'rescanPromptIn 0.28s ease-out' }}
  >
    <div className="pointer-events-auto mx-auto max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 size={22} />
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-black text-slate-900 text-base leading-tight">App désinstallée</p>
          <p className="text-sm text-slate-500 mt-0.5">Mettez à jour Mes Apps pour refléter votre téléphone.</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Fermer"
          className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      <button
        onClick={onScan}
        className="mt-4 w-full min-h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-base shadow-lg shadow-indigo-200 transition-all"
      >
        <ScanSearch size={20} />
        Relancer un scan
      </button>
    </div>
    <style>{`
      @keyframes rescanPromptIn {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

export default RescanPrompt;
