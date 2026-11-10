import React from 'react';

/** Les filtres de « Mes Apps » étant repliés, rappelle discrètement ce qui est masqué. */
const MyAppsFilterNotice = ({ shown, total, migrationFilter, alternativeFilter, onShowAll }) => (
  <p className="text-[11px] text-slate-400 -mt-1 mb-3 px-1">
    {shown} sur {total} apps
    {migrationFilter === 'todo' && ' · à migrer'}
    {migrationFilter === 'migrated' && ' · migrées'}
    {alternativeFilter === 'with' && ' · avec alternative'}
    {alternativeFilter === 'without' && ' · sans alternative'}
    {' · '}
    <button
      type="button"
      onClick={onShowAll}
      className="font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
    >
      Tout afficher
    </button>
  </p>
);

export default MyAppsFilterNotice;
