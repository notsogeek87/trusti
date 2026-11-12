import React from 'react';

/**
 * Mention d'hébergement, affichée seulement quand le build la demande
 * (VITE_HOSTED_BY=hyperfluid, posé dans le Dockerfile de l'image Hyperfluid).
 * Le build Vercel n'a pas cette variable : rien ne s'affiche.
 */
const HOSTS = {
  hyperfluid: {
    label: 'Hébergé en France par Hyperfluid',
    url: 'https://www.hyperfluid.cloud/',
    // Copié dans l'image au build (workflow hyperfluid-image) : aucune requête vers un tiers.
    logo: '/hosting/hyperfluid.svg',
  },
};

const HostingCredit = ({ className = '', size = 'text-[11px]' }) => {
  const host = HOSTS[import.meta.env.VITE_HOSTED_BY];
  const [logoOk, setLogoOk] = React.useState(true);
  if (!host) return null;
  return (
    <p className={`${size} text-slate-500 ${className}`}>
      <a
        href={host.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline decoration-slate-600 underline-offset-2 hover:text-slate-300"
      >
        {host.logo && logoOk && (
          <img
            src={host.logo}
            alt=""
            aria-hidden="true"
            className="h-3 w-3 shrink-0 object-contain"
            onError={() => setLogoOk(false)}
          />
        )}
        {host.label}
      </a>
    </p>
  );
};

export default HostingCredit;
