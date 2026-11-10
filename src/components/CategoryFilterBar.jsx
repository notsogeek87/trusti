import React from 'react';
import { Star } from 'lucide-react';
import { CATEGORIES, FAVORITES_FILTER } from '../constants/categories';
import InlineSpinner from './ui/InlineSpinner';

const ALL_CATEGORIES = ['Toutes', FAVORITES_FILTER, ...CATEGORIES];

/** En-tête de l'onglet Applications : titre et sélecteur de catégorie (défilement horizontal). */
const CategoryFilterBar = ({ selectedCategory, onSelectCategory, favoritesCount, isLoading }) => (
  <div className="mb-3 text-center">
    <div className="flex items-center justify-center gap-2 mb-0.5">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        Apps populaires
      </p>
      {isLoading && <InlineSpinner />}
    </div>
    <div className="mt-2">
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 pb-1.5 px-0.5">
            {ALL_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`
                    flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all inline-flex items-center gap-1
                    ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                >
                  {category === FAVORITES_FILTER && (
                    <Star size={11} className={isSelected ? 'fill-current' : ''} />
                  )}
                  {category}
                  {category === FAVORITES_FILTER && favoritesCount > 0 && (
                    <span>({favoritesCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CategoryFilterBar;
