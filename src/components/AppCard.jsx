import React from 'react';
import { PlusCircle, CheckCircle, CheckCircle2, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { TABS } from '../constants/tabs';

/**
 * Carte d'application dans la liste
 */
const AppCard = ({ 
  app, 
  activeTab,
  isInMyApps,
  isMigrated,
  customMigration,
  onToggleMyApp,
  onToggleMigrate,
  onSelectApp,
  onSelectMigration
}) => {
  return (
    <div 
      onClick={() => onSelectApp(app)} 
      className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-100">
          {app.icon && app.icon.startsWith('http') ? (
            <img 
              src={app.icon} 
              alt={app.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`${app.color} w-full h-full flex items-center justify-center text-xl text-white`}>
              {app.icon}
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-black text-sm truncate">{app.name}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {app.category}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ScoreIndicator grade={app.grade} />
          
          {activeTab === TABS.MY_APPS ? (
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 items-center">
              <button 
                onClick={(e) => onToggleMigrate(e, app.id)} 
                className={`p-1.5 rounded-lg transition-all ${
                  isMigrated 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-emerald-500'
                }`}
                title="Marquer comme migré"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={(e) => onToggleMyApp(e, app.id)} 
                className="p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => onToggleMyApp(e, app.id)} 
              className={`p-2 rounded-full transition-all ${
                isInMyApps 
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
      {activeTab === TABS.MY_APPS && app.grade === "A" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
          <div className="text-2xl">✅</div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-emerald-700">
              TrustiScore au max, tout va bien !
            </p>
            <p className="text-[10px] text-emerald-600">
              Cette application respecte votre souveraineté numérique
            </p>
          </div>
        </div>
      )}
      
      {activeTab === TABS.MY_APPS && app.grade !== "A" && !app.alternative && !customMigration && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
          <div className="text-xl">🔍</div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-slate-600">
              Alternative inconnue pour le moment
            </p>
            <p className="text-[10px] text-slate-500">
              Nous travaillons à identifier les meilleures alternatives
            </p>
          </div>
        </div>
      )}
      
      {activeTab === TABS.MY_APPS && app.grade !== "A" && (app.alternative || customMigration) && (
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
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">
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
                    <span className="text-[8px] ml-1 opacity-70">⭐ Recommandé</span>
                  </span>
                ) : customMigration ? (
                  <span>
                    {customMigration} 
                    <span className="text-[8px] ml-1 opacity-70">(cliquez pour changer)</span>
                  </span>
                ) : (
                  <span>Sélectionner une alternative ▼</span>
                )}
              </button>
            </div>
          </div>
          <div className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ml-2">
            Grade A/B
          </div>
        </div>
      )}
      
      {/* Liens de téléchargement pour les Alternatives */}
      {activeTab === TABS.ALTERNATIVES && (app.playStoreUrl || app.appleStoreUrl || app.fDroidUrl || app.websiteUrl) && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {app.playStoreUrl && (
            <a
              href={app.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-emerald-200"
            >
              <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.5MxY8CYsuOK6daH6aocNLAHaIe%3Fpid%3DApi&f=1&ipt=423621f87e3335ef5aa176e8f68343d5e008b4674699573ed4712e0d066a903b&ipo=images" alt="Play Store" className="w-4 h-4" />
              Play Store
            </a>
          )}
          {app.appleStoreUrl && (
            <a
              href={app.appleStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-slate-200"
            >
              <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.jhRunii665tZxgBO17E0OwHaHa%3Fpid%3DApi&f=1&ipt=b405abc4f0e4ab24a5fd3be09175722438e0f888eb681770c42d8f1462036efb&ipo=images" alt="App Store" className="w-4 h-4" />
              App Store
            </a>
          )}
          {app.fDroidUrl && (
            <a
              href={app.fDroidUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-blue-200"
            >
              <img src="https://f-droid.org/assets/favicon.ico" alt="F-Droid" className="w-4 h-4" />
              F-Droid
            </a>
          )}
          {app.websiteUrl && (
            <a
              href={app.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-purple-200"
            >
              <span className="text-base">🌐</span>
              Site Web
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default AppCard;
