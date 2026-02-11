import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Barre de recherche
 */
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
      <input 
        type="text" 
        placeholder="Rechercher une app..." 
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
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
