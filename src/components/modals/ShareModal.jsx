import React from 'react';
import { X } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { shareText, shareToWhatsApp, copyToClipboard, buildShareUrl } from '../../utils/shareUtils';

/**
 * Modal de partage des migrations
 */
const ShareModal = ({ migratedApps, customMigrations, allApps = [], onClose }) => {
  // Utiliser uniquement les apps de la BDD
  const apps = allApps;
  
  const migratedList = Array.from(migratedApps).map(id => {
    const app = apps.find(a => a.id === id);
    const customAlt = customMigrations.get(id);
    const altApp = customAlt 
      ? apps.find(a => a.name === customAlt) 
      : (app?.alternative ? apps.find(a => a.name === app.alternative) : null);
    
    return { app, customAlt, altApp };
  }).filter(({ app }) => app);

  const shareUrl = buildShareUrl({
    migrations: migratedList.map(({ app, customAlt }) => ({
      id: app.id,
      // On ne transmet que l'alternative personnalisée ; sinon le destinataire
      // résout l'alternative par défaut depuis la base.
      customAlt: customAlt || undefined,
    })),
  });

  const generateShareText = () => {
    const migrations = migratedList.map(({ app, customAlt }) =>
      `${app?.name} → ${customAlt || app?.alternative}`
    ).join('\n• ');

    return `✅ Mes migrations TrustiScore:\n\n• ${migrations}`;
  };

  const handleShare = () => {
    shareText('Mes migrations TrustiScore', generateShareText(), shareUrl);
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(generateShareText(), shareUrl);
  };

  const handleCopy = () => {
    copyToClipboard(`${generateShareText()}\n\n${shareUrl}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Migrations effectuées</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {migratedList.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest text-emerald-800 mb-4 flex items-center gap-2">
                <span className="text-lg">✅</span> {migratedList.length} app{migratedList.length > 1 ? 's' : ''} migrée{migratedList.length > 1 ? 's' : ''}
              </h3>
              
              <div className="space-y-3">
                {migratedList.map(({ app, customAlt, altApp }) => (
                  <div key={app.id} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
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
                    
                    <div className="flex items-center justify-center mb-3">
                      <div className="h-px bg-emerald-200 flex-grow"></div>
                      <span className="text-emerald-600 text-xs font-black px-2">MIGRÉ VERS</span>
                      <div className="h-px bg-emerald-200 flex-grow"></div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
                        {altApp?.icon && altApp.icon.startsWith('http') ? (
                          <img 
                            src={altApp.icon} 
                            alt={customAlt || app.alternative} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`${altApp?.color || 'bg-emerald-500'} w-full h-full flex items-center justify-center text-lg text-white`}>
                            {altApp?.icon || app.altIcon}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-black text-sm text-slate-900">{customAlt || app.alternative}</p>
                        {altApp && <p className="text-xs text-emerald-600">{altApp.category}</p>}
                      </div>
                      {altApp && <ScoreIndicator grade={altApp.grade} />}
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
                  onClick={handleShareWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1fbd5a] text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon size={18} /> WhatsApp
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
              <p className="text-slate-500 font-medium">Aucune migration effectuée</p>
              <p className="text-xs text-slate-400 mt-2">
                Marquez les apps comme migrées pour les afficher ici
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
