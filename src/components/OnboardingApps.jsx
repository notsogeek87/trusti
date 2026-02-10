import React, { useState, useMemo } from 'react';
import { Check, ShieldCheck, Search } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import TrustiLogo from './ui/TrustiLogo';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      {/* En-tête fixe avec recherche */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 shadow-lg">
        <div className="max-w-md mx-auto px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <TrustiLogo className="w-7 h-7 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight">Configuration</h1>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-indigo-400">
                {selectedApps.size}
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-md mx-auto px-3 py-3">
        {/* Message d'invitation compact */}
        {!searchTerm && (
          <div className="mb-3 bg-indigo-500/10 rounded-lg p-2.5 border border-indigo-500/20">
            <p className="text-xs text-slate-300 text-center">
              💡 Sélectionnez vos apps du quotidien
            </p>
          </div>
        )}
        
        {/* Message si aucun résultat */}
        {searchTerm && filteredApps.length === 0 && (
          <div className="mb-3 bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-slate-400">Aucune app trouvée</p>
          </div>
        )}

        {/* Grille d'applications */}
        <div className="grid grid-cols-2 gap-2.5 mb-32">
          {filteredApps.map((app) => {
            const isSelected = selectedApps.has(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggleApp(app.id)}
                className={`
                  relative p-3 rounded-xl transition-all duration-200 active:scale-95
                  ${isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 scale-[1.02]' 
                    : 'bg-slate-800 active:bg-slate-750 border border-slate-700'
                  }
                `}
              >
                {/* Icône de sélection */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5">
                    <Check size={12} className="text-indigo-600" />
                  </div>
                )}

                {/* Logo de l'app */}
                <div className="mb-2 flex items-center justify-center">
                  {app.icon && app.icon.startsWith('http') ? (
                    <img 
                      src={app.icon} 
                      alt={app.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg ${app.color || 'bg-gradient-to-br from-slate-600 to-slate-700'} flex items-center justify-center text-white font-bold text-lg`}>
                      {app.icon || app.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Nom de l'app */}
                <div className={`text-xs font-semibold mb-1.5 truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent px-3 py-4 border-t border-slate-700/50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleComplete}
            disabled={selectedApps.size === 0}
            className={`
              w-full py-3.5 px-6 rounded-xl font-bold text-base
              transition-all duration-200 shadow-lg
              ${selectedApps.size > 0
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 active:from-indigo-600 active:to-purple-600 text-white shadow-indigo-500/30 active:scale-[0.98]'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {selectedApps.size === 0 
              ? 'Sélectionnez au moins une app' 
              : `Continuer (${selectedApps.size})`
            }
          </button>
          
          {/* Bouton skip */}
          <button
            onClick={() => onComplete(new Set())}
            className="w-full mt-2.5 py-2.5 text-xs text-slate-400 active:text-slate-300 transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingApps;
