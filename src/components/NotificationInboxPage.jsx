import React, { useEffect, useRef } from 'react';
import {
  ChevronLeft, Bell, TrendingDown, TrendingUp, AlertTriangle, Sparkles, Info, Route, PartyPopper,
  Smartphone, CalendarDays, ExternalLink, ChevronRight, Settings, ShieldCheck, BellOff,
} from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { isDigestEmpty } from '../utils/notificationInbox';
import { formatDate, t } from '../i18n/index.js';

const formatDay = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : formatDate(date, { day: 'numeric', month: 'long' });
};

const TONES = {
  negative: 'bg-rose-50 text-rose-600',
  positive: 'bg-emerald-50 text-emerald-600',
  neutral: 'bg-indigo-50 text-indigo-600',
};

function iconFor(item) {
  switch (item.kind) {
    case 'grade': return item.impact === 'positive' ? TrendingUp : TrendingDown;
    case 'event': return item.impact === 'negative' ? AlertTriangle : item.impact === 'positive' ? Sparkles : Info;
    case 'migration': case 'migrationAltInstalled': return Route;
    case 'migrationDone': return PartyPopper;
    case 'install': return Smartphone;
    case 'digest': return CalendarDays;
    default: return Bell;
  }
}

/** Titre et texte d'un élément, dans la langue de l'interface (le natif rédige les siens). */
function describe(item) {
  const { data } = item;
  switch (item.kind) {
    case 'grade': {
      const up = item.impact === 'positive';
      return {
        title: t(up ? 'inbox.gradeUp' : 'inbox.gradeDown', { name: item.appName, from: data.previousGrade, to: data.grade }),
        text: t(up ? 'inbox.gradeUpBody' : 'inbox.gradeDownBody'),
      };
    }
    case 'event':
      return { label: `${t(`inbox.event.${data.type}`)} · ${item.appName}`, title: data.title, text: data.summary };
    case 'migration':
      return {
        title: data.altName
          ? t('inbox.migration', { name: item.appName, alt: data.altName })
          : t('inbox.migrationNoAlt', { name: item.appName }),
        text: t('inbox.migrationBody', { completed: data.completed, total: data.total }),
      };
    default:
      return { title: data.title, text: data.text };
  }
}

const DIGEST_KEYS = ['gradeDown', 'eventsNegative', 'risky', 'gradeUp', 'eventsPositive', 'migrationsDone'];

const DigestCard = ({ digest }) => (
  <section className="bg-white rounded-2xl border border-slate-100 p-4">
    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 mb-2">
      <CalendarDays size={14} /> {t('inbox.digestTitle')}
    </h2>
    <ul className="flex flex-wrap gap-1.5">
      {DIGEST_KEYS.filter(key => digest[key] > 0).map(key => (
        <li key={key} className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
          {t(`inbox.digest.${key}`, { count: digest[key] })}
        </li>
      ))}
    </ul>
  </section>
);

const InboxItem = ({ item, unread, onOpenApp }) => {
  const Icon = iconFor(item);
  const { label, title, text } = describe(item);
  const canOpen = Boolean(item.appId) && item.kind !== 'digest';
  const isMigration = item.kind === 'migration';

  return (
    <li className={`p-3 rounded-2xl border ${unread ? 'bg-indigo-50/40 border-indigo-100' : 'bg-white border-slate-100'}`}>
      <div className="flex items-start gap-3">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TONES[item.impact] || TONES.neutral}`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {unread && <span className="text-indigo-600">{t('inbox.unread')} ·</span>}
            {label && <span>{label} ·</span>}
            <span>{formatDay(item.date)}</span>
          </p>
          <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">{title}</p>
          {text && <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</p>}
          {item.kind === 'grade' && (
            <span className="flex items-center gap-1 mt-1.5" aria-hidden="true">
              <ScoreIndicator grade={item.data.previousGrade} />
              <ChevronRight size={12} className="text-slate-300" />
              <ScoreIndicator grade={item.data.grade} />
            </span>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {canOpen && (
              <button
                type="button"
                onClick={() => onOpenApp(item.appId, isMigration ? 'resumeMigration' : null)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                {isMigration ? t('inbox.resume') : t('inbox.seeApp')}
              </button>
            )}
            {item.kind === 'event' && item.data.sourceUrl && (
              <a
                href={item.data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700"
              >
                {t('inbox.source')} <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

/**
 * Boîte de réception (cloche du header) : événements, changements de note, migrations en
 * plan et, sur l'APK, ce que le téléphone a détecté (apps à risque installées, migrations
 * terminées, bilans). Tout est marqué comme lu en quittant la page.
 * Données : useNotificationCenter.
 */
const NotificationInboxPage = ({
  items, unreadKeys, digest, hasApps, onClose, onOpenApp, onOpenSettings, onMarkAllRead,
  notificationsBlocked = false, onOpenNotificationSettings,
}) => {
  // Quitter la page (retour, ouverture d'une fiche) vaut lecture : on garde la dernière
  // version de onMarkAllRead, qui connaît les éléments chargés entre-temps.
  const markAllReadRef = useRef(onMarkAllRead);
  markAllReadRef.current = onMarkAllRead;
  useEffect(() => () => markAllReadRef.current(), []);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 pb-16 md:pb-0">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label={t('inbox.back')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 transition-colors active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-indigo-600" />
          </div>
          <h1 className="text-base font-black text-slate-900 flex-1 min-w-0">{t('inbox.title')}</h1>
          {unreadKeys.size > 0 && (
            <button type="button" onClick={onMarkAllRead} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1">
              {t('inbox.markAllRead')}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        {/* Permission refusée (APK) : rien ne peut arriver sur le téléphone, on le dit */}
        {notificationsBlocked && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <BellOff size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-amber-800 leading-relaxed">{t('inbox.blocked')}</p>
              {onOpenNotificationSettings && (
                <button
                  type="button"
                  onClick={onOpenNotificationSettings}
                  className="mt-1.5 text-[11px] font-bold text-amber-800 underline"
                >
                  {t('inbox.openSettings')}
                </button>
              )}
            </div>
          </div>
        )}

        {!isDigestEmpty(digest) && <DigestCard digest={digest} />}

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-100 p-4">
            {hasApps ? t('inbox.empty') : t('inbox.emptyNoApps')}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <InboxItem key={item.key} item={item} unread={unreadKeys.has(item.key)} onOpenApp={onOpenApp} />
            ))}
          </ul>
        )}

        <div className="flex flex-col items-center gap-2 pt-2">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Settings size={14} /> {t('inbox.settings')}
            </button>
          )}
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck size={12} className="shrink-0" /> {t('inbox.privacy')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default NotificationInboxPage;
