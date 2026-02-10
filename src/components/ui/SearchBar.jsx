import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Barre de recherche
 */
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
      <input 
        type="text" 
        placeholder="Rechercher une application..." 
        className="w-full pl-11 pr-11 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
