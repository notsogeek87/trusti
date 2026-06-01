import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, PlusCircle, ShieldCheck, ArrowRight, Calendar, Shield, ExternalLink } from 'lucide-react';
import ScoreIndicator from '../ui/ScoreIndicator';
import { GRADE_INFO } from '../../constants/grades';
import { useIsMobile } from '../../contexts/ViewModeContext';

const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

const ANIM_STYLES = `
  @keyframes detailSlideUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes detailSlideDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(40px); }
  }
  @keyframes detailFadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes detailFadeOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(0.97); }
  }
  @keyframes sectionFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const sectionAnim = (delay = 0) => ({
  animation: `sectionFadeUp 0.3s ease-out ${delay}ms both`,
});

/**
 * Modal des détails d'une application
 */
const AppDetailModal = ({ app, isInMyApps, onToggleMyApp, onClose, onSelectApp, allApps = [] }) => {
  const [isExiting, setIsExiting] = useState(false);
  // State pour stocker les apps chargées dynamiquement
  const [loadedApps, setLoadedApps] = useState([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);

  // Fusionner allApps avec les apps chargées dynamiquement
  const availableApps = [...allApps, ...loadedApps];

  // Charger les apps manquantes pour les relations
  useEffect(() => {
    const loadMissingApps = async () => {
      if (!app.alternativeAppIds && !app.replacesAppIds) return;

      // Collecter tous les IDs des relations
      const allRelationIds = [
        ...(app.alternativeAppIds || []),
        ...(app.replacesAppIds || [])
      ];

      if (allRelationIds.length === 0) return;

      // Identifier les IDs qui ne sont pas dans allApps
      const existingIds = new Set(allApps.map(a => String(a.id)));
      const missingIds = allRelationIds
        .map(id => String(id))
        .filter(id => !existingIds.has(id));

      if (missingIds.length === 0) return;

      // Charger les apps manquantes
      setIsLoadingRelations(true);
      try {
        const response = await fetch(`${API_URL}/apps?ids=${missingIds.join(',')}`);
        const data = await response.json();
        
        if (data.success && data.apps) {
          setLoadedApps(data.apps);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des apps liées:', error);
      } finally {
        setIsLoadingRelations(false);
      }
    };

    loadMissingApps();
  }, [app.id, app.alternativeAppIds, app.replacesAppIds, allApps]);

  // Utiliser directement les relations calculées par le serveur
  // alternativeAppIds = apps avec meilleur score dans la même catégorie
  const alternatives = availableApps.filter(altApp => 
    app.alternativeAppIds && app.alternativeAppIds.includes(String(altApp.id))
  );
  
  // replacesAppIds = apps avec pire score dans la même catégorie
  const replacedApps = availableApps.filter(replacedApp => 
    app.replacesAppIds && app.replacesAppIds.includes(String(replacedApp.id))
  );

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

  const isMobile = useIsMobile();

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 240);
  };

  // Bloc réutilisable pour une app liée (alternative ou remplacée)
  const RelatedAppRow = ({ app: relatedApp }) => (
    <div
      onClick={(e) => handleAlternativeClick(e, relatedApp)}
      className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
        {relatedApp.icon && relatedApp.icon.startsWith('http') ? (
          <img src={relatedApp.icon} alt={relatedApp.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className={`${relatedApp.color || 'bg-slate-500'} w-full h-full flex items-center justify-center text-lg text-white`}>
            {relatedApp.icon}
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-black text-sm text-slate-900">{relatedApp.name}</h4>
        <p className="text-[11px] text-slate-500 line-clamp-1">{relatedApp.reason}</p>
      </div>
      <div className="shrink-0"><ScoreIndicator grade={relatedApp.grade} /></div>
    </div>
  );

  const SkeletonRow = () => (
    <div className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-grow space-y-2">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2 bg-slate-100 rounded w-full" />
      </div>
      <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
    </div>
  );

  const pageAnim = isExiting
    ? (isMobile ? 'detailSlideDown 0.24s ease-in forwards' : 'detailFadeOut 0.2s ease-in forwards')
    : (isMobile ? 'detailSlideUp 0.32s cubic-bezier(0.22, 1, 0.36, 1)' : 'detailFadeIn 0.22s ease-out');

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 md:pb-0"
      style={{ animation: pageAnim }}
    >
      <style>{ANIM_STYLES}</style>

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={handleClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 transition-colors active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Détails</div>
          <button
            onClick={(e) => onToggleMyApp(e, app.id)}
            className={`p-2 rounded-full transition-colors ${isInMyApps ? 'text-indigo-600 bg-indigo-50' : 'text-slate-200 hover:text-indigo-400'}`}
          >
            {isInMyApps ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
          </button>
        </div>
      </header>

      {/* ── Contenu 2 colonnes sur desktop ── */}
      <main className={isMobile ? 'p-4' : 'max-w-5xl mx-auto p-6 flex gap-6 items-start'}>

        {/* ── Colonne gauche : identité ── */}
        <div className={isMobile ? '' : 'w-72 shrink-0 sticky top-[69px]'} style={sectionAnim(60)}>

          {/* Carte hero */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center mb-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-4 overflow-hidden">
              {app.icon && app.icon.startsWith('http') ? (
                <img src={app.icon} alt={app.name} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className={`${app.color} w-full h-full flex items-center justify-center text-4xl text-white`}>
                  {app.icon}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{app.name}</h2>
            {app.category && (
              <p className="text-sm font-semibold text-slate-400 mb-3">{app.category}</p>
            )}
            <ScoreIndicator grade={app.grade} size="large" />
          </div>

          {/* Télécharger */}
          {(app.playStoreUrl || app.appleStoreUrl || app.fDroidUrl || app.websiteUrl) && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200 mb-4">
              <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
                <ExternalLink size={16} className="text-emerald-600" /> Télécharger
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {app.playStoreUrl && (
                  <a href={app.playStoreUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-emerald-200 hover:border-emerald-400 shadow-sm">
                    <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.5MxY8CYsuOK6daH6aocNLAHaIe%3Fpid%3DApi&f=1&ipt=423621f87e3335ef5aa176e8f68343d5e008b4674699573ed4712e0d066a903b&ipo=images" alt="Play Store" className="w-5 h-5" />
                    Play Store
                  </a>
                )}
                {app.appleStoreUrl && (
                  <a href={app.appleStoreUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-slate-200 hover:border-slate-400 shadow-sm">
                    <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.jhRunii665tZxgBO17E0OwHaHa%3Fpid%3DApi&f=1&ipt=b405abc4f0e4ab24a5fd3be09175722438e0f888eb681770c42d8f1462036efb&ipo=images" alt="App Store" className="w-5 h-5" />
                    App Store
                  </a>
                )}
                {app.fDroidUrl && (
                  <a href={app.fDroidUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-blue-200 hover:border-blue-400 shadow-sm">
                    <img src="https://f-droid.org/assets/favicon.ico" alt="F-Droid" className="w-5 h-5" />
                    F-Droid
                  </a>
                )}
                {app.websiteUrl && (
                  <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-purple-100 text-purple-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border-2 border-purple-200 hover:border-purple-400 shadow-sm">
                    <span className="text-lg">🌐</span>
                    Site Web
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Bouton retour (desktop) */}
          {!isMobile && (
            <button onClick={handleClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-colors active:scale-[0.98]">
              ← Retour
            </button>
          )}
        </div>

        {/* ── Colonne droite : analyse & relations ── */}
        <div className={isMobile ? '' : 'flex-1 min-w-0'} style={sectionAnim(isMobile ? 100 : 120)}>

          {/* Pourquoi cette note ? */}
          {(() => {
            const info = GRADE_INFO.find(g => g.grade === app.grade);
            return (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
                <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" /> Pourquoi cette note ?
                </h3>
                {info && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <p className={`text-xs font-black uppercase tracking-wider mb-1 ${
                      app.grade === 'C' || app.grade === 'D' ? 'text-slate-800' : 'text-indigo-700'
                    }`}>{info.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{info.description}</p>
                  </div>
                )}
                <p className="text-sm text-slate-600 leading-relaxed">{app.reason}</p>
                {app.updatedAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>Analyse mise à jour le {formatDate(app.updatedAt)}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Alternatives */}
          {((isLoadingRelations && app.alternativeAppIds?.length > 0) || alternatives.length > 0) && (
            <div className="mb-4 relative">
              {!isLoadingRelations && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg animate-bounce">
                    {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
                      <ArrowRight size={16} className="text-indigo-600 animate-pulse" /> Alternatives
                    </h3>
                    {!isLoadingRelations && (
                      <div className="bg-emerald-100 text-emerald-700 text-[11px] font-black px-2 py-0.5 rounded-full">
                        Meilleures notes
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isLoadingRelations
                      ? [1, 2].map(i => <SkeletonRow key={i} />)
                      : alternatives.map(alt => <RelatedAppRow key={alt.id} app={alt} />)
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remplace */}
          {((isLoadingRelations && app.replacesAppIds?.length > 0) || replacedApps.length > 0) && (
            <div className="mb-4">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-orange-600" /> Remplace
                  </h3>
                  {!isLoadingRelations && (
                    <div className="bg-orange-100 text-orange-700 text-[11px] font-black px-2 py-0.5 rounded-full">
                      {replacedApps.length} app{replacedApps.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {isLoadingRelations
                    ? [1].map(i => <SkeletonRow key={i} />)
                    : replacedApps.map(r => <RelatedAppRow key={r.id} app={r} />)
                  }
                </div>
              </div>
            </div>
          )}

          {/* Permissions Android */}
          {app.permissions && app.permissions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
              <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-orange-600" /> Permissions demandées
              </h3>
              <div className={isMobile ? 'grid grid-cols-1 gap-1.5' : 'grid grid-cols-2 gap-1.5'}>
                {app.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span className="text-[11px]">{formatPermissionName(permission)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton retour (mobile uniquement) */}
          {isMobile && (
            <button onClick={handleClose}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
              Retour
            </button>
          )}
        </div>

      </main>
    </div>
  );
};

export default AppDetailModal;
