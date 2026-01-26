import React from 'react';
import { ChevronLeft, CheckCircle, PlusCircle, ShieldCheck } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';

/**
 * Modal des détails d'une application
 */
const AppDetailModal = ({ app, isInMyApps, onToggleMyApp, onClose }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      <header className="px-4 py-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-50">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 text-slate-400"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
          Détails
        </div>
        <button 
          onClick={(e) => onToggleMyApp(e, app.id)} 
          className={`p-2 rounded-full ${
            isInMyApps 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-slate-200'
          }`}
        >
          {isInMyApps ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
        </button>
      </header>

      <main className="max-w-md mx-auto p-6">
        <div className="flex flex-col items-center mb-10">
          <div className={`${app.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl mb-6`}>
            {app.icon}
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-1">{app.name}</h2>
          <ScoreIndicator grade={app.grade} size="large" />
        </div>
        
        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 mb-6">
          <h3 className="font-black text-sm uppercase tracking-tight text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" /> Analyse
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{app.reason}</p>
        </div>
        
        <button 
          onClick={onClose} 
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
        >
          Retour
        </button>
      </main>
    </div>
  );
};

export default AppDetailModal;
