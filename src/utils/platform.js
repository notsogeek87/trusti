import { Capacitor } from '@capacitor/core';

// true uniquement dans l'app Android empaquetée avec Capacitor (jamais dans un navigateur/PWA).
export const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

// true dans Safari/PWA sur iPhone ou iPad (les iPad récents se présentent comme un Mac tactile).
export const isIOSWeb = !Capacitor.isNativePlatform() && typeof navigator !== 'undefined' && (
  /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

// Navigateur de téléphone ou tablette (là où une capture de la liste des apps a du sens).
export const isMobileWeb = !Capacitor.isNativePlatform() && typeof navigator !== 'undefined' && (
  isIOSWeb || /Android|Mobi/.test(navigator.userAgent)
);
