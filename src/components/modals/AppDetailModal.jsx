import React from 'react';
import { ChevronLeft, CheckCircle, PlusCircle, ShieldCheck, ArrowRight, Calendar, Shield, ExternalLink } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';

/**
 * Modal des détails d'une application
 */
const AppDetailModal = ({ app, isInMyApps, onToggleMyApp, onClose, onSelectApp, trustiApps = [], starApps = [] }) => {
  // Trouver les alternatives (TrustiApps qui remplacent cette app)
  const alternatives = trustiApps.filter(ta => {
    if (ta.replacesAppIds && Array.isArray(ta.replacesAppIds)) {
      return ta.replacesAppIds.includes(String(app.id));
    }
    return ta.replacesAppId === String(app.id);
  });
  
  // Trouver les Star Apps que cette Trusti App remplace
  const replacedApps = starApps.filter(sa => {
    if (app.replacesAppIds && Array.isArray(app.replacesAppIds)) {
      return app.replacesAppIds.includes(String(sa.id));
    }
    return false;
  });

  // Handler pour le clic sur une alternative
  const handleAlternativeClick = (e, alternative) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelectApp) {
      onSelectApp(alternative);
    }
  };

  // Formater la date de mise à jour
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return 'Non disponible';
    }
  };

  // Traduire/formater les noms de permissions
  const formatPermissionName = (permission) => {
    // Mapper les permissions Android communes vers du texte français
    const permissionMap = {
      'ACCESS_FINE_LOCATION': 'Localisation précise',
      'ACCESS_COARSE_LOCATION': 'Localisation approximative',
      'CAMERA': 'Appareil photo',
      'RECORD_AUDIO': 'Microphone',
      'READ_CONTACTS': 'Lecture des contacts',
      'WRITE_CONTACTS': 'Modification des contacts',
      'READ_CALENDAR': 'Lecture du calendrier',
      'WRITE_CALENDAR': 'Modification du calendrier',
      'READ_SMS': 'Lecture des SMS',
      'SEND_SMS': 'Envoi de SMS',
      'READ_PHONE_STATE': 'État du téléphone',
      'CALL_PHONE': 'Passer des appels',
      'READ_CALL_LOG': 'Historique des appels',
      'WRITE_CALL_LOG': 'Modification de l\'historique d\'appels',
      'READ_EXTERNAL_STORAGE': 'Lecture du stockage',
      'WRITE_EXTERNAL_STORAGE': 'Écriture sur le stockage',
      'INTERNET': 'Accès Internet',
      'ACCESS_NETWORK_STATE': 'État du réseau',
      'ACCESS_WIFI_STATE': 'État du Wi-Fi',
      'BLUETOOTH': 'Bluetooth',
      'VIBRATE': 'Vibration',
      'WAKE_LOCK': 'Empêcher la mise en veille',
      'GET_ACCOUNTS': 'Comptes sur l\'appareil',
      'USE_FINGERPRINT': 'Empreinte digitale',
      'BODY_SENSORS': 'Capteurs corporels'
    };
    
    return permissionMap[permission] || permission.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-16">
      <header className="px-4 py-4 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-50">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 text-slate-400"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
          Détails
        </div>
        <button 
          onClick={(e) => onToggleMyApp(e, app.id)} 
          className={`p-2 rounded-full ${
            isInMyApps 
              ? 'text-indigo-600 bg-indigo-50' 
              : 'text-slate-200'
          }`}
        >
          {isInMyApps ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
        </button>
      </header>

      <main className="max-w-md mx-auto p-4">
        <div className="flex flex-col items-center mb-6">
          {/* Logo de l'app */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 overflow-hidden">
            {app.icon && app.icon.startsWith('http') ? (
              <img 
                src={app.icon} 
                alt={app.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`${app.color} w-full h-full flex items-center justify-center text-3xl text-white`}>
                {app.icon}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{app.name}</h2>
          <ScoreIndicator grade={app.grade} size="large" />
          
          {/* Date de mise à jour du TrustiScore */}
          {app.updatedAt && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              <span>Mis à jour le {formatDate(app.updatedAt)}</span>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
          <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" /> Analyse
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{app.reason}</p>
        </div>

        {/* Liens de téléchargement */}
        {(app.playStoreUrl || app.appleStoreUrl || app.fDroidUrl || app.websiteUrl) && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200 mb-4">
            <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
              <ExternalLink size={16} className="text-emerald-600" /> Télécharger
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {app.playStoreUrl && (
                <a
                  href={app.playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-emerald-200 hover:border-emerald-400 shadow-sm"
                >
                  <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.5MxY8CYsuOK6daH6aocNLAHaIe%3Fpid%3DApi&f=1&ipt=423621f87e3335ef5aa176e8f68343d5e008b4674699573ed4712e0d066a903b&ipo=images" alt="Play Store" className="w-5 h-5" />
                  Play Store
                </a>
              )}
              {app.appleStoreUrl && (
                <a
                  href={app.appleStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-slate-200 hover:border-slate-400 shadow-sm"
                >
                  <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.jhRunii665tZxgBO17E0OwHaHa%3Fpid%3DApi&f=1&ipt=b405abc4f0e4ab24a5fd3be09175722438e0f888eb681770c42d8f1462036efb&ipo=images" alt="App Store" className="w-5 h-5" />
                  App Store
                </a>
              )}
              {app.fDroidUrl && (
                <a
                  href={app.fDroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-blue-200 hover:border-blue-400 shadow-sm"
                >
                  <img src="https://f-droid.org/assets/favicon.ico" alt="F-Droid" className="w-5 h-5" />
                  F-Droid
                </a>
              )}
              {app.websiteUrl && (
                <a
                  href={app.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-purple-100 text-purple-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-purple-200 hover:border-purple-400 shadow-sm"
                >
                  <span className="text-lg">🌐</span>
                  Site Web
                </a>
              )}
            </div>
          </div>
        )}

        {/* Permissions Android */}
        {app.permissions && app.permissions.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
            <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-orange-600" /> Permissions demandées
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {app.permissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600 bg-white rounded-lg px-2.5 py-1.5 border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span className="text-[11px]">{formatPermissionName(permission)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badge incitatif pour les alternatives */}
        {alternatives.length > 0 && (
          <div className="mb-4 relative">
            <div className="absolute -top-2 -right-2 z-10">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg animate-bounce">
                {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200 shadow-lg relative overflow-hidden">
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer pointer-events-none"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <ArrowRight size={16} className="text-indigo-600 animate-pulse" /> Alternatives
                  </h3>
                  <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    Meilleures notes
                  </div>
                </div>
                <div className="space-y-2">
                  {alternatives.map(alt => (
                    <div 
                      key={alt.id} 
                      onClick={(e) => handleAlternativeClick(e, alt)}
                      className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
                        {alt.icon && alt.icon.startsWith('http') ? (
                          <img 
                            src={alt.icon} 
                            alt={alt.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`${alt.color || 'bg-slate-500'} w-full h-full flex items-center justify-center text-lg text-white`}>
                            {alt.icon}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-black text-sm text-slate-900">{alt.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{alt.reason}</p>
                      </div>
                      <ScoreIndicator grade={alt.grade} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Section pour les apps remplacées (quand on affiche une Trusti App) */}
        {replacedApps.length > 0 && (
          <div className="mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-orange-600" /> Remplace
                </h3>
                <div className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {replacedApps.length} app{replacedApps.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="space-y-2">
                {replacedApps.map(replaced => (
                  <div 
                    key={replaced.id} 
                    onClick={(e) => handleAlternativeClick(e, replaced)}
                    className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
                      {replaced.icon && replaced.icon.startsWith('http') ? (
                        <img 
                          src={replaced.icon} 
                          alt={replaced.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`${replaced.color || 'bg-slate-500'} w-full h-full flex items-center justify-center text-lg text-white`}>
                          {replaced.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-sm text-slate-900">{replaced.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{replaced.reason}</p>
                    </div>
                    <ScoreIndicator grade={replaced.grade} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={onClose} 
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest"
        >
          Retour
        </button>
      </main>
    </div>
  );
};

export default AppDetailModal;
