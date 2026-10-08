import React, { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { SORT_OPTIONS } from '../utils/myAppsSort';

// Réglages de la liste "Mes Apps" regroupés derrière une seule icône, à côté
// de la recherche : tri + filtres migration / alternative. Remplace l'icône de
// tri de l'en-tête et les deux listes déroulantes qui chargeaient l'écran.
// Une pastille signale un réglage différent de celui par défaut.
export const DEFAULT_MIGRATION_FILTER = 'all';
export const DEFAULT_ALTERNATIVE_FILTER = 'all';

// Le tri "Taille" n'a de sens que sur l'écran Espace de stockage.
const LIST_SORT_OPTIONS = SORT_OPTIONS.filter(option => option.id !== 'size');

const Segmented = ({ options, value, onChange }) => (
  <div className="flex bg-slate-100 rounded-xl p-0.5">
    {options.map(option => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`flex-1 px-1.5 py-1.5 rounded-[10px] text-[11px] font-bold transition-colors ${
          value === option.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const MyAppsFilterMenu = ({
  sort,
  onSortChange,
  migrationFilter,
  onMigrationFilterChange,
  alternativeFilter,
  onAlternativeFilterChange,
  migrationCounts,
  alternativeCounts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSort = (option) => {
    if (option.id === sort.sortBy) {
      // Même critère : un second tap inverse simplement le sens.
      onSortChange({ sortBy: sort.sortBy, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ sortBy: option.id, direction: option.defaultDirection });
    }
  };

  const isCustomized =
    migrationFilter !== DEFAULT_MIGRATION_FILTER || alternativeFilter !== DEFAULT_ALTERNATIVE_FILTER;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative h-[46px] w-[46px] flex items-center justify-center rounded-2xl border shadow-sm transition-colors ${
          isOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700'
        }`}
        aria-label="Trier et filtrer"
        aria-expanded={isOpen}
        title="Trier et filtrer"
      >
        <SlidersHorizontal size={17} />
        {isCustomized && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-lg border border-slate-100 p-3 z-20 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Afficher</p>
            <div className="space-y-1.5">
              <Segmented
                value={migrationFilter}
                onChange={onMigrationFilterChange}
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'todo', label: `À migrer (${migrationCounts.todo})` },
                  { value: 'migrated', label: `Migrées (${migrationCounts.migrated})` },
                ]}
              />
              <Segmented
                value={alternativeFilter}
                onChange={onAlternativeFilterChange}
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'with', label: `Avec alt. (${alternativeCounts.with})` },
                  { value: 'without', label: `Sans alt. (${alternativeCounts.without})` },
                ]}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Trier par</p>
            <div className="flex flex-wrap gap-1.5">
              {LIST_SORT_OPTIONS.map(option => {
                const isActive = option.id === sort.sortBy;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSort(option)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                    {isActive && (sort.direction === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                  </button>
                );
              })}
            </div>
          </div>

          {isCustomized && (
            <button
              type="button"
              onClick={() => {
                onMigrationFilterChange(DEFAULT_MIGRATION_FILTER);
                onAlternativeFilterChange(DEFAULT_ALTERNATIVE_FILTER);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppsFilterMenu;
