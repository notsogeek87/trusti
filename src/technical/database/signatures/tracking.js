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
    category: 'Publicité / connexion sociale',
    isGoogleProduct: false,
    trackerCategory: 'advertising',
    packagePrefixes: ['com.facebook.appevents.', 'com.facebook.ads.', 'com.facebook.login.'],
    metaDataKeys: ['com.facebook.sdk.ApplicationId'],
    description: 'SDK Meta utilisé pour la connexion via Facebook et/ou la mesure publicitaire.',
  },
  {
    id: 'appsflyer',
    name: 'AppsFlyer',
    vendor: 'AppsFlyer',
    category: 'Attribution marketing',
    isGoogleProduct: false,
    trackerCategory: 'attribution',
    packagePrefixes: ['com.appsflyer.'],
    metaDataKeys: [],
    description: 'Mesure de l\'origine des installations et attribution des campagnes marketing.',
  },
  {
    id: 'adjust',
    name: 'Adjust',
    vendor: 'Adjust',
    category: 'Attribution marketing',
    isGoogleProduct: false,
    trackerCategory: 'attribution',
    packagePrefixes: ['com.adjust.sdk.'],
    metaDataKeys: [],
    description: 'Mesure de l\'origine des installations et attribution des campagnes marketing.',
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    vendor: 'Amplitude',
    category: 'Mesure d\'audience',
    isGoogleProduct: false,
    trackerCategory: 'analytics',
    packagePrefixes: ['com.amplitude.'],
    metaDataKeys: [],
    description: 'Mesure d\'audience et d\'usage de l\'application.',
  },
  {
    id: 'onesignal',
    name: 'OneSignal',
    vendor: 'OneSignal',
    category: 'Notifications push',
    isGoogleProduct: false,
    trackerCategory: 'engagement',
    packagePrefixes: ['com.onesignal.'],
    metaDataKeys: [],
    description: 'Envoi de notifications push, avec mesure d\'engagement associée.',
  },
];

export default TRACKING_SIGNATURES;
