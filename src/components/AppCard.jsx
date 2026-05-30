import React from 'react';
import { PlusCircle, CheckCircle, CheckCircle2, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { TABS } from '../constants/tabs';

/**
 * Carte d'application dans la liste
 * Mémoïsé pour éviter les re-rendus inutiles
 */
const AppCard = React.memo(({ 
  app, 
  activeTab,
  isInMyApps,
  isMigrated,
  customMigration,
  onToggleMyApp,
  onToggleMigrate,
  onSelectApp,
  onSelectMigration,
  isLoadingMyApps = false
}) => {
  // Détecter si c'est un skeleton de chargement
  const isLoadingSkeleton = app.isLoadingSkeleton === true;
  
  return (
    <div 
      onClick={() => !isLoadingSkeleton && onSelectApp(app)} 
      className={`bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 ${isLoadingSkeleton ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:border-indigo-100'} transition-all group`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${isLoadingSkeleton ? 'bg-slate-200 animate-pulse' : 'bg-slate-100'}`}>
          {!isLoadingSkeleton && app.icon && app.icon.startsWith('http') ? (
            <img 
              src={app.icon} 
              alt={app.name} 
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`${isLoadingSkeleton ? 'text-slate-400' : app.color} w-full h-full flex items-center justify-center text-xl text-white`}>
              {app.icon}
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className={`font-black text-sm truncate ${isLoadingSkeleton ? 'text-slate-400' : ''}`}>{app.name}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isLoadingSkeleton ? 'Chargement...' : app.category}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ScoreIndicator grade={app.grade} />
          
          {activeTab === TABS.MY_APPS ? (
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 items-center">
              <button 
                onClick={(e) => !isLoadingSkeleton && onToggleMigrate(e, app.id)}
                disabled={isLoadingSkeleton}
                className={`p-1.5 rounded-lg transition-all ${
                  isLoadingSkeleton 
                    ? 'text-slate-200 cursor-not-allowed' 
                    : isMigrated 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-emerald-500'
                }`}
                title="Marquer comme migré"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={(e) => !isLoadingSkeleton && onToggleMyApp(e, app.id)}
                disabled={isLoadingSkeleton}
                className={`p-1.5 transition-all ${
                  isLoadingSkeleton 
                    ? 'text-slate-200 cursor-not-allowed'
                    : 'text-slate-300 hover:text-rose-500'
                }`}
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => !isLoadingSkeleton && onToggleMyApp(e, app.id)}
              disabled={isLoadingSkeleton}
              className={`p-2 rounded-full transition-all ${
                isLoadingSkeleton
                  ? 'text-slate-200 cursor-not-allowed'
                  : isInMyApps 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-slate-200 hover:text-indigo-400'
              }`}
            >
              {isInMyApps ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Section migration pour "Mes Apps" */}
      {activeTab === TABS.MY_APPS && isLoadingSkeleton && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-slate-600">
              Recherche d'alternatives...
            </p>
            <p className="text-[11px] text-slate-500">
              Analyse des meilleures options disponibles
            </p>
          </div>
        </div>
      )}
      
      {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade === "A" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
          <div className="text-2xl">✅</div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-emerald-700">
              TrustiScore au max, tout va bien !
            </p>
            <p className="text-[11px] text-emerald-600">
              Cette application respecte votre souveraineté numérique
            </p>
          </div>
        </div>
      )}
      
      {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade !== "A" && !app.alternative && !customMigration && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
          {app.isLoadingAlternative ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-600">
                  Recherche d'alternatives...
                </p>
                <p className="text-[11px] text-slate-500">
                  Analyse des meilleures options disponibles
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-xl">🔍</div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-600">
                  Alternative inconnue pour le moment
                </p>
                <p className="text-[11px] text-slate-500">
                  Nous travaillons à identifier les meilleures alternatives
                </p>
              </div>
            </>
          )}
        </div>
      )}
      
      {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade !== "A" && (app.alternative || customMigration) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between animate-pulse-subtle">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            {app.altIcon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-white border border-emerald-200">
                {app.altIcon.startsWith('http') ? (
                  <img src={app.altIcon} alt="Alternative" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{app.altIcon}</span>
                )}
              </div>
            )}
            {!app.altIcon && <Sparkles size={14} className="text-emerald-600 shrink-0" />}
            <div className="flex-grow">
              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">
                Migrer vers :
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMigration(app.id);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline mt-1"
              >
                {app.alternative ? (
                  <span>
                    {app.alternative}
                    <span className="text-[10px] ml-1 opacity-70">⭐ Recommandé</span>
                  </span>
                ) : customMigration ? (
                  <span>
                    {customMigration} 
                    <span className="text-[10px] ml-1 opacity-70">(cliquez pour changer)</span>
                  </span>
                ) : (
                  <span>Sélectionner une alternative ▼</span>
                )}
              </button>
            </div>
          </div>
          <div className="shrink-0 ml-2">
            <ScoreIndicator grade={app.altGrade || 'A'} />
          </div>
        </div>
      )}
    </div>
  );
});

AppCard.displayName = 'AppCard';

export default AppCard;
