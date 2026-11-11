import React from 'react';
import { ExternalLink, LifeBuoy } from 'lucide-react';
import { helpForProfile } from '../../constants/orgHelp';

/** « Qui peut vous aider » : dispositifs publics, gratuits ou mutualisés. */
const OrganisationHelp = ({ profile }) => {
  const items = helpForProfile(profile);
  return (
    <section className="bg-white/90 rounded-2xl p-5 shadow-sm" aria-labelledby="aide-titre">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <LifeBuoy size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 id="aide-titre" className="font-black text-slate-800">Qui peut vous aider ?</h3>
          <p className="text-xs text-slate-500">Dispositifs publics ou mutualisés, sans lien commercial avec Trusti.</p>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-slate-100">
        {items.map(item => (
          <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-black text-indigo-600 hover:underline"
            >
              {item.label} <ExternalLink size={12} aria-hidden="true" />
            </a>
            <p className="text-sm text-slate-600">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default OrganisationHelp;
