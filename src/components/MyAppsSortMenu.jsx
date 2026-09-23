import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { SORT_OPTIONS } from '../utils/myAppsSort';

// Réglage discret de tri pour l'onglet "Mes Apps" : une simple icône parmi
// les autres actions de l'en-tête, qui ouvre un petit menu au tap. Le choix
// est mémorisé par le parent (voir App.jsx) et persisté en local.
const MyAppsSortMenu = ({ sortBy, direction, onChange }) => {
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

  const handleSelect = (option) => {
    if (option.id === sortBy) {
      // Même critère : un second tap inverse simplement le sens.
      onChange({ sortBy, direction: direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onChange({ sortBy: option.id, direction: option.defaultDirection });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        aria-label="Trier mes applications"
        aria-expanded={isOpen}
        title="Trier mes applications"
      >
        <ArrowUpDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.id === sortBy;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] font-semibold text-left transition-colors ${
                  isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isActive ? <Check size={13} /> : <span className="w-[13px]" />}
                  {option.label}
                </span>
                {isActive && (direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppsSortMenu;
