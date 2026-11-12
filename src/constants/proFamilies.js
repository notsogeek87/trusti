/**
 * Familles de besoins de l'évaluation « organisation » (page ?organisation).
 *
 * Regroupe les catégories du catalogue (colonne `category`) par besoin
 * métier. Une catégorie absente de cette liste tombe dans « Autres outils ».
 * Ne sert qu'à la nouvelle page : le catalogue grand public n'en dépend pas.
 */

/**
 * Catégories des logiciels propres aux collectivités (état civil, élections,
 * finances, délibérations, information des habitants…). Format « Famille / Détail ».
 */
export const COLLECTIVITE_CATEGORIES = [
  'Collectivités / Gestion municipale',
  'Collectivités / Dématérialisation',
  'Collectivités / Démarches en ligne',
  'Collectivités / Information des habitants',
];
export const PRO_FAMILIES = [
  { id: 'messagerie', label: 'Messagerie et e-mail', categories: ['Messagerie', 'Email'] },
  { id: 'visio', label: 'Visioconférence', categories: ['Visioconférence'] },
  {
    id: 'bureautique',
    label: 'Bureautique et documents',
    categories: ['Bureautique', 'Productivité / Tableur', 'Productivité / Documents', 'Productivité / Tout-en-un', 'Wiki & Documentation', 'Gestion documentaire (GED)'],
  },
  { id: 'stockage', label: 'Stockage et partage de fichiers', categories: ['Stockage Cloud', 'Productivité / Collaboration', 'Outils / Envoi de fichiers'] },
  { id: 'organisation', label: 'Notes, tâches et agenda', categories: ['Productivité / Notes', 'Prise de Notes', 'Productivité / Tâches', 'Productivité / Calendrier'] },
  { id: 'projet', label: 'Gestion de projet', categories: ['Gestion de projet'] },
  { id: 'ia', label: 'Intelligence artificielle', categories: ['IA'] },
  {
    id: 'client',
    label: 'Relation client, marketing et web',
    categories: ['CRM & Support', 'Marketing / E-mailing', 'Sites web & E-commerce', 'Sites web & E-commerce / Mesure d\'audience', 'Réseaux sociaux'],
  },
  {
    id: 'finance',
    label: 'Comptabilité, gestion et finance',
    categories: ['Comptabilité & Gestion', 'Banque & Finance', 'Finance / Entreprise', 'Paiement Mobile'],
  },
  {
    id: 'rh',
    label: 'RH, paie et formation',
    categories: ['RH & Paie', "Services / Comité d'entreprise", 'Santé & Sport', 'Éducation'],
  },
  { id: 'signature', label: 'Signature électronique', categories: ['Signature électronique'] },
  {
    id: 'securite',
    label: 'Sécurité, identité et accès distant',
    categories: ['Gestionnaires de Mots de Passe', 'Sécurité / 2FA', 'Sécurité & Administration IT', 'VPN', 'Chiffrement & Sécurité'],
  },
  {
    id: 'technique',
    label: 'Développement, sauvegarde et supervision',
    categories: ['Outils / Développement', 'Sauvegarde & Supervision', 'Outils / Surveillance', 'Outils / Professionnel'],
  },
  {
    id: 'systemes',
    label: "Systèmes d'exploitation",
    categories: ["Système d'exploitation / PC", "Système d'exploitation / Smartphone"],
  },
  { id: 'navigation', label: 'Navigateurs et moteurs de recherche', categories: ['Navigateurs Web', 'Moteurs de Recherche'] },
  { id: 'design', label: 'Design et création', categories: ['Design & Prototypage', 'Retouche Photo'] },
  {
    id: 'collectivite',
    label: 'Logiciels des mairies et collectivités',
    categories: COLLECTIVITE_CATEGORIES,
  },
  {
    id: 'metiers',
    label: 'Logiciels métiers',
    categories: ['Juridique & Notariat', 'Immobilier', 'Hôtellerie, Tourisme & Bien-être'],
  },
];

export const OTHER_FAMILY = { id: 'autres', label: 'Autres outils', categories: [] };

/** Niveaux de criticité et poids dans la note pondérée. */
export const CRITICALITY_LEVELS = [
  { id: 'vitale', label: 'Vitale', weight: 3 },
  { id: 'importante', label: 'Importante', weight: 2 },
  { id: 'secondaire', label: 'Secondaire', weight: 1 },
];

export const DEFAULT_CRITICALITY = 'importante';
