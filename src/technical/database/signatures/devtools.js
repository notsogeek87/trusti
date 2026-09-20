/**
 * Signatures de SDK "outils développeur" courants (crash reporting, moteur de
 * jeu, paiement, mobile device management...) qui ne sont pas des trackers
 * publicitaires. Voir google.js pour le détail des champs.
 */
export const DEVTOOLS_SIGNATURES = [
  {
    id: 'sentry',
    name: 'Sentry',
    vendor: 'Sentry',
    category: 'Rapport de plantage',
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['io.sentry.'],
    metaDataKeys: ['io.sentry.dsn'],
    description: 'Collecte des rapports de plantage (crash) et d\'erreurs pour le développeur.',
  },
  {
    id: 'microsoft_app_center',
    name: 'Microsoft App Center',
    vendor: 'Microsoft',
    category: 'Rapport de plantage / mesure d\'audience',
    isGoogleProduct: false,
    trackerCategory: 'analytics',
    packagePrefixes: ['com.microsoft.appcenter.'],
    metaDataKeys: [],
    description: 'Suite Microsoft de suivi de plantages et de mesure d\'usage.',
  },
  {
    id: 'unity_engine',
    name: 'Unity',
    vendor: 'Unity Technologies',
    category: 'Moteur de jeu',
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['com.unity3d.player.'],
    metaDataKeys: [],
    description: 'Moteur utilisé pour développer l\'application (souvent un jeu).',
  },
  {
    id: 'unity_ads',
    name: 'Unity Ads',
    vendor: 'Unity Technologies',
    category: 'Publicité',
    isGoogleProduct: false,
    trackerCategory: 'advertising',
    packagePrefixes: ['com.unity3d.services.ads.', 'com.unity3d.ads.'],
    metaDataKeys: [],
    description: 'Régie publicitaire intégrée au moteur Unity.',
  },
  {
    id: 'revenuecat',
    name: 'RevenueCat',
    vendor: 'RevenueCat',
    category: 'Paiement / abonnements',
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['com.revenuecat.purchases.'],
    metaDataKeys: [],
    description: 'Gestion des achats et abonnements in-app.',
  },
];

export default DEVTOOLS_SIGNATURES;
