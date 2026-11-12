/**
 * Liste des catégories d'applications
 * Catégories principales simplifiées pour le mobile
 * Ordonnées par pertinence/popularité
 */
// Pseudo-catégorie du catalogue : ne filtre pas par catégorie réelle mais
// par apps marquées en favori ("+" dans le catalogue), pour les retrouver
// avant de décider de les ajouter à "Mes Apps".
export const FAVORITES_FILTER = 'À tester';

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
  'Systèmes d\'exploitation',
  'Divers'
];

// Catégories complètes (CATEGORIES + sous-catégories détaillées) pour l'interface admin
export const ADMIN_CATEGORIES = [
  ...new Set([
    ...CATEGORIES,
    'Email',
    'Visioconférence',
    'Communication',
    'Téléphone & SMS',
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
    'Collectivités / Gestion municipale',
    'Collectivités / Dématérialisation',
    'Collectivités / Démarches en ligne',
    'Collectivités / Information des habitants',
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
  'Téléphone & SMS': 'Messagerie',
  
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
  'Navigateur': 'Réseaux sociaux',

  // Catégories ajoutées avec le catalogue « Évaluer mon organisation » :
  // sans correspondance, elles tombaient toutes dans « Divers ».
  'Productivité / Tableur': 'Productivité/Organisation',
  'Productivité / Tâches': 'Productivité/Organisation',
  'Productivité / Calendrier': 'Productivité/Organisation',
  'Productivité / Notes': 'Productivité/Organisation',
  'Productivité / Tout-en-un': 'Productivité/Organisation',
  'Gestion de projet': 'Productivité/Organisation',
  'Wiki & Documentation': 'Productivité/Organisation',
  'Gestion documentaire (GED)': 'Productivité/Organisation',
  'Signature électronique': 'Productivité/Organisation',
  // Logiciels des mairies et collectivités (« Collectivités / Gestion municipale »…)
  'Collectivités': 'Productivité/Organisation',
  'CRM & Support': 'Productivité/Organisation',
  'RH & Paie': 'Productivité/Organisation',
  'Comptabilité & Gestion': 'Finance',
  'Marketing / E-mailing': 'Messagerie',
  'Sécurité / 2FA': 'Sécurité & VPN',
  'Sécurité & Administration IT': 'Tech & Dev',
  'Sauvegarde & Supervision': 'Tech & Dev',
  'Outils / Développement': 'Tech & Dev',
  'Sites web & E-commerce': 'Tech & Dev',
  'Outils / Calculatrice': 'Utilitaires',
  'Design & Prototypage': 'Créativité',
  'Hôtellerie, Tourisme & Bien-être': 'Transport & Voyage',
  'Immobilier': 'Divers',
  'Juridique & Notariat': 'Divers',

  // Systèmes d'exploitation (Android, iOS, Windows, Linux...), distincts des
  // composants système (catégorie « Système »).
  'Système d\'exploitation / Smartphone': 'Systèmes d\'exploitation',
  'Système d\'exploitation / PC': 'Systèmes d\'exploitation',
  // Parent : toute sous-catégorie « Système d'exploitation / … » (iPhone…)
  'Système d\'exploitation': 'Systèmes d\'exploitation'
};

/**
 * Sous-catégories créées en découpant des catégories trop larges (audit du
 * 2026-11-10, docs/analyses/audit-alternatives-2026-11-10.md) -> catégorie d'avant.
 * Les alternatives se calculent par catégorie exacte (même usage) ; le Palmarès,
 * lui, garde ses podiums d'avant le découpage (voir getPodiumCategory).
 */
export const SPLIT_SUBCATEGORIES = {
  'Shopping / Grande distribution': 'Shopping',
  'Shopping / Places de marché': 'Shopping',
  'Shopping / Mode': 'Shopping',
  'Shopping / Beauté': 'Shopping',
  'Shopping / High-tech': 'Shopping',
  'Shopping / Seconde main': 'Shopping',
  'Shopping / Bricolage & maison': 'Shopping',
  'Jeux / Mobile': 'Jeux',
  'Jeux / Indépendants': 'Jeux',
  'Personnalisation / Icônes': 'Personnalisation',
  'Personnalisation / Widgets': 'Personnalisation',
  'Personnalisation / Fonds d\'écran': 'Personnalisation',
  'Sécurité / Bloqueurs de pub': 'Utilitaires',
  'Téléphone & SMS / Identification d\'appels': 'Téléphone & SMS',
  'Téléphone & SMS / Second numéro': 'Téléphone & SMS',
  'Maison / Serrures connectées': 'Maison connectée',
  'Streaming Vidéo / Films & séries': 'Streaming Vidéo',
  'Streaming Vidéo / Vidéos en ligne': 'Streaming Vidéo',
  'Streaming Vidéo / Médiathèque personnelle': 'Streaming Vidéo',
  'Streaming Vidéo / Box & TV': 'Streaming Vidéo',
  'Streaming Vidéo / Direct': 'Streaming Vidéo',
  'Réseaux sociaux / Photos': 'Réseaux sociaux',
  'Réseaux sociaux / Vidéo courte': 'Réseaux sociaux',
  'Réseaux sociaux / Forums': 'Réseaux sociaux',
  'Réseaux sociaux / Professionnel': 'Réseaux sociaux',
  'Réseaux sociaux / Événements': 'Réseaux sociaux',
  'Réseaux sociaux / Avatars': 'Réseaux sociaux',
  'Messagerie / Équipes & communautés': 'Messagerie',
  'Messagerie / Enfants': 'Messagerie',
  'Retouche Photo / Montage & IA': 'Retouche Photo',
  'Retouche Photo / Retouche classique': 'Retouche Photo',
  'Retouche Photo / Selfies & visage': 'Retouche Photo',
  'Sport & Fitness / Entraînement': 'Sport & Fitness',
  'Sport & Fitness / Salles de sport': 'Shopping',
  'Transport & Mobilité / VTC': 'Transport & Mobilité',
  'Email / Logiciels de messagerie': 'Email',
  // Deuxième volet de l'audit des alternatives (2026-11-10)
  'CRM & Support / CRM': 'CRM & Support',
  'CRM & Support / Tickets': 'CRM & Support',
  'Sauvegarde & Supervision / Sauvegarde': 'Sauvegarde & Supervision',
  'Sauvegarde & Supervision / Supervision': 'Sauvegarde & Supervision',
  'Gestion de projet / Tableau blanc': 'Gestion de projet',
  'Tech & Dev / Terminal': 'Outils / Développement',
  'Tech & Dev / Publication Android': 'Outils / Développement',
  'Système d\'exploitation / iPhone': 'Système d\'exploitation / Smartphone',
};

// Bloqueur de pub : rangé sous « Sécurité & VPN » dans le filtre du catalogue.
CATEGORY_MAPPING['Sécurité / Bloqueurs de pub'] = 'Sécurité & VPN';

/**
 * Catégorie principale (filtre du catalogue) d'une catégorie détaillée. Une
 * sous-catégorie « Parent / Détail » sans correspondance propre suit son parent
 * (« Shopping / Mode » -> « Shopping »), ce qui évite de modifier l'app pour
 * chaque nouvelle sous-catégorie. Sinon : « Divers ».
 */
export function getMainCategory(category) {
  if (!category) return 'Divers';
  if (CATEGORY_MAPPING[category]) return CATEGORY_MAPPING[category];
  const parent = String(category).split(' / ')[0];
  return CATEGORY_MAPPING[parent] || 'Divers';
}

/** Podium du Palmarès : catégorie détaillée, sauf sous-catégorie issue d'un découpage. */
export function getPodiumCategory(category) {
  if (!category) return 'Divers';
  return SPLIT_SUBCATEGORIES[category] || category;
}
