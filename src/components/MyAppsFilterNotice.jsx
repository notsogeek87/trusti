import React from 'react';
import { t } from '../i18n/index.js';

/** Les filtres de « Mes Apps » étant repliés, rappelle discrètement ce qui est masqué. */
const MyAppsFilterNotice = ({ shown, total, migrationFilter, alternativeFilter, onShowAll }) => (
  <p className="text-[11px] text-slate-400 -mt-1 mb-3 px-1">
    {t('myApps.filters.shownOf', { shown, total })}
    {migrationFilter === 'todo' && t('myApps.filters.noticeToMigrate')}
    {migrationFilter === 'migrated' && t('myApps.filters.noticeMigrated')}
    {alternativeFilter === 'with' && t('myApps.filters.noticeWithAlt')}
    {alternativeFilter === 'without' && t('myApps.filters.noticeWithoutAlt')}
    {' · '}
    <button
      type="button"
      onClick={onShowAll}
      className="font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
    >
      {t('myApps.filters.showAll')}
    </button>
  </p>
);

export default MyAppsFilterNotice;
