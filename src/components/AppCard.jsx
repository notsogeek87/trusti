import React from 'react';
import { PlusCircle, CheckCircle, CheckCircle2, Trash2, Sparkles } from 'lucide-react';
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
        <div className={`${app.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-inner transition-transform group-hover:scale-105`}>
          {app.icon}
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
      {activeTab === TABS.MY_APPS && app.grade !== "A" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between animate-pulse-subtle">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Sparkles size={14} className="text-emerald-600 shrink-0" />
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
                {customMigration ? (
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
    </div>
  );
};

export default AppCard;
