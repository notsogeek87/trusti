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

// Libellé du grade global déduit du téléphone (moyenne des apps installées)
export const PHONE_GRADE_LABEL = {
  A: 'Ton téléphone est plutôt souverain & privé',
  B: 'Ton téléphone est plutôt sécurisé',
  C: 'Ton téléphone a un usage hybride',
  D: 'Ton téléphone présente un risque élevé',
  E: 'Ton téléphone présente un risque critique',
};

// Version -15 ans du libellé ci-dessus : même info, mots simples + émoji.
export const PHONE_GRADE_LABEL_KID = {
  A: 'Bravo, ton téléphone garde bien tes secrets ! 🛡️',
  B: 'Ton téléphone est plutôt bien protégé 👍',
  C: 'Certaines de tes applis sont un peu bavardes 🗣️',
  D: 'Attention, plusieurs applis en savent trop sur toi 👀',
  E: 'Danger : ton téléphone a besoin d\'un grand ménage 🚨',
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

// Version -15 ans de GRADE_INFO : mêmes couleurs et la même échelle A à E,
// mais des explications en mots simples et des images concrètes plutôt que
// du vocabulaire juridique (RGPD, Cloud Act, profilage...).
export const GRADE_INFO_KID = [
  {
    grade: 'A',
    title: 'Un journal secret bien fermé 🔒',
    description: 'Elle garde tes infos pour elle, ne les vend à personne et est fabriquée près de chez toi.',
    bgColor: 'bg-[#006837]',
    shadowColor: 'shadow-emerald-900/20'
  },
  {
    grade: 'B',
    title: 'Protégée, mais loin de chez toi 🌍',
    description: 'Tes données sont bien verrouillées, mais elles voyagent jusqu\'aux États-Unis où d\'autres lois s\'appliquent.',
    bgColor: 'bg-[#8dc63f]',
    shadowColor: 'shadow-lime-900/20'
  },
  {
    grade: 'C',
    title: 'Un peu bavarde 🗣️',
    description: 'Elle est utile, mais elle regarde ce que tu fais pour te proposer des publicités.',
    bgColor: 'bg-[#fbb03b]',
    shadowColor: 'shadow-amber-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'D',
    title: 'Un peu trop curieuse 👀',
    description: 'Elle collecte beaucoup d\'informations sur toi pour deviner tes habitudes et te suivre partout.',
    bgColor: 'bg-[#f7931e]',
    shadowColor: 'shadow-orange-900/20',
    textColor: 'text-slate-900'
  },
  {
    grade: 'E',
    title: 'Attention, danger ! 🚨',
    description: 'Personne ne sait vraiment ce qu\'elle fait de tes données, ou elle a de grosses failles de sécurité.',
    bgColor: 'bg-[#c1272d]',
    shadowColor: 'shadow-rose-900/20'
  }
];
