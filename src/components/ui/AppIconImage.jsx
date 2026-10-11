import React, { useState, useEffect } from 'react';

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

  useEffect(() => { setFailed(false); }, [src]);

  if (failed) {
    return (
      <div className="w-full h-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-lg uppercase">
        {name.trim().charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      src={sizedIconUrl(src)}
      alt={alt ?? name}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
