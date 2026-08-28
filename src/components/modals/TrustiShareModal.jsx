import React from 'react';
import { X } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { shareText } from '../../utils/shareUtils';

/**
 * Modal de partage des TrustiApp
 */
const TrustiShareModal = ({ selectedApps, customMigrations = new Map(), allApps = [], onClose }) => {
  // Alternative choisie pour une app à risque : personnalisée si l'utilisateur
  // en a sélectionné une, sinon celle suggérée automatiquement.
  const getChosenAlternative = (app) => {
    const customAlt = customMigrations.get(app.id);
    const altName = customAlt || app.alternative;
    if (!altName) return null;
    const altApp = allApps.find(a => a.name === altName);
    return { name: altName, grade: altApp?.grade || app.altGrade };
  };

  const generateShareText = () => {
    const appsList = selectedApps.map(app => {
      const alt = app.grade !== 'A' ? getChosenAlternative(app) : null;
      return alt ? `${app.name} → ${alt.name}` : `${app.name} (Grade ${app.grade})`;
    }).join('\n• ');

    return `⭐ Mes TrustiApp:\n\n• ${appsList}`;
  };

  const handleShare = () => {
    shareText('Mes TrustiApp', generateShareText());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Mes TrustiApp</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {selectedApps.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest text-emerald-800 mb-4 flex items-center gap-2">
                <span className="text-lg">⭐</span> {selectedApps.length} app{selectedApps.length > 1 ? 's' : ''} sélectionnée{selectedApps.length > 1 ? 's' : ''}
              </h3>
              
              <div className="space-y-3">
                {selectedApps.map(app => {
                  const alt = app.grade !== 'A' ? getChosenAlternative(app) : null;
                  return (
                    <div key={app.id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
                          {app.icon && app.icon.startsWith('http') ? (
                            <img
                              src={app.icon}
                              alt={app.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`${app.color} w-full h-full flex items-center justify-center text-lg text-white`}>
                              {app.icon}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-black text-sm text-slate-900">{app.name}</p>
                          <p className="text-xs text-slate-500">{app.category}</p>
                        </div>
                        <ScoreIndicator grade={app.grade} />
                      </div>
                      {alt && (
                        <p className="text-xs text-emerald-700 font-semibold mt-2 pl-[52px]">
                          → {alt.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Boutons d'Action */}
              <div className="border-t border-slate-100 mt-6 pt-6 space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔗</span> Partager
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 font-medium">Aucune app sélectionnée</p>
              <p className="text-xs text-slate-400 mt-2">
                Cliquez sur le + pour ajouter des apps
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustiShareModal;
