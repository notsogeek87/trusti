import React from 'react';
import { AlertTriangle, Sparkles, Info, ExternalLink } from 'lucide-react';
import { formatDate, t } from '../../i18n/index.js';

const formatDay = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
};

const STYLE = {
  negative: { Icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
  positive: { Icon: Sparkles, tone: 'bg-emerald-50 text-emerald-600' },
  neutral: { Icon: Info, tone: 'bg-indigo-50 text-indigo-600' },
};

/**
 * Événements publiés d'une app (fuite, rachat, changement de politique, open source…),
 * dans sa fiche, sous le détail de l'évaluation. Rien si aucun événement.
 * Données : useAssessment -> GET /api/apps?assessment_for=:id (champ events).
 */
const AppEventsList = ({ events }) => {
  if (!events || events.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
      <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-2">{t('assessment.detail.events')}</h3>
      <ul className="divide-y divide-slate-100">
        {events.map((event) => {
          const { Icon, tone } = STYLE[event.impact] || STYLE.neutral;
          return (
            <li key={event.id} className="py-2.5 flex items-start gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
                <Icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {t(`inbox.event.${event.type}`)} · {formatDay(event.date)}
                </p>
                <p className="text-sm font-bold text-slate-800 leading-snug">{event.title}</p>
                {event.summary && <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{event.summary}</p>}
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                  >
                    {t('assessment.detail.eventsSource')} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default AppEventsList;
