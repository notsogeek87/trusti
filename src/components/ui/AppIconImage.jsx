import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Icônes embarquées dans l'APK (scripts/bundle-app-icons.js). Le manifeste
// associe URL distante -> fichier local ; une URL modifiée en base n'y figure
// plus et est donc chargée depuis le réseau (mise à jour automatique).
let bundledIcons = {};
let bundledIconsPromise = null;
const loadBundledIcons = () => {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (!bundledIconsPromise) {
    bundledIconsPromise = fetch('/app-icons/manifest.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => { bundledIcons = m; })
      .catch(() => {});
  }
  return bundledIconsPromise;
};

// Les URLs play-lh sans suffixe de taille renvoient l'image pleine résolution
// (~140 Ko). Sur mobile, avec une dizaine d'icônes chargées d'un coup, certaines
// échouent. On demande une vignette légère (=s96-rw, ~4 Ko).
export function sizedIconUrl(url) {
  if (typeof url === 'string' && /^https:\/\/play-lh\.googleusercontent\.com\/[^=?]+$/.test(url)) {
    return `${url}=s96-rw`;
  }
  return url;
}

// Image d'icône d'app avec repli : si l'URL est cassée, on affiche l'initiale
// de l'app plutôt que l'icône d'image cassée + texte alt du navigateur.
export default function AppIconImage({ src, name = '', className = 'w-full h-full object-cover', loading = 'lazy', alt }) {
  const [failed, setFailed] = useState(false);
  const [localMissed, setLocalMissed] = useState(false);
  const [, setManifestReady] = useState(false);

  useEffect(() => { setFailed(false); setLocalMissed(false); }, [src]);
  useEffect(() => { loadBundledIcons().then(() => setManifestReady(true)); }, []);

  const localFile = !localMissed && bundledIcons[src];

  if (failed) {
    return (
      <div className="w-full h-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-lg uppercase">
        {name.trim().charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      src={localFile ? `/app-icons/${localFile}` : sizedIconUrl(src)}
      alt={alt ?? name}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => (localFile ? setLocalMissed(true) : setFailed(true))}
    />
  );
}
