/**
 * Liste des catégories d'applications
 * Catégories principales simplifiées pour le mobile
 * Ordonnées par pertinence/popularité
 */
export const CATEGORIES = [
  'Messagerie',
  'Réseaux sociaux',
  'IA',
  'Multimédia',
  'Productivité/Organisation',
  'Sécurité & VPN',
  'Shopping',
  'Finance',
  'Transport & Voyage',
  'Santé & Sport',
  'Navigation',
  'Jeux',
  'Éducation',
  'Utilitaires',
  'Tech & Dev',
  'Créativité',
  'News & Info',
  'Divers'
];

// Catégories complètes (CATEGORIES + sous-catégories détaillées) pour l'interface admin
export const ADMIN_CATEGORIES = [
  ...new Set([
    ...CATEGORIES,
    'Email',
    'Visioconférence',
    'Communication',
    'Rencontres',
    'Navigateurs Web',
    'Moteurs de Recherche',
    'VPN',
    'Gestionnaires de Mots de Passe',
    'Chiffrement & Sécurité',
    'Stockage Cloud',
    'Productivité',
    'Bureautique',
    'Prise de Notes',
    'Streaming Musical',
    'Streaming Vidéo',
    'Podcasts',
    'Lecteurs Multimédia',
    'Photo & Vidéo',
    'Banque & Finance',
    'Paiement Mobile',
    'Transport & Mobilité',
    'Voyages & Hébergement',
    'E-commerce',
    'Petites Annonces',
    'Anti-gaspillage',
    'Livraison de Repas',
    'Santé & Médical',
    'Méditation & Bien-être',
    'Sport & Fitness',
    'Navigation GPS',
    'Cartographie',
    'Développement',
    'Design',
    'Agrégateurs RSS',
  ]).values(),
].sort((a, b) => a.localeCompare(b, 'fr'));

/**
 * Mapping des catégories détaillées vers les catégories principales
 * Permet de regrouper automatiquement les apps
 */
export const CATEGORY_MAPPING = {
  // Messagerie
  'Email': 'Messagerie',
  'Messagerie': 'Messagerie',
  'Visioconférence': 'Messagerie',
  'Communication': 'Messagerie',
  
  // Réseaux sociaux
  'Réseaux sociaux': 'Réseaux sociaux',
  'Rencontres': 'Réseaux sociaux',
  'Navigateurs Web': 'Réseaux sociaux',
  'Moteurs de Recherche': 'Réseaux sociaux',
  
  // Sécurité
  'VPN': 'Sécurité & VPN',
  'Gestionnaires de Mots de Passe': 'Sécurité & VPN',
  'Chiffrement & Sécurité': 'Sécurité & VPN',
  'Sécurité & VPN': 'Sécurité & VPN',
  
  // Productivité
  'Stockage Cloud': 'Productivité/Organisation',
  'Productivité': 'Productivité/Organisation',
  'Bureautique': 'Productivité/Organisation',
  'Prise de Notes': 'Productivité/Organisation',
  
  // Multimédia
  'Streaming Musical': 'Multimédia',
  'Streaming Vidéo': 'Multimédia',
  'Podcasts': 'Multimédia',
  'Lecteurs Multimédia': 'Multimédia',
  'Photo & Vidéo': 'Multimédia',
  'Multimédia': 'Multimédia',
  
  // Finance
  'Banque & Finance': 'Finance',
  'Paiement Mobile': 'Finance',
  'Finance': 'Finance',
  
  // Transport & Voyage
  'Transport & Mobilité': 'Transport & Voyage',
  'Voyages & Hébergement': 'Transport & Voyage',
  
  // Shopping
  'E-commerce': 'Shopping',
  'Petites Annonces': 'Shopping',
  'Anti-gaspillage': 'Shopping',
  'Livraison de Repas': 'Shopping',
  'Shopping': 'Shopping',
  
  // Santé
  'Santé & Médical': 'Santé & Sport',
  'Méditation & Bien-être': 'Santé & Sport',
  'Sport & Fitness': 'Santé & Sport',
  
  // Navigation
  'Navigation GPS': 'Navigation',
  'Cartographie': 'Navigation',
  'Navigation': 'Navigation',
  
  // IA
  'IA': 'IA',
  
  // Jeux
  'Jeux': 'Jeux',
  
  // Éducation
  'Éducation': 'Éducation',
  
  // Utilitaires
  'Utilitaires': 'Utilitaires',
  
  // Tech & Dev
  'Développement': 'Tech & Dev',
  'Tech & Dev': 'Tech & Dev',
  
  // Créativité
  'Design': 'Créativité',
  
  // News & Info
  'Agrégateurs RSS': 'News & Info',
  
  // Divers (catégories génériques non classées - normalement vide maintenant)
  'Navigateur': 'Réseaux sociaux'
};
