/**
 * Modèle de données pour une application Trusti
 * Définit la structure complète d'une application avec tous ses attributs
 */

/**
 * @typedef {Object} Application
 * 
 * @property {number|string} id - Identifiant unique de l'application
 * @property {string} name - Nom de l'application
 * @property {string} trustiScore - Note Trusti de A (excellent) à E (mauvais)
 * @property {string} category - Catégorie de l'application (Communication, Productivité, etc.)
 * @property {string} icon - URL de l'icône ou emoji représentant l'application
 * @property {string} color - Classe Tailwind pour la couleur de fond (ex: bg-blue-600)
 * @property {string} reason - Explication détaillée du score Trusti attribué
 * 
 * @property {string} [playStoreUrl] - Lien de téléchargement vers Google Play Store
 * @property {string} [appleStoreUrl] - Lien de téléchargement vers Apple App Store
 * @property {string} [githubUrl] - Lien vers le dépôt GitHub (si open-source)
 * @property {string} [otherStoreUrl] - Lien vers un autre store (F-Droid, Microsoft Store, etc.)
 * @property {string} [website] - Site web officiel de l'application
 * 
 * @property {Array<number|string>} [alternativeAppIds] - Liste des IDs d'applications alternatives recommandées
 * @property {Array<number|string>} [replacesAppIds] - Liste des IDs d'applications que celle-ci peut remplacer
 * 
 * @property {string} [description] - Description détaillée de l'application
 * @property {string} [developer] - Nom du développeur ou de l'éditeur
 * @property {string} [license] - Type de licence (Open-source, Propriétaire, etc.)
 * @property {boolean} [isOpenSource] - Indique si l'application est open-source
 * @property {boolean} [isEuropean] - Indique si l'application est hébergée/développée en Europe
 * @property {string} [jurisdiction] - Juridiction légale (France, UE, USA, etc.)
 * 
 * @property {Object} [privacyFeatures] - Caractéristiques de confidentialité
 * @property {boolean} [privacyFeatures.endToEndEncryption] - Chiffrement de bout en bout
 * @property {boolean} [privacyFeatures.noTracking] - Absence de tracking
 * @property {boolean} [privacyFeatures.gdprCompliant] - Conformité RGPD
 * @property {boolean} [privacyFeatures.noAds] - Absence de publicité
 * 
 * @property {Date|string} [createdAt] - Date de création dans la base Trusti
 * @property {Date|string} [updatedAt] - Date de dernière mise à jour
 */

/**
 * Grades Trusti disponibles
 */
export const TRUSTI_GRADES = {
  A: 'A', // Excellence en vie privée
  B: 'B', // Bon respect de la vie privée
  C: 'C', // Moyen avec quelques compromis
  D: 'D', // Préoccupant
  E: 'E'  // Dangereux pour la vie privée
};

/**
 * Catégories d'applications
 */
export const APP_CATEGORIES = {
  COMMUNICATION: 'Communication',
  PRODUCTIVITY: 'Productivité/Organisation',
  SOCIAL_NETWORK: 'Réseaux Sociaux',
  E_COMMERCE: 'E-commerce',
  CLOUD_STORAGE: 'Cloud / Stockage',
  BROWSER: 'Navigateur',
  AI: 'IA / Productivité',
  EMAIL: 'Email',
  SECURITY: 'Sécurité',
  OTHER: 'Autre'
};

/**
 * Classe Application pour créer et valider des objets application
 */
export class TrustiApplication {
  /**
   * Crée une nouvelle instance d'application
   * @param {Application} data - Données de l'application
   */
  constructor(data) {
    // Champs obligatoires
    this.id = data.id;
    this.name = data.name;
    this.trustiScore = data.trustiScore || data.grade; // Compatibilité avec 'grade'
    this.category = data.category;
    this.icon = data.icon;
    this.color = data.color || 'bg-slate-600';
    this.reason = data.reason;

    // Liens de téléchargement
    this.playStoreUrl = data.playStoreUrl || null;
    this.appleStoreUrl = data.appleStoreUrl || null;
    this.githubUrl = data.githubUrl || null;
    this.otherStoreUrl = data.otherStoreUrl || null;
    this.website = data.website || null;

    // Relations avec d'autres applications
    this.alternativeAppIds = data.alternativeAppIds || [];
    this.replacesAppIds = data.replacesAppIds || [];

    // Informations supplémentaires
    this.description = data.description || '';
    this.developer = data.developer || null;
    this.license = data.license || null;
    this.isOpenSource = data.isOpenSource || false;
    this.isEuropean = data.isEuropean || false;
    this.jurisdiction = data.jurisdiction || null;

    // Caractéristiques de confidentialité
    this.privacyFeatures = {
      endToEndEncryption: data.privacyFeatures?.endToEndEncryption || false,
      noTracking: data.privacyFeatures?.noTracking || false,
      gdprCompliant: data.privacyFeatures?.gdprCompliant || false,
      noAds: data.privacyFeatures?.noAds || false,
      ...data.privacyFeatures
    };

    // Métadonnées
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Valide que l'application a tous les champs obligatoires
   * @returns {boolean} true si valide
   * @throws {Error} si des champs obligatoires manquent
   */
  validate() {
    const requiredFields = ['id', 'name', 'trustiScore', 'category', 'reason'];
    
    for (const field of requiredFields) {
      if (!this[field]) {
        throw new Error(`Le champ obligatoire "${field}" est manquant`);
      }
    }

    if (!Object.values(TRUSTI_GRADES).includes(this.trustiScore)) {
      throw new Error(`Le trustiScore doit être A, B, C, D ou E (reçu: ${this.trustiScore})`);
    }

    return true;
  }

  /**
   * Convertit l'application en objet simple (pour JSON)
   * @returns {Object} Objet simple
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      trustiScore: this.trustiScore,
      category: this.category,
      icon: this.icon,
      color: this.color,
      reason: this.reason,
      playStoreUrl: this.playStoreUrl,
      appleStoreUrl: this.appleStoreUrl,
      githubUrl: this.githubUrl,
      otherStoreUrl: this.otherStoreUrl,
      website: this.website,
      alternativeAppIds: this.alternativeAppIds,
      replacesAppIds: this.replacesAppIds,
      description: this.description,
      developer: this.developer,
      license: this.license,
      isOpenSource: this.isOpenSource,
      isEuropean: this.isEuropean,
      jurisdiction: this.jurisdiction,
      privacyFeatures: this.privacyFeatures,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Vérifie si l'application a au moins un lien de téléchargement
   * @returns {boolean}
   */
  hasDownloadLink() {
    return !!(this.playStoreUrl || this.appleStoreUrl || this.githubUrl || this.otherStoreUrl);
  }

  /**
   * Retourne tous les liens de téléchargement disponibles
   * @returns {Object} Objet avec les liens disponibles
   */
  getDownloadLinks() {
    const links = {};
    
    if (this.playStoreUrl) links.playStore = this.playStoreUrl;
    if (this.appleStoreUrl) links.appleStore = this.appleStoreUrl;
    if (this.githubUrl) links.github = this.githubUrl;
    if (this.otherStoreUrl) links.other = this.otherStoreUrl;
    if (this.website) links.website = this.website;
    
    return links;
  }

  /**
   * Retourne le niveau de vie privée selon le score
   * @returns {string} Description du niveau
   */
  getPrivacyLevel() {
    const levels = {
      A: 'Excellence en protection de la vie privée',
      B: 'Bon respect de la vie privée',
      C: 'Respect moyen avec quelques compromis',
      D: 'Pratiques de vie privée préoccupantes',
      E: 'Dangereux pour votre vie privée'
    };
    return levels[this.trustiScore] || 'Non évalué';
  }

  /**
   * Détermine si l'application est une Trusti App (recommandée)
   * Une Trusti App a un score A, B ou C
   * @returns {boolean} true si score A, B ou C
   */
  isTrustiApp() {
    return ['A', 'B', 'C'].includes(this.trustiScore);
  }

  /**
   * Détermine si l'application est une Star App (à éviter)
   * Une Star App a un score D ou E
   * @returns {boolean} true si score D ou E
   */
  isStarApp() {
    return ['D', 'E'].includes(this.trustiScore);
  }

  /**
   * Retourne le type d'application basé sur le score
   * @returns {string} 'trusti' si A/B/C, 'star' si D/E, 'regular' sinon
   */
  getAppType() {
    if (this.isTrustiApp()) return 'trusti';
    if (this.isStarApp()) return 'star';
    return 'regular';
  }
}

/**
 * Fonction factory pour créer une application
 * @param {Object} data - Données de l'application
 * @returns {TrustiApplication} Instance d'application
 */
export function createApplication(data) {
  const app = new TrustiApplication(data);
  app.validate();
  return app;
}

/**
 * Exemple d'utilisation
 */
export const APPLICATION_EXAMPLE = {
  id: 1001,
  name: "Signal",
  trustiScore: "A",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "💬",
  color: "bg-blue-600",
  reason: "Fondation à but non lucratif, chiffrement de bout en bout, code 100% open-source.",
  
  playStoreUrl: "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms",
  appleStoreUrl: "https://apps.apple.com/app/signal/id874139669",
  githubUrl: "https://github.com/signalapp",
  website: "https://signal.org",
  
  alternativeAppIds: [],
  replacesAppIds: [5], // Remplace WhatsApp (id: 5)
  
  description: "Messagerie privée avec chiffrement de bout en bout",
  developer: "Signal Foundation",
  license: "GPLv3",
  isOpenSource: true,
  isEuropean: false,
  jurisdiction: "USA",
  
  privacyFeatures: {
    endToEndEncryption: true,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
};

export default TrustiApplication;
