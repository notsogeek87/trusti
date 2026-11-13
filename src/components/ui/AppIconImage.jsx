import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  sizedIconUrl,
  iconAttemptUrl,
  bundledIconFile,
  isIconLoaded,
  isIconFailed,
  markIconLoaded,
  markIconFailed,
  ICON_MAX_RETRIES,
  ICON_RETRY_DELAYS,
} from '../../utils/appIconLoader';

// Icônes copiées sur le domaine Trusti (scripts/bundle-app-icons.js), sur le
// web comme dans l'APK. Les réseaux d'entreprise bloquent souvent
// les domaines d'origine (googleusercontent.com, jsdelivr…) : servir l'icône
// depuis notre domaine évite ce blocage.
// Le manifeste associe URL distante -> fichier local ; une URL modifiée en base
// n'y figure plus et est donc chargée depuis le réseau jusqu'au prochain build.
let bundledIcons = {};
let bundledIconsReady = false;
let bundledIconsPromise = null;
const loadBundledIcons = () => {
  if (!bundledIconsPromise) {
    bundledIconsPromise = fetch('/app-icons/manifest.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => { bundledIcons = m && typeof m === 'object' ? m : {}; })
      .catch(() => {})
      .finally(() => { bundledIconsReady = true; });
  }
  return bundledIconsPromise;
};

// Logique pure (cache, retries, tailles) dans src/utils/appIconLoader.js.
export { sizedIconUrl };

// Image d'icône d'app avec repli : si l'URL est cassée, on affiche l'initiale
// de l'app plutôt que l'icône d'image cassée + texte alt du navigateur.
// Un échec ponctuel (réseau mobile, SVG distant) est retenté avant le repli,
// et les URLs déjà chargées / en échec définitif sont mémorisées entre rendus.
function AppIconImage({ src, name = '', className = 'w-full h-full object-cover', loading = 'lazy', alt }) {
  const [failed, setFailed] = useState(() => isIconFailed(src));
  const [attempt, setAttempt] = useState(0);
  const [localMissed, setLocalMissed] = useState(false);
  const [manifestReady, setManifestReady] = useState(bundledIconsReady);
  const retryTimer = useRef(null);

  // Ne réinitialise que si l'URL change réellement (pas à chaque rendu).
  const prevSrc = useRef(src);
  if (prevSrc.current !== src) {
    prevSrc.current = src;
    clearTimeout(retryTimer.current);
    if (failed !== isIconFailed(src)) setFailed(isIconFailed(src));
    if (attempt !== 0) setAttempt(0);
    if (localMissed) setLocalMissed(false);
  }

  useEffect(() => { loadBundledIcons().then(() => setManifestReady(true)); }, []);
  useEffect(() => () => clearTimeout(retryTimer.current), []);

  const localFile = !localMissed && bundledIconFile(bundledIcons, src);

  const handleError = useCallback(() => {
    if (localFile) { setLocalMissed(true); return; }
    if (attempt < ICON_MAX_RETRIES) {
      clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(
        () => setAttempt((a) => a + 1),
        ICON_RETRY_DELAYS[attempt] ?? ICON_RETRY_DELAYS[ICON_RETRY_DELAYS.length - 1]
      );
      return;
    }
    markIconFailed(src);
    setFailed(true);
  }, [localFile, attempt, src]);

  const handleLoad = useCallback(() => {
    if (!localFile) markIconLoaded(src);
  }, [localFile, src]);

  // Tant que le manifeste n'est pas lu, on ne sait pas si une copie locale
  // existe : on évite une requête vers un domaine peut-être bloqué.
  if (!manifestReady) {
    return <div className="w-full h-full bg-slate-100" aria-hidden="true" />;
  }

  if (failed && !localFile) {
    return (
      <div className="w-full h-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-lg uppercase">
        {name.trim().charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      // Nouvel élément à chaque tentative pour forcer un vrai rechargement
      key={localFile ? 'local' : `remote-${attempt}`}
      src={localFile ? `/app-icons/${localFile}` : iconAttemptUrl(src, attempt)}
      alt={alt ?? name}
      // Déjà chargée (en cache navigateur) ou nouvelle tentative : pas de lazy
      loading={isIconLoaded(src) || attempt > 0 ? 'eager' : loading}
      referrerPolicy="no-referrer"
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export default memo(AppIconImage);
