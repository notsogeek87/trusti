import React from 'react';

/**
 * Mention d'hébergement, affichée seulement quand le build la demande
 * (VITE_HOSTED_BY=hyperfluid, posé dans le Dockerfile de l'image Hyperfluid).
 * Le build Vercel n'a pas cette variable : rien ne s'affiche.
 */
const HOSTS = {
  hyperfluid: { label: 'Hébergé en France par Hyperfluid', url: 'https://www.hyperfluid.cloud/' },
};

const HostingCredit = ({ className = '' }) => {
  const host = HOSTS[import.meta.env.VITE_HOSTED_BY];
  if (!host) return null;
  return (
    <p className={`text-[11px] text-slate-500 ${className}`}>
      <a
        href={host.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300"
      >
        {host.label}
      </a>
    </p>
  );
};

export default HostingCredit;
