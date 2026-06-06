import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [localValue, setLocalValue] = useState(searchTerm);
  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;

  // Sync depuis le parent uniquement si la valeur diffère vraiment
  // (ex: clear externe) — évite le re-render inutile qui ferme le clavier
  useEffect(() => {
    if (searchTerm !== localValueRef.current) {
      setLocalValue(searchTerm);
    }
  }, [searchTerm]);

  // Debounce : propager au parent après 300ms d'inactivité
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchTerm) {
        onSearchChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  const handleClear = () => {
    setLocalValue('');
    onSearchChange('');
  };

  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Rechercher une app..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
