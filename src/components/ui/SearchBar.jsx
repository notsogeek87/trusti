import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

// Input non-contrôlé : React ne touche jamais la valeur dans le DOM,
// ce qui empêche le clavier mobile de se fermer lors des re-renders parent.
const SearchBar = ({ searchTerm, onSearchChange }) => {
  const inputRef = useRef(null);
  const [hasValue, setHasValue] = useState(!!searchTerm);
  const debounceRef = useRef(null);

  // Sync depuis le parent (ex: clear externe)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== searchTerm) {
      inputRef.current.value = searchTerm;
      setHasValue(!!searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleChange = (e) => {
    const value = e.target.value;
    setHasValue(!!value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(value), 300);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    setHasValue(false);
    clearTimeout(debounceRef.current);
    onSearchChange('');
  };

  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
      <input
        ref={inputRef}
        type="text"
        defaultValue={searchTerm}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Rechercher une app..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
        onChange={handleChange}
      />
      {hasValue && (
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
