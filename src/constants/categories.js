/**
 * Liste des catégories d'applications
 * Catégories principales simplifiées pour le mobile
 * Ordonnées par pertinence/popularité
 */
export const CATEGORIES = [
  'Communication',
  'Réseaux sociaux',
  'IA',
  'Multimédia',
  'Productivité',
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

/**
 * Mapping des catégories détaillées vers les catégories principales
 * Permet de regrouper automatiquement les apps
 */
export const CATEGORY_MAPPING = {
  // Communication
  'Email': 'Communication',
  'Messagerie': 'Communication',
  'Visioconférence': 'Communication',
  'Communication': 'Communication',
  
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
  'Stockage Cloud': 'Productivité',
  'Productivité': 'Productivité',
  'Bureautique': 'Productivité',
  'Prise de Notes': 'Productivité',
  
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
