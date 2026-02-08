/**
 * Définitions TypeScript pour le modèle Application Trusti
 * Ce fichier fournit l'autocomplétion et la validation dans les éditeurs
 */

export type TrustiScore = 'A' | 'B' | 'C' | 'D' | 'E';

export type AppCategory = 
  | 'Communication'
  | 'Productivité'
  | 'Réseaux Sociaux'
  | 'E-commerce'
  | 'Cloud / Stockage'
  | 'Navigateur'
  | 'IA / Productivité'
  | 'Email'
  | 'Sécurité'
  | 'Autre';

export interface PrivacyFeatures {
  endToEndEncryption?: boolean;
  noTracking?: boolean;
  gdprCompliant?: boolean;
  noAds?: boolean;
  [key: string]: boolean | undefined;
}

export interface Application {
  // Champs obligatoires
  id: number | string;
  name: string;
  trustiScore: TrustiScore;
  category: AppCategory | string;
  icon: string;
  color: string;
  reason: string;

  // Liens de téléchargement
  playStoreUrl?: string | null;
  appleStoreUrl?: string | null;
  githubUrl?: string | null;
  otherStoreUrl?: string | null;
  website?: string | null;

  // Relations
  alternativeAppIds?: (number | string)[];
  replacesAppIds?: (number | string)[];

  // Informations complémentaires
  description?: string;
  developer?: string | null;
  license?: string | null;
  isOpenSource?: boolean;
  isEuropean?: boolean;
  jurisdiction?: string | null;

  // Vie privée
  privacyFeatures?: PrivacyFeatures;

  // Métadonnées
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TrustiGrades {
  A: 'A';
  B: 'B';
  C: 'C';
  D: 'D';
  E: 'E';
}

export interface AppCategories {
  COMMUNICATION: 'Communication';
  PRODUCTIVITY: 'Productivité';
  SOCIAL_NETWORK: 'Réseaux Sociaux';
  E_COMMERCE: 'E-commerce';
  CLOUD_STORAGE: 'Cloud / Stockage';
  BROWSER: 'Navigateur';
  AI: 'IA / Productivité';
  EMAIL: 'Email';
  SECURITY: 'Sécurité';
  OTHER: 'Autre';
}

export declare class TrustiApplication {
  id: number | string;
  name: string;
  trustiScore: TrustiScore;
  category: string;
  icon: string;
  color: string;
  reason: string;
  playStoreUrl: string | null;
  appleStoreUrl: string | null;
  githubUrl: string | null;
  otherStoreUrl: string | null;
  website: string | null;
  alternativeAppIds: (number | string)[];
  replacesAppIds: (number | string)[];
  description: string;
  developer: string | null;
  license: string | null;
  isOpenSource: boolean;
  isEuropean: boolean;
  jurisdiction: string | null;
  privacyFeatures: PrivacyFeatures;
  createdAt: string;
  updatedAt: string;

  constructor(data: Application);
  validate(): boolean;
  toJSON(): Application;
  hasDownloadLink(): boolean;
  getDownloadLinks(): Record<string, string>;
  getPrivacyLevel(): string;
}

export declare function createApplication(data: Application): TrustiApplication;

export declare const TRUSTI_GRADES: TrustiGrades;
export declare const APP_CATEGORIES: AppCategories;
export declare const APPLICATION_EXAMPLE: Application;

export default TrustiApplication;
