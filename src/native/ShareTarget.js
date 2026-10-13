import { registerPlugin } from '@capacitor/core';

/**
 * Pont vers ShareTargetPlugin (android/app/src/main/java/eu/trusti/app/ShareTargetPlugin.java).
 * Trusti apparaît dans le menu « Partager » d'Android pour du texte (ex. le
 * bouton Partager du Play Store ou de F-Droid) : le texte reçu est envoyé à
 * l'événement « sharedText » ({ text }), y compris s'il a été reçu avant que le
 * listener ne soit enregistré (démarrage à froid). N'existe que dans l'app
 * Android native (voir isNativeAndroid).
 */
const ShareTarget = registerPlugin('ShareTarget');

export default ShareTarget;
