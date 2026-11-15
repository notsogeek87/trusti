import { t } from '../../../i18n/index.js';
/**
 * Signatures de SDK de publicité/mesure/attribution ("trackers"). Même
 * mécanisme que les autres fichiers de signatures — voir google.js pour le
 * détail des champs.
 *
 * IMPORTANT : la présence d'un tracker signifie seulement qu'une référence à
 * son SDK a été détectée. Ne jamais présenter cela comme la preuve d'un
 * comportement d'espionnage — voir la formulation utilisée dans l'UI
 * ("SDK de tracking détecté", jamais "cette application vous espionne").
 */
export const TRACKING_SIGNATURES = [
  {
    id: 'meta_sdk',
    name: 'Meta (Facebook SDK)',
    vendor: 'Meta',
    get category() { return t('technical.signatures.meta_sdk.category'); },
    isGoogleProduct: false,
    trackerCategory: 'advertising',
    packagePrefixes: ['com.facebook.appevents.', 'com.facebook.ads.', 'com.facebook.login.'],
    metaDataKeys: ['com.facebook.sdk.ApplicationId'],
    get description() { return t('technical.signatures.meta_sdk.description'); },
  },
  {
    id: 'appsflyer',
    name: 'AppsFlyer',
    vendor: 'AppsFlyer',
    get category() { return t('technical.signatures.appsflyer.category'); },
    isGoogleProduct: false,
    trackerCategory: 'attribution',
    packagePrefixes: ['com.appsflyer.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.appsflyer.description'); },
  },
  {
    id: 'adjust',
    name: 'Adjust',
    vendor: 'Adjust',
    get category() { return t('technical.signatures.adjust.category'); },
    isGoogleProduct: false,
    trackerCategory: 'attribution',
    packagePrefixes: ['com.adjust.sdk.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.adjust.description'); },
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    vendor: 'Amplitude',
    get category() { return t('technical.signatures.amplitude.category'); },
    isGoogleProduct: false,
    trackerCategory: 'analytics',
    packagePrefixes: ['com.amplitude.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.amplitude.description'); },
  },
  {
    id: 'onesignal',
    name: 'OneSignal',
    vendor: 'OneSignal',
    get category() { return t('technical.signatures.onesignal.category'); },
    isGoogleProduct: false,
    trackerCategory: 'engagement',
    packagePrefixes: ['com.onesignal.'],
    metaDataKeys: [],
    get description() { return t('technical.signatures.onesignal.description'); },
  },
];

export default TRACKING_SIGNATURES;
