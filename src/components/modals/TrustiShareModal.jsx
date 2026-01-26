import React from 'react';
import { X } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { shareText, copyToClipboard } from '../../utils/shareUtils';

/**
 * Modal de partage des TrustiApp
 */
const TrustiShareModal = ({ selectedApps, onClose }) => {
  const generateShareText = () => {
    const appsList = selectedApps.map(a => `${a.name} (Grade ${a.grade})`).join('\n• ');
    return `⭐ Mes TrustiApp:\n\n• ${appsList}`;
  };

  const handleShare = () => {
    shareText('Mes TrustiApp', generateShareText());
  };

  const handleCopy = () => {
    copyToClipboard(generateShareText());
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
                {selectedApps.map(app => (
                  <div key={app.id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className={`${app.color} w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white`}>
                        {app.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm text-slate-900">{app.name}</p>
                        <p className="text-xs text-slate-500">{app.category}</p>
                      </div>
                      <ScoreIndicator grade={app.grade} />
                    </div>
                  </div>
                ))}
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
                  onClick={handleCopy}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>📋</span> Copier
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
