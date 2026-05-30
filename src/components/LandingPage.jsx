import React from 'react';
import { ShieldCheck, ArrowRight, Lock, Globe, Eye, CheckCircle, BookOpen, X } from 'lucide-react';
import { GRADE_INFO } from '../constants/grades';

/**
 * Landing Page affichée uniquement lors de la première visite
 */
const LandingPage = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
        aria-label="Fermer"
      >
        <X size={24} />
      </button>
      
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          {/* Vidéo d'explication */}
          <div className="mb-8 max-w-2xl w-full animate-in zoom-in duration-500">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm">
              <video 
                className="w-full h-auto"
                controls
                preload="metadata"
                poster="/assets/logo.png"
              >
                <source src="/assets/intro.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>

          <div className="max-w-md animate-in slide-in-from-bottom duration-700 delay-300">
            <div className="flex items-center justify-center gap-2 mb-4 text-indigo-400">
              <ShieldCheck size={24} />
              <h1 className="font-black text-sm uppercase tracking-widest">TrustiScore</h1>
            </div>
            
            <h2 className="text-3xl font-black mb-4 text-white leading-tight">
              Reprenez votre souveraineté numérique européenne
            </h2>
            
            <p className="text-base leading-relaxed text-slate-400 font-medium mb-8">
              TrustiScore évalue la confiance que vous pouvez accorder à vos applications. 
              Découvrez quelles apps respectent vraiment votre <span className="text-white font-bold">souveraineté numérique</span> et 
              protègent votre <span className="text-white font-bold">vie privée</span>.
            </p>

            {/* Fonctionnalités clés */}
            <div className="grid gap-4 mb-10 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-lg p-2 shrink-0">
                  <Globe size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Souveraineté européenne</h3>
                  <p className="text-slate-400 text-xs">Données hébergées en Europe, conformité RGPD</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-lg p-2 shrink-0">
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Vie privée protégée</h3>
                  <p className="text-slate-400 text-xs">Protection contre le Cloud Act et surveillance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 rounded-lg p-2 shrink-0">
                  <Eye size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Évaluations transparentes</h3>
                  <p className="text-slate-400 text-xs">Scores basés sur 12 critères objectifs</p>
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
                      <p className="text-[11px] leading-tight text-slate-400 mt-0.5">{description}</p>
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

            <a
              href="https://trusti-score.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 bg-slate-800 hover:bg-slate-700 border-2 border-indigo-500/30 hover:border-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <BookOpen size={20} className="text-indigo-400 group-hover:text-indigo-300" />
              En savoir plus sur le TrustiScore
              <ArrowRight size={18} className="text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-[11px] text-slate-500 mt-6 italic">
              Basé sur 12 critères : RGPD, Cloud Act, Open Source, Localisation des données, et plus encore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
