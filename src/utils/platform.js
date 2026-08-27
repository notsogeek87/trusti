import { Capacitor } from '@capacitor/core';

// true uniquement dans l'app Android empaquetée avec Capacitor (jamais dans un navigateur/PWA).
export const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
