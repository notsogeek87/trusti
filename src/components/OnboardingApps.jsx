import React, { useState, useMemo } from 'react';
import { Check, ShieldCheck, Search } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';

/**
 * Page d'onboarding pour sélectionner les applications utilisées
 */
const OnboardingApps = ({ allApps, onComplete }) => {
  const [selectedApps, setSelectedApps] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les applications selon la recherche
  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return allApps;
    const search = searchTerm.toLowerCase();
    return allApps.filter(app => 
      app.name.toLowerCase().includes(search) ||
      app.category?.toLowerCase().includes(search)
    );
  }, [allApps, searchTerm]);

  // Toggle une app
  const toggleApp = (appId) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  // Valider la sélection
  const handleComplete = () => {
    onComplete(selectedApps);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      {/* En-tête fixe avec recherche */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src="/assets/logo.png" 
                alt="TrustiScore" 
                className="w-8 flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight text-slate-900">Configuration</h1>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                <span className="text-xs font-bold">{selectedApps.size}</span>
              </div>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une app..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Message d'invitation compact */}
        {!searchTerm && (
          <div className="mb-4 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p className="text-xs text-indigo-700 text-center font-semibold">
              💡 Sélectionnez les apps que vous utilisez
            </p>
          </div>
        )}
        
        {/* Message si aucun résultat */}
        {searchTerm && filteredApps.length === 0 && (
          <div className="mb-4 bg-white rounded-xl p-6 text-center border border-slate-100">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-slate-500">Aucune app trouvée</p>
          </div>
        )}

        {/* Grille d'applications */}
        <div className="grid grid-cols-2 gap-3 mb-32">
          {filteredApps.map((app) => {
            const isSelected = selectedApps.has(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggleApp(app.id)}
                className={`
                  relative p-3.5 rounded-2xl transition-all duration-200 active:scale-95
                  ${isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg border-2 border-indigo-400' 
                    : 'bg-white hover:shadow-md border border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                {/* Icône de sélection */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Check size={14} className="text-indigo-600" strokeWidth={3} />
                  </div>
                )}

                {/* Logo de l'app */}
                <div className="mb-2.5 flex items-center justify-center">
                  {app.icon && app.icon.startsWith('http') ? (
                    <img 
                      src={app.icon} 
                      alt={app.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl ${app.color || 'bg-slate-400'} flex items-center justify-center text-white font-bold text-xl`}>
                      {app.icon || app.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Nom de l'app */}
                <div className={`text-xs font-black mb-2 truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {app.name}
                </div>

                {/* Score */}
                <div className="flex justify-center">
                  <ScoreIndicator grade={app.grade} size="small" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bouton flottant de validation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleComplete}
            disabled={selectedApps.size === 0}
            className={`
              w-full py-4 px-6 rounded-2xl font-bold text-base
              transition-all duration-200
              ${selectedApps.size > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {selectedApps.size === 0 
              ? 'Sélectionnez au moins une app' 
              : `Continuer avec ${selectedApps.size} app${selectedApps.size > 1 ? 's' : ''}`
            }
          </button>
          
          {/* Bouton skip */}
          <button
            onClick={() => onComplete(new Set())}
            className="w-full mt-3 py-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingApps;
