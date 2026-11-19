import React from 'react';
import { BellRing } from 'lucide-react';
import { t } from '../i18n/index.js';

/**
 * Carte « Activer les notifications » en tête de « Mes Apps » (APK, Android 13+) : explique
 * avant d'afficher la fenêtre Android, qui ne peut être montrée que deux fois.
 * Voir useNotificationPermission.
 */
const NotificationPermissionCard = ({ onAccept, onLater }) => (
  <section className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 mb-4" aria-label={t('cards.notifPrompt.title')}>
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <BellRing size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-black text-slate-900">{t('cards.notifPrompt.title')}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{t('cards.notifPrompt.body')}</p>
        <p className="text-[11px] text-slate-400 mt-1">{t('cards.notifPrompt.privacy')}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-3">
      <button
        type="button"
        onClick={onLater}
        className="py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        {t('cards.notifPrompt.later')}
      </button>
      <button
        type="button"
        onClick={onAccept}
        className="py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
      >
        {t('cards.notifPrompt.enable')}
      </button>
    </div>
  </section>
);

export default NotificationPermissionCard;
