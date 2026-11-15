import { t } from '../../../i18n/index.js';
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
    get category() { return t('technical.signatures.sentry.category'); },
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['io.sentry.'],
    metaDataKeys: ['io.sentry.dsn'],
    get description() { return t('technical.signatures.sentry.description'); },
  },
  {
    id: 'microsoft_app_center',
    name: 'Microsoft App Center',
    vendor: 'Microsoft',
    get category() { return t('technical.signatures.microsoft_app_center.category'); },
    isGoogleProduct: false,
    trackerCategory: 'analytics',
    packagePrefixes: ['com.microsoft.appcenter.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.microsoft_app_center.description'); },
  },
  {
    id: 'unity_engine',
    name: 'Unity',
    vendor: 'Unity Technologies',
    get category() { return t('technical.signatures.unity_engine.category'); },
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['com.unity3d.player.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.unity_engine.description'); },
  },
  {
    id: 'unity_ads',
    name: 'Unity Ads',
    vendor: 'Unity Technologies',
    get category() { return t('technical.signatures.unity_ads.category'); },
    isGoogleProduct: false,
    trackerCategory: 'advertising',
    packagePrefixes: ['com.unity3d.services.ads.', 'com.unity3d.ads.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.unity_ads.description'); },
  },
  {
    id: 'revenuecat',
    name: 'RevenueCat',
    vendor: 'RevenueCat',
    get category() { return t('technical.signatures.revenuecat.category'); },
    isGoogleProduct: false,
    trackerCategory: null,
    packagePrefixes: ['com.revenuecat.purchases.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.revenuecat.description'); },
  },
];

export default DEVTOOLS_SIGNATURES;
