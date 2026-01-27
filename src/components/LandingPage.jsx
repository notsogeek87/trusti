import React from 'react';
import { ShieldCheck, ArrowRight, Lock, Globe, Eye, CheckCircle } from 'lucide-react';
import { GRADE_INFO } from '../constants/grades';

/**
 * Landing Page affichée uniquement lors de la première visite
 */
const LandingPage = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-8 animate-in zoom-in duration-500">
            <img 
              src="/assets/logo.png" 
              alt="TrustiScore Logo" 
              className="w-40 mx-auto mb-6"
            />
          </div>

          <div className="max-w-md animate-in slide-in-from-bottom duration-700 delay-200">
            <div className="flex items-center justify-center gap-2 mb-4 text-indigo-400">
              <ShieldCheck size={24} />
              <h1 className="font-black text-sm uppercase tracking-widest">TrustiScore</h1>
            </div>
            
            <h2 className="text-3xl font-black mb-4 text-white leading-tight">
              Reprenez le contrôle de votre vie privée numérique
            </h2>
            
            <p className="text-base leading-relaxed text-slate-400 font-medium mb-8">
              TrustiScore évalue la confiance que vous pouvez accorder à vos applications. 
              Découvrez quelles apps respectent vraiment votre <span className="text-white font-bold">vie privée</span> et 
              votre <span className="text-white font-bold">souveraineté numérique</span>.
            </p>

            {/* Fonctionnalités clés */}
            <div className="grid gap-4 mb-10 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 rounded-lg p-2 shrink-0">
                  <Eye size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Évaluations transparentes</h3>
                  <p className="text-slate-400 text-xs">Scores basés sur 12 critères objectifs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-lg p-2 shrink-0">
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Vie privée protégée</h3>
                  <p className="text-slate-400 text-xs">RGPD, Open Source, Localisation des données</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-lg p-2 shrink-0">
                  <Globe size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Alternatives respectueuses</h3>
                  <p className="text-slate-400 text-xs">Découvrez des apps qui vous respectent</p>
                </div>
              </div>
            </div>

            {/* Échelle des notes */}
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
              <h3 className="font-black text-xs uppercase tracking-widest mb-4 text-slate-400 text-center">
                Échelle des notes
              </h3>
              
              <div className="space-y-3">
                {GRADE_INFO.map(({ grade, title, description, bgColor, shadowColor, textColor }) => (
                  <div key={grade} className="flex gap-3 items-start">
                    <div className={`${bgColor} w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-sm shadow-md ${shadowColor} ${textColor || ''}`}>
                      {grade}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white">{title}</span>
                      <p className="text-[10px] leading-tight text-slate-400 mt-0.5">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Commencer l'exploration
              <ArrowRight size={20} />
            </button>

            <p className="text-[10px] text-slate-500 mt-6 italic">
              Basé sur 12 critères : RGPD, Cloud Act, Open Source, Localisation des données, et plus encore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
