/**
 * Configuration des notes et leurs couleurs
 */
export const GRADES = ['A', 'B', 'C', 'D', 'E'];

export const GRADE_COLORS = {
  A: 'bg-[#006837]',
  B: 'bg-[#8dc63f]',
  C: 'bg-[#fbb03b]',
  D: 'bg-[#f7931e]',
  E: 'bg-[#c1272d]'
};

export const GRADE_INFO = [
  {
    grade: 'A',
    title: 'Souverain & Privé',
    description: 'Hébergé en Europe, open-source, aucun profilage commercial.',
    bgColor: 'bg-[#006837]',
    shadowColor: 'shadow-emerald-900/20'
  },
  {
    grade: 'B',
    title: 'Sécurisé',
    description: 'Excellent chiffrement, mais juridiction soumise au Cloud Act US.',
    bgColor: 'bg-[#8dc63f]',
    shadowColor: 'shadow-lime-900/20'
  },
  {
    grade: 'C',
    title: 'Usage Hybride',
    description: 'Service utile mais collecte de métadonnées pour la publicité.',
    bgColor: 'bg-[#fbb03b]',
    shadowColor: 'shadow-amber-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'D',
    title: 'Risque élevé',
    description: 'Collecte massive et profilage comportemental actif.',
    bgColor: 'bg-[#f7931e]',
    shadowColor: 'shadow-orange-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'E',
    title: 'Critique',
    description: 'Opacité totale, transfert hors RGPD ou failles majeures.',
    bgColor: 'bg-[#c1272d]',
    shadowColor: 'shadow-rose-900/20'
  }
];
