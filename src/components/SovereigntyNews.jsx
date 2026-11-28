import React, { useEffect, useState } from 'react';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';

export default function SovereigntyNews() {
  const [events, setEvents] = useState([]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    cachedFetchJSON(`${API_URL}/sovereignty-events`, { ttl: 300000 })
      .then(data => { if (!cancelled && Array.isArray(data.events)) setEvents(data.events); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (!events.length) return null;
  const french = typeof navigator !== 'undefined' && navigator.language.startsWith('fr');
  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
      <button type="button" className="flex w-full items-center justify-between gap-2 text-left font-semibold" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>
        {french ? 'Actualités de la souveraineté numérique' : 'Digital sovereignty news'}
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && <div className="mt-3 divide-y divide-slate-200">
        {events.map(event => (
          <article key={event.id} className="py-3">
            <time className="text-xs text-slate-500" dateTime={event.date}>{event.date}</time>
            <h3 className="font-semibold text-sm">{event.title}</h3>
            {event.summary && <p className="mt-1 text-sm text-slate-600">{event.summary}</p>}
            {typeof event.sourceUrl === 'string' && event.sourceUrl.startsWith('https://') && <a className="mt-2 inline-block text-sm text-indigo-600 underline" href={event.sourceUrl} target="_blank" rel="noopener noreferrer">{french ? 'Lire la source' : 'Read source'}</a>}
          </article>
        ))}
      </div>}
    </section>
  );
}
