import React from 'react';
import { X } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { APPS_DATA } from '../../constants/appsData';

/**
 * Modal de sélection d'une alternative de migration
 */
const MigrationSelectorModal = ({ 
  currentAppId, 
  currentSelection,
  onSelect, 
  onClose,
  allApps = [] // Apps à jour (trustiApps uniquement)
}) => {
  // Utiliser uniquement les TrustiApps (apps recommandées par siksik.org)
  const availableApps = allApps.length > 0 ? allApps : APPS_DATA.filter(a => a.id >= 1000);
  
  const currentApp = [...APPS_DATA, ...allApps].find(a => a.id === currentAppId);
  const alternativesA = availableApps.filter(a => a.grade === "A");
  const alternativesB = availableApps.filter(a => a.grade === "B");
  const allAlternatives = [...alternativesA, ...alternativesB];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Choisir une alternative</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">
              Sélectionnez une alternative pour remplacer{' '}
              <span className="font-black text-slate-900">{currentApp?.name}</span>
            </p>
            
            <div className="space-y-2">
              {allAlternatives.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => {
                    onSelect(alt.name);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    currentSelection === alt.name
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
                  }`}
                >
                  {/* Icône ou image */}
                  {alt.icon && alt.icon.startsWith('http') ? (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white border border-slate-200">
                      <img 
                        src={alt.icon} 
                        alt={alt.name}
                        className="w-8 h-8 rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-8 h-8 items-center justify-center text-lg">
                        📱
                      </div>
                    </div>
                  ) : (
                    <div className={`${alt.color || 'bg-slate-500'} w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white shrink-0`}>
                      {alt.icon || '📱'}
                    </div>
                  )}
                  
                  <div className="flex-grow text-left min-w-0">
                    <p className="font-black text-sm text-slate-900">{alt.name}</p>
                    <p className="text-xs text-slate-500">{alt.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ScoreIndicator grade={alt.grade} />
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationSelectorModal;
