import React, { useEffect } from 'react';
import { ArrowLeft, Building2, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { STANDALONE_URLS } from '../../utils/standalonePage';

/**
 * Parcours « Créer mon organisation » (adresse « ?creer-organisation ») :
 * page temporaire, la fonctionnalité est en préparation. Volontairement
 * sans formulaire ni collecte de données.
 */
const CreateOrganisationPage = () => {
  useEffect(() => {
    document.title = 'Créer mon organisation · Trusti';
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3 min-w-0">
          <a href="/" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 shrink-0">
            <ArrowLeft size={16} /> Trusti
          </a>
          <span className="text-slate-300">/</span>
          <a href={STANDALONE_URLS.ORGANISATIONS} className="text-sm font-bold text-slate-500 hover:text-indigo-600 shrink-0">
            Organisations
          </a>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-2 font-black text-indigo-600 truncate">
            <Rocket size={18} className="shrink-0" /> <span className="truncate">Créer mon organisation</span>
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10 pb-16 sm:pt-16">
        <div className="bg-white/80 rounded-3xl border border-white shadow-sm px-6 py-10 sm:px-12 sm:py-14 text-center">
          {/* Illustration : bâtiment protégé, aux couleurs de Trusti */}
          <div className="relative w-28 h-28 mx-auto mb-8" aria-hidden="true">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl rotate-6" />
            <div className="absolute inset-0 rounded-[2rem] bg-white border border-indigo-100 flex items-center justify-center">
              <Building2 size={48} className="text-indigo-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-md">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-wide">
            <Sparkles size={14} aria-hidden="true" /> Fonctionnalité en préparation
          </span>

          <h1 className="mt-5 text-2xl sm:text-4xl font-black text-slate-800 leading-tight">
            Votre organisation mérite un numérique de confiance.
          </h1>

          <div className="mt-5 space-y-3 text-slate-600 sm:text-lg max-w-2xl mx-auto">
            <p>
              Nous préparons un nouvel assistant pour vous aider à concevoir votre environnement numérique dès la création de votre organisation.
            </p>
            <p>
              Sélection des logiciels, souveraineté numérique, protection des données et Trusti Score : tout sera pensé pour vous aider à faire les bons choix dès le départ.
            </p>
          </div>

          <a
            href={STANDALONE_URLS.ORGANISATIONS}
            className="mt-10 inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Retour aux organisations
          </a>
        </div>
      </main>
    </div>
  );
};

export default CreateOrganisationPage;
