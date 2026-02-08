/**
 * Exemples d'applications Trusti
 * Ce fichier contient différents exemples d'utilisation du modèle Application
 */

import { createApplication, APP_CATEGORIES } from './Application.js';

/**
 * Exemple 1 : Application open-source avec tous les liens
 */
export const exampleSignal = createApplication({
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
  replacesAppIds: [5], // Remplace WhatsApp
  
  description: "Messagerie privée avec chiffrement de bout en bout, développée par une fondation à but non lucratif.",
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
});

/**
 * Exemple 2 : Application propriétaire avec score moyen
 */
export const exampleWhatsApp = createApplication({
  id: 5,
  name: "WhatsApp",
  trustiScore: "C",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "💬",
  color: "bg-green-500",
  reason: "Chiffrement de bout en bout mais partage de métadonnées avec Meta.",
  
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.whatsapp",
  appleStoreUrl: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
  website: "https://www.whatsapp.com",
  
  alternativeAppIds: [1001], // Signal comme alternative
  replacesAppIds: [],
  
  description: "Application de messagerie appartenant à Meta (Facebook).",
  developer: "Meta Platforms, Inc.",
  license: "Propriétaire",
  isOpenSource: false,
  isEuropean: false,
  jurisdiction: "USA",
  
  privacyFeatures: {
    endToEndEncryption: true,
    noTracking: false,
    gdprCompliant: false,
    noAds: true
  }
});

/**
 * Exemple 3 : Application dangereuse pour la vie privée
 */
export const exampleTikTok = createApplication({
  id: 4,
  name: "TikTok",
  trustiScore: "E",
  category: APP_CATEGORIES.SOCIAL_NETWORK,
  icon: "📱",
  color: "bg-black",
  reason: "Transfert de données vers des juridictions non-équivalentes RGPD, collecte excessive de données.",
  
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically",
  appleStoreUrl: "https://apps.apple.com/app/tiktok/id835599320",
  website: "https://www.tiktok.com",
  
  alternativeAppIds: [],
  replacesAppIds: [],
  
  description: "Plateforme de vidéos courtes avec préoccupations majeures de vie privée.",
  developer: "ByteDance Ltd.",
  license: "Propriétaire",
  isOpenSource: false,
  isEuropean: false,
  jurisdiction: "Chine",
  
  privacyFeatures: {
    endToEndEncryption: false,
    noTracking: false,
    gdprCompliant: false,
    noAds: false
  }
});

/**
 * Exemple 4 : Application européenne avec bon score
 */
export const exampleProtonMail = createApplication({
  id: 1002,
  name: "Proton Mail",
  trustiScore: "A",
  category: APP_CATEGORIES.EMAIL,
  icon: "📧",
  color: "bg-purple-700",
  reason: "Juridiction Suisse, chiffrement zero-knowledge, open-source.",
  
  playStoreUrl: "https://play.google.com/store/apps/details?id=ch.protonmail.android",
  appleStoreUrl: "https://apps.apple.com/app/proton-mail/id979659905",
  githubUrl: "https://github.com/ProtonMail",
  website: "https://proton.me/mail",
  
  alternativeAppIds: [],
  replacesAppIds: [], // Peut remplacer Gmail, Outlook, etc.
  
  description: "Service d'email chiffré basé en Suisse avec respect total de la vie privée.",
  developer: "Proton AG",
  license: "GPLv3",
  isOpenSource: true,
  isEuropean: true,
  jurisdiction: "Suisse",
  
  privacyFeatures: {
    endToEndEncryption: true,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});

/**
 * Exemple 5 : Application avec F-Droid (autre store)
 */
export const exampleNewPipe = createApplication({
  id: 2001,
  name: "NewPipe",
  trustiScore: "A",
  category: "Multimédia",
  icon: "📺",
  color: "bg-red-600",
  reason: "Client YouTube open-source sans publicité ni tracking Google.",
  
  githubUrl: "https://github.com/TeamNewPipe/NewPipe",
  otherStoreUrl: "https://f-droid.org/packages/org.schabi.newpipe/",
  website: "https://newpipe.net",
  
  alternativeAppIds: [],
  replacesAppIds: [], // Remplace YouTube
  
  description: "Client YouTube libre et open-source qui respecte votre vie privée.",
  developer: "Team NewPipe",
  license: "GPLv3",
  isOpenSource: true,
  isEuropean: false,
  jurisdiction: "International",
  
  privacyFeatures: {
    endToEndEncryption: false,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});

/**
 * Exemple 6 : Application avec uniquement un site web (PWA)
 */
export const exampleMastodon = createApplication({
  id: 3001,
  name: "Mastodon",
  trustiScore: "A",
  category: APP_CATEGORIES.SOCIAL_NETWORK,
  icon: "🐘",
  color: "bg-indigo-600",
  reason: "Réseau social décentralisé, open-source, sans algorithme de recommandation invasif.",
  
  playStoreUrl: "https://play.google.com/store/apps/details?id=org.joinmastodon.android",
  appleStoreUrl: "https://apps.apple.com/app/mastodon/id1571998974",
  githubUrl: "https://github.com/mastodon/mastodon",
  website: "https://joinmastodon.org",
  
  alternativeAppIds: [],
  replacesAppIds: [4], // Remplace TikTok, Twitter, etc.
  
  description: "Réseau social fédéré et décentralisé, alternative éthique aux réseaux traditionnels.",
  developer: "Mastodon gGmbH",
  license: "AGPLv3",
  isOpenSource: true,
  isEuropean: true,
  jurisdiction: "Allemagne",
  
  privacyFeatures: {
    endToEndEncryption: false,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});

/**
 * Collection d'exemples pour tests et développement
 */
export const EXAMPLE_APPS = [
  exampleSignal,
  exampleWhatsApp,
  exampleTikTok,
  exampleProtonMail,
  exampleNewPipe,
  exampleMastodon
];

/**
 * Affiche les informations d'une application (pour debug)
 */
export function displayAppInfo(app) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 ${app.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 Catégorie: ${app.category}`);
  console.log(`⭐ Score Trusti: ${app.trustiScore}`);
  console.log(`📝 ${app.reason}`);
  console.log(`\n🔗 Liens de téléchargement:`);
  
  const links = app.getDownloadLinks();
  if (Object.keys(links).length === 0) {
    console.log('   Aucun lien disponible');
  } else {
    Object.entries(links).forEach(([platform, url]) => {
      console.log(`   - ${platform}: ${url}`);
    });
  }
  
  console.log(`\n🔒 ${app.getPrivacyLevel()}`);
  
  if (app.isOpenSource) {
    console.log(`💚 Open-source (${app.license})`);
  }
  
  if (app.isEuropean) {
    console.log(`🇪🇺 Application européenne`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Note: La démo auto-exécutable est désactivée pour compatibilité navigateur
// Pour exécuter la démo, utilisez: node src/models/examples.js
