import { t } from '../../i18n/index.js';
/**
 * Traduction des permissions Android les plus courantes vers un nom lisible +
 * une icône, pour un public non technique (voir spec §20 : toujours préférer
 * "Google Play Services (com.google.android.gms)" à un simple identifiant
 * technique). Une permission absente de ce catalogue reste affichable : on
 * retombe sur son nom technique humanisé, jamais une erreur.
 */
export const PERMISSION_CATALOG = {
  'android.permission.ACCESS_FINE_LOCATION': { get readableName() { return t('technical.permissions.ACCESS_FINE_LOCATION'); }, icon: '📍' },
  'android.permission.ACCESS_COARSE_LOCATION': { get readableName() { return t('technical.permissions.ACCESS_COARSE_LOCATION'); }, icon: '📍' },
  'android.permission.ACCESS_BACKGROUND_LOCATION': { get readableName() { return t('technical.permissions.ACCESS_BACKGROUND_LOCATION'); }, icon: '📍' },
  'android.permission.CAMERA': { get readableName() { return t('technical.permissions.CAMERA'); }, icon: '📷' },
  'android.permission.RECORD_AUDIO': { get readableName() { return t('technical.permissions.RECORD_AUDIO'); }, icon: '🎤' },
  'android.permission.READ_CONTACTS': { get readableName() { return t('technical.permissions.READ_CONTACTS'); }, icon: '👥' },
  'android.permission.WRITE_CONTACTS': { get readableName() { return t('technical.permissions.WRITE_CONTACTS'); }, icon: '👥' },
  'android.permission.READ_CALENDAR': { get readableName() { return t('technical.permissions.READ_CALENDAR'); }, icon: '📅' },
  'android.permission.WRITE_CALENDAR': { get readableName() { return t('technical.permissions.WRITE_CALENDAR'); }, icon: '📅' },
  'android.permission.READ_SMS': { get readableName() { return t('technical.permissions.READ_SMS'); }, icon: '💬' },
  'android.permission.SEND_SMS': { get readableName() { return t('technical.permissions.SEND_SMS'); }, icon: '💬' },
  'android.permission.RECEIVE_SMS': { get readableName() { return t('technical.permissions.RECEIVE_SMS'); }, icon: '💬' },
  'android.permission.READ_PHONE_STATE': { get readableName() { return t('technical.permissions.READ_PHONE_STATE'); }, icon: '📱' },
  'android.permission.CALL_PHONE': { get readableName() { return t('technical.permissions.CALL_PHONE'); }, icon: '📞' },
  'android.permission.READ_CALL_LOG': { get readableName() { return t('technical.permissions.READ_CALL_LOG'); }, icon: '📞' },
  'android.permission.WRITE_CALL_LOG': { get readableName() { return t('technical.permissions.WRITE_CALL_LOG'); }, icon: '📞' },
  'android.permission.READ_EXTERNAL_STORAGE': { get readableName() { return t('technical.permissions.READ_EXTERNAL_STORAGE'); }, icon: '📁' },
  'android.permission.WRITE_EXTERNAL_STORAGE': { get readableName() { return t('technical.permissions.WRITE_EXTERNAL_STORAGE'); }, icon: '📁' },
  'android.permission.READ_MEDIA_IMAGES': { get readableName() { return t('technical.permissions.READ_MEDIA_IMAGES'); }, icon: '📁' },
  'android.permission.READ_MEDIA_VIDEO': { get readableName() { return t('technical.permissions.READ_MEDIA_VIDEO'); }, icon: '📁' },
  'android.permission.READ_MEDIA_AUDIO': { get readableName() { return t('technical.permissions.READ_MEDIA_AUDIO'); }, icon: '📁' },
  'android.permission.INTERNET': { get readableName() { return t('technical.permissions.INTERNET'); }, icon: '🌐' },
  'android.permission.ACCESS_NETWORK_STATE': { get readableName() { return t('technical.permissions.ACCESS_NETWORK_STATE'); }, icon: '🌐' },
  'android.permission.ACCESS_WIFI_STATE': { get readableName() { return t('technical.permissions.ACCESS_WIFI_STATE'); }, icon: '🌐' },
  'android.permission.POST_NOTIFICATIONS': { get readableName() { return t('technical.permissions.POST_NOTIFICATIONS'); }, icon: '🔔' },
  'android.permission.BLUETOOTH': { get readableName() { return t('technical.permissions.BLUETOOTH'); }, icon: '🔵' },
  'android.permission.BLUETOOTH_CONNECT': { get readableName() { return t('technical.permissions.BLUETOOTH_CONNECT'); }, icon: '🔵' },
  'android.permission.BLUETOOTH_SCAN': { get readableName() { return t('technical.permissions.BLUETOOTH_SCAN'); }, icon: '🔵' },
  'android.permission.VIBRATE': { get readableName() { return t('technical.permissions.VIBRATE'); }, icon: '📳' },
  'android.permission.WAKE_LOCK': { get readableName() { return t('technical.permissions.WAKE_LOCK'); }, icon: '⏱️' },
  'android.permission.GET_ACCOUNTS': { get readableName() { return t('technical.permissions.GET_ACCOUNTS'); }, icon: '👤' },
  'android.permission.USE_FINGERPRINT': { get readableName() { return t('technical.permissions.USE_FINGERPRINT'); }, icon: '🔒' },
  'android.permission.USE_BIOMETRIC': { get readableName() { return t('technical.permissions.USE_BIOMETRIC'); }, icon: '🔒' },
  'android.permission.BODY_SENSORS': { get readableName() { return t('technical.permissions.BODY_SENSORS'); }, icon: '❤️' },
  'android.permission.ACTIVITY_RECOGNITION': { get readableName() { return t('technical.permissions.ACTIVITY_RECOGNITION'); }, icon: '🏃' },
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
