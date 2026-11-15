import { t } from '../i18n/index.js';
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
// i18n-ignore-start : noms de catégories = clés en base
export const COLLECTIVITE_CATEGORIES = [
  'Collectivités / Gestion municipale',
  'Collectivités / Dématérialisation',
  'Collectivités / Démarches en ligne',
  'Collectivités / Information des habitants',
];
// i18n-ignore-end
export const PRO_FAMILIES = [
  { id: 'messagerie', label: t('org.families.messagerie.label'), categories: ['Messagerie', 'Email'] }, // i18n-ignore
  { id: 'visio', label: t('org.families.visio.label'), categories: ['Visioconférence'] }, // i18n-ignore
  {
    id: 'bureautique',
    label: t('org.families.bureautique.label'),
    categories: ['Bureautique', 'Productivité / Tableur', 'Productivité / Documents', 'Productivité / Tout-en-un', 'Wiki & Documentation', 'Gestion documentaire (GED)'], // i18n-ignore
  },
  { id: 'stockage', label: t('org.families.stockage.label'), categories: ['Stockage Cloud', 'Productivité / Collaboration', 'Outils / Envoi de fichiers'] }, // i18n-ignore
  { id: 'organisation', label: t('org.families.organisation.label'), categories: ['Productivité / Notes', 'Prise de Notes', 'Productivité / Tâches', 'Productivité / Calendrier'] }, // i18n-ignore
  { id: 'projet', label: t('org.families.projet.label'), categories: ['Gestion de projet'] }, // i18n-ignore
  { id: 'ia', label: t('org.families.ia.label'), categories: ['IA'] }, // i18n-ignore
  {
    id: 'client',
    label: t('org.families.client.label'),
    categories: ['CRM & Support', 'Marketing / E-mailing', 'Sites web & E-commerce', 'Sites web & E-commerce / Mesure d\'audience', 'Réseaux sociaux'], // i18n-ignore
  },
  {
    id: 'finance',
    label: t('org.families.finance.label'),
    categories: ['Comptabilité & Gestion', 'Banque & Finance', 'Finance / Entreprise', 'Paiement Mobile'], // i18n-ignore
  },
  {
    id: 'rh',
    label: t('org.families.rh.label'),
    categories: ['RH & Paie', "Services / Comité d'entreprise", 'Santé & Sport', 'Éducation'], // i18n-ignore
  },
  { id: 'signature', label: t('org.families.signature.label'), categories: ['Signature électronique'] }, // i18n-ignore
  {
    id: 'securite',
    label: t('org.families.securite.label'),
    categories: ['Gestionnaires de Mots de Passe', 'Sécurité / 2FA', 'Sécurité & Administration IT', 'VPN', 'Chiffrement & Sécurité'], // i18n-ignore
  },
  {
    id: 'technique',
    label: t('org.families.technique.label'),
    categories: ['Outils / Développement', 'Sauvegarde & Supervision', 'Outils / Surveillance', 'Outils / Professionnel'], // i18n-ignore
  },
  {
    id: 'systemes',
    label: t('org.families.systemes.label'),
    categories: ["Système d'exploitation / PC", "Système d'exploitation / Smartphone"], // i18n-ignore
  },
  { id: 'navigation', label: t('org.families.navigation.label'), categories: ['Navigateurs Web', 'Moteurs de Recherche'] }, // i18n-ignore
  { id: 'design', label: t('org.families.design.label'), categories: ['Design & Prototypage', 'Retouche Photo'] }, // i18n-ignore
  {
    id: 'collectivite',
    label: t('org.families.collectivite.label'),
    categories: COLLECTIVITE_CATEGORIES,
  },
  {
    id: 'metiers',
    label: t('org.families.metiers.label'),
    categories: ['Juridique & Notariat', 'Immobilier', 'Hôtellerie, Tourisme & Bien-être'], // i18n-ignore
  },
];

export const OTHER_FAMILY = { id: 'autres', label: t('org.families.autres.label'), categories: [] }; // i18n-ignore

/** Niveaux de criticité et poids dans la note pondérée. */
export const CRITICALITY_LEVELS = [
  { id: 'vitale', label: t('org.families.vitale.label'), weight: 3 },
  { id: 'importante', label: t('org.families.importante.label'), weight: 2 },
  { id: 'secondaire', label: t('org.families.secondaire.label'), weight: 1 },
];

export const DEFAULT_CRITICALITY = 'importante';
