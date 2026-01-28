import React from 'react';
import { X, ShieldCheck, BookOpen } from 'lucide-react';
import { GRADE_INFO } from '../constants/grades';

/**
 * Panneau explicatif du TrustiScore
 */
const ExplainerPanel = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 text-white rounded-[2.5rem] relative shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-800 max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh] scrollbar-custom-dark p-7">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-1 z-10"
          >
            <X size={20}/>
          </button>
          
          <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <ShieldCheck size={20} />
            <h4 className="font-black text-xs uppercase tracking-widest">Le TrustiScore</h4>
          </div>
          <h3 className="text-xl font-black mb-3 text-white leading-tight">
            Comprendre votre santé numérique
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-400 font-medium">
            Le TrustiScore est un indice qui évalue la confiance que vous pouvez accorder à vos outils numériques. 
            Il mesure la protection de votre <span className="text-white font-bold text-[12px]">vie privée</span> et 
            le respect de la <span className="text-white font-bold text-[12px]">souveraineté</span> de vos données.
          </p>
        </div>

        <h4 className="font-black text-[10px] uppercase tracking-widest mb-5 text-slate-500 flex items-center gap-2">
          <div className="h-px bg-slate-800 flex-grow"></div>
          Échelle des notes
          <div className="h-px bg-slate-800 flex-grow"></div>
        </h4>
        
        <div className="space-y-5">
          {GRADE_INFO.map(({ grade, title, description, bgColor, shadowColor, textColor }) => (
            <div key={grade} className="flex gap-4 items-start">
              <div className={`${bgColor} w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-lg ${shadowColor} ${textColor || ''}`}>
                {grade}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wide">{title}</span>
                <p className="text-[11px] leading-tight text-slate-400 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://trusti-score.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:scale-105 group"
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen size={18} className="group-hover:rotate-6 transition-transform" />
            <span className="text-sm">Documentation complète</span>
          </div>
        </a>

        <div className="mt-8 pt-5 border-t border-slate-800 text-[10px] italic text-slate-500 text-center">
          Basé sur 12 critères (RGPD, Cloud Act, Open Source, Localisation).
        </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainerPanel;
