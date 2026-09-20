/**
 * Traduction des permissions Android les plus courantes vers un nom lisible +
 * une icône, pour un public non technique (voir spec §20 : toujours préférer
 * "Google Play Services (com.google.android.gms)" à un simple identifiant
 * technique). Une permission absente de ce catalogue reste affichable : on
 * retombe sur son nom technique humanisé, jamais une erreur.
 */
export const PERMISSION_CATALOG = {
  'android.permission.ACCESS_FINE_LOCATION': { readableName: 'Localisation précise', icon: '📍' },
  'android.permission.ACCESS_COARSE_LOCATION': { readableName: 'Localisation approximative', icon: '📍' },
  'android.permission.ACCESS_BACKGROUND_LOCATION': { readableName: 'Localisation en arrière-plan', icon: '📍' },
  'android.permission.CAMERA': { readableName: 'Caméra', icon: '📷' },
  'android.permission.RECORD_AUDIO': { readableName: 'Microphone', icon: '🎤' },
  'android.permission.READ_CONTACTS': { readableName: 'Lecture des contacts', icon: '👥' },
  'android.permission.WRITE_CONTACTS': { readableName: 'Modification des contacts', icon: '👥' },
  'android.permission.READ_CALENDAR': { readableName: 'Lecture du calendrier', icon: '📅' },
  'android.permission.WRITE_CALENDAR': { readableName: 'Modification du calendrier', icon: '📅' },
  'android.permission.READ_SMS': { readableName: 'Lecture des SMS', icon: '💬' },
  'android.permission.SEND_SMS': { readableName: 'Envoi de SMS', icon: '💬' },
  'android.permission.RECEIVE_SMS': { readableName: 'Réception de SMS', icon: '💬' },
  'android.permission.READ_PHONE_STATE': { readableName: 'État du téléphone', icon: '📱' },
  'android.permission.CALL_PHONE': { readableName: 'Passer des appels', icon: '📞' },
  'android.permission.READ_CALL_LOG': { readableName: 'Historique des appels', icon: '📞' },
  'android.permission.WRITE_CALL_LOG': { readableName: 'Modification de l\'historique d\'appels', icon: '📞' },
  'android.permission.READ_EXTERNAL_STORAGE': { readableName: 'Lecture du stockage', icon: '📁' },
  'android.permission.WRITE_EXTERNAL_STORAGE': { readableName: 'Écriture sur le stockage', icon: '📁' },
  'android.permission.READ_MEDIA_IMAGES': { readableName: 'Lecture des photos', icon: '📁' },
  'android.permission.READ_MEDIA_VIDEO': { readableName: 'Lecture des vidéos', icon: '📁' },
  'android.permission.READ_MEDIA_AUDIO': { readableName: 'Lecture des fichiers audio', icon: '📁' },
  'android.permission.INTERNET': { readableName: 'Accès Internet', icon: '🌐' },
  'android.permission.ACCESS_NETWORK_STATE': { readableName: 'État du réseau', icon: '🌐' },
  'android.permission.ACCESS_WIFI_STATE': { readableName: 'État du Wi-Fi', icon: '🌐' },
  'android.permission.POST_NOTIFICATIONS': { readableName: 'Notifications', icon: '🔔' },
  'android.permission.BLUETOOTH': { readableName: 'Bluetooth', icon: '🔵' },
  'android.permission.BLUETOOTH_CONNECT': { readableName: 'Connexion Bluetooth', icon: '🔵' },
  'android.permission.BLUETOOTH_SCAN': { readableName: 'Recherche Bluetooth', icon: '🔵' },
  'android.permission.VIBRATE': { readableName: 'Vibration', icon: '📳' },
  'android.permission.WAKE_LOCK': { readableName: 'Empêcher la mise en veille', icon: '⏱️' },
  'android.permission.GET_ACCOUNTS': { readableName: 'Comptes sur l\'appareil', icon: '👤' },
  'android.permission.USE_FINGERPRINT': { readableName: 'Empreinte digitale', icon: '🔒' },
  'android.permission.USE_BIOMETRIC': { readableName: 'Authentification biométrique', icon: '🔒' },
  'android.permission.BODY_SENSORS': { readableName: 'Capteurs corporels', icon: '❤️' },
  'android.permission.ACTIVITY_RECOGNITION': { readableName: 'Reconnaissance d\'activité physique', icon: '🏃' },
};

/**
 * @param {string} androidName - nom technique complet (ex. "android.permission.CAMERA")
 * @returns {{readableName: string, icon: string}}
 */
export function lookupPermission(androidName) {
  if (PERMISSION_CATALOG[androidName]) return PERMISSION_CATALOG[androidName];

  const shortName = androidName.split('.').pop() || androidName;
  return {
    readableName: shortName.replace(/_/g, ' ').toLowerCase(),
    icon: '🔐',
  };
}

export default PERMISSION_CATALOG;
