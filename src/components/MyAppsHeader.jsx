import React from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import InlineSpinner from './ui/InlineSpinner';
import { t } from '../i18n/index.js';

const ICON_BUTTON = 'p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors';

/** En-tête de l'onglet « Mes Apps » : titre, nombre d'apps suivies, re-scan et partage. */
const MyAppsHeader = ({ count, isLoading, onRescan, onShare }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-900 leading-tight">{t('myApps.header.title')}</h2>
          {isLoading && <InlineSpinner />}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {count > 0
            ? t('myApps.header.tracked', { count })
            : t('myApps.header.rescanHint')}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={onRescan}
          className={ICON_BUTTON}
          aria-label={t('myApps.header.refresh')}
          title={t('myApps.header.refreshTitle')}
        >
          <RefreshCw size={16} />
        </button>
        {count > 0 && (
          <button
            onClick={onShare}
            className={ICON_BUTTON}
            aria-label={t('myApps.header.share')}
            title={t('myApps.header.shareTitle')}
          >
            <Share2 size={16} />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default MyAppsHeader;
