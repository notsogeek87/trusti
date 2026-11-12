import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, Building2, ClipboardCheck, Rocket, Trash2 } from 'lucide-react';
import { STANDALONE_URLS } from '../../utils/standalonePage';
import { loadOrganisationState, clearOrganisationState } from '../../utils/organisationStorage';

/**
 * Rubrique « Organisations » (adresse « ?organisations ») : propose les deux parcours.
 * - Évaluer mon organisation → page historique « ?organisation », inchangée.
 * - Créer mon organisation  → page « ?creer-organisation ».
 * Une évaluation déjà enregistrée dans ce navigateur est proposée en premier
 * (elle s'ouvre sur sa synthèse).
 */
const PATHS = [
  {
    id: 'evaluate',
    Icon: ClipboardCheck,
    title: 'Évaluer mon organisation',
    description: 'Vous disposez déjà d\'un environnement numérique ? Évaluez vos logiciels, mesurez leur niveau de confiance et identifiez les pistes d\'amélioration.',
    cta: 'Évaluer mon organisation',
    href: STANDALONE_URLS.EVALUATE_ORGANISATION,
    accent: {
      icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'hover:border-emerald-200',
    },
  },
  {
    id: 'create',
    Icon: Rocket,
    title: 'Créer mon organisation',
    description: 'Vous lancez une nouvelle association, entreprise ou structure ? Construisez dès le départ un environnement numérique responsable, souverain et fiable avec Trusti.',
    cta: 'Créer mon organisation',
    href: STANDALONE_URLS.CREATE_ORGANISATION,
    accent: {
      icon: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      ring: 'hover:border-indigo-200',
    },
  },
];

const OrganisationsPage = () => {
  const [saved, setSaved] = useState(loadOrganisationState);
  const savedCount = saved?.ids.length || 0;
  const savedName = saved?.orgName.trim() || '';

  const deleteSaved = () => {
    const question = savedName
      ? `Supprimer l'organisation « ${savedName} » et son évaluation ? Cette action est définitive.`
      : 'Supprimer cette organisation et son évaluation ? Cette action est définitive.';
    if (!window.confirm(question)) return;
    clearOrganisationState();
    setSaved(null);
  };

  useEffect(() => {
    document.title = 'Organisations · Trusti';
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600">
            <ArrowLeft size={16} /> Trusti
          </a>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-2 font-black text-indigo-600 truncate">
            <Building2 size={18} className="shrink-0" /> Organisations
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 pb-16 sm:pt-12">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight">
            Votre organisation, un numérique de confiance
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto sm:text-lg">
            Trusti vous accompagne pour évaluer votre environnement numérique actuel ou construire celui de demain.
          </p>
        </div>

        {savedCount > 0 && (
          <div className="mb-4 sm:mb-6 flex items-stretch bg-white/90 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all">
            <a
              href={STANDALONE_URLS.EVALUATE_ORGANISATION}
              className="flex-1 min-w-0 flex items-center gap-4 p-5 sm:p-6 group"
            >
              <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <BarChart3 size={24} aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-black text-slate-800 break-words">{savedName || 'Votre organisation'}</span>
                <span className="block text-sm text-slate-500">
                  Évaluation enregistrée : {savedCount} outil{savedCount > 1 ? 's' : ''}. Voir la synthèse, la note et les exports.
                </span>
              </span>
              <ArrowRight size={20} className="text-emerald-600 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={deleteSaved}
              aria-label={`Supprimer l'organisation ${savedName || 'enregistrée'}`}
              title="Supprimer l'organisation"
              className="shrink-0 px-4 sm:px-5 border-l border-emerald-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-r-3xl transition-colors"
            >
              <Trash2 size={20} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {PATHS.map(({ id, Icon, title, description, cta, href, accent }) => (
            <section
              key={id}
              aria-labelledby={`path-${id}`}
              className={`flex flex-col bg-white/80 rounded-3xl border border-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all ${accent.ring}`}
            >
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${accent.icon}`}>
                <Icon size={28} aria-hidden="true" />
              </div>
              <h2 id={`path-${id}`} className="text-xl font-black text-slate-800">{title}</h2>
              <p className="mt-2 text-slate-600 flex-1">{description}</p>
              <a
                href={href}
                className={`mt-6 w-full text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group ${accent.button}`}
              >
                {cta}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OrganisationsPage;
