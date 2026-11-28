import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatDate, t } from '../i18n/index.js';
import { API_URL } from '../utils/apiConfig';
import { cachedFetchJSON } from '../utils/fetchCache';

export default function SovereigntyNews() {
  const [events, setEvents] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    cachedFetchJSON(`${API_URL}/sovereignty-events`)
      .then(data => {
        if (data?.success !== true || !Array.isArray(data.events)) throw new Error('Invalid news response');
        if (!cancelled) setEvents(data.events);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt(value => value + 1);
  };

  return (
    <details className="group mb-4 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 [&::-webkit-details-marker]:hidden">
        {t('main.sovereigntyNews.title')}
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-3">
        {failed && (
          <div className="py-2 text-sm">
            <p role="status">{t('main.sovereigntyNews.error')}</p>
            <button type="button" onClick={retry} className="min-h-11 font-semibold text-indigo-700 underline dark:text-indigo-300">
              {t('main.sovereigntyNews.retry')}
            </button>
          </div>
        )}
        {!failed && events === null && <p role="status" className="py-2 text-sm">{t('main.sovereigntyNews.loading')}</p>}
        {events?.length === 0 && <p className="py-2 text-sm">{t('main.sovereigntyNews.empty')}</p>}
        {!!events?.length && (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {events.map(event => (
              <article key={event.id} className="break-words py-3">
                <time className="text-xs text-slate-600 dark:text-slate-300" dateTime={event.date}>
                  {formatDate(event.date, { dateStyle: 'medium', timeZone: 'UTC' })}
                </time>
                <h2 lang="fr" className="text-sm font-semibold">{event.title}</h2>
                {event.summary && <p lang="fr" className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.summary}</p>}
                {typeof event.sourceUrl === 'string' && event.sourceUrl.startsWith('https://') && (
                  <a className="mt-1 inline-flex min-h-11 items-center text-sm text-indigo-700 underline dark:text-indigo-300" href={event.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={t('main.sovereigntyNews.sourceLabel', { title: event.title })}>
                    {t('main.sovereigntyNews.source')}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
