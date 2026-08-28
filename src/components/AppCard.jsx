import React, { useState, useRef } from 'react';
import { PlusCircle, CheckCircle, Trash2, ShieldCheck, ChevronRight, ArrowUpRight, CornerDownRight } from 'lucide-react';
import ScoreIndicator from './ui/ScoreIndicator';
import { TABS } from '../constants/tabs';

const SWIPE_THRESHOLD = 72;
const SWIPE_MAX = 88;

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
  const isLoadingSkeleton = app.isLoadingSkeleton === true;

  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const didSwipe = useRef(false);

  const handleTouchStart = (e) => {
    if (activeTab !== TABS.MY_APPS || isLoadingSkeleton) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
      didSwipe.current = true;
      setSwiping(true);
      setSwipeX(Math.max(dx, -SWIPE_MAX));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -SWIPE_THRESHOLD) {
      onToggleMyApp({ stopPropagation: () => {} }, app.id);
    }
    setSwipeX(0);
    setSwiping(false);
    touchStartX.current = null;
  };

  const handleCardClick = () => {
    if (didSwipe.current) { didSwipe.current = false; return; }
    if (swipeX !== 0) { setSwipeX(0); return; }
    if (!isLoadingSkeleton) onSelectApp(app);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Zone rouge révélée au slide */}
      {activeTab === TABS.MY_APPS && !isLoadingSkeleton && swipeX < 0 && (
        <div
          className="absolute inset-y-0 right-0 bg-rose-500 flex flex-col items-center justify-center gap-1 px-5"
          aria-hidden="true"
        >
          <Trash2 size={18} className="text-white" />
          <span className="text-white text-[10px] font-bold">Retirer</span>
        </div>
      )}

      {/* Carte coulissante */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25,1,0.5,1)',
        }}
        className={`bg-white border border-slate-100 p-4 flex flex-col gap-2 rounded-2xl ${
          isLoadingSkeleton ? 'cursor-default' : 'cursor-pointer hover:shadow-md hover:border-indigo-100'
        } transition-shadow group`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 ${isLoadingSkeleton ? 'bg-slate-200 animate-pulse' : 'bg-slate-100'}`}>
            {!isLoadingSkeleton && app.icon && app.icon.startsWith('http') ? (
              <img src={app.icon} alt={app.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className={`${isLoadingSkeleton ? 'text-slate-400' : app.color} w-full h-full flex items-center justify-center text-xl text-white`}>
                {app.icon}
              </div>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <h3 className={`font-bold text-[15px] truncate ${isLoadingSkeleton ? 'text-slate-400' : 'text-slate-900'}`}>{app.name}</h3>
            <p className="text-xs font-medium text-slate-400">
              {isLoadingSkeleton ? 'Chargement...' : app.category}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ScoreIndicator grade={app.grade} />

            {activeTab !== TABS.MY_APPS && (
              <button
                onClick={(e) => { e.stopPropagation(); !isLoadingSkeleton && onToggleMyApp(e, app.id); }}
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

            {!isLoadingSkeleton && (
              <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
            )}
          </div>
        </div>

        {/* Skeleton loading */}
        {activeTab === TABS.MY_APPS && isLoadingSkeleton && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
            <div className="flex-grow">
              <p className="text-xs font-bold text-slate-600">Recherche d'alternatives...</p>
              <p className="text-[11px] text-slate-500">Analyse des meilleures options disponibles</p>
            </div>
          </div>
        )}

        {/* Grade A — tout va bien */}
        {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade === 'A' && (
          <div className="flex items-center gap-1.5 pl-0.5">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-semibold text-emerald-600">TrustiScore au max, tout va bien</p>
          </div>
        )}

        {/* Pas d'alternative connue */}
        {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade !== 'A' && !app.alternative && !customMigration && (
          <div className="flex items-center gap-1.5 pl-0.5">
            {app.isLoadingAlternative ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin shrink-0" />
                <p className="text-xs font-semibold text-slate-500">Recherche d'alternatives...</p>
              </>
            ) : (
              <>
                <CornerDownRight size={14} className="text-orange-400 shrink-0" />
                <p className="text-xs font-semibold text-orange-500">Aucune alternative connue</p>
              </>
            )}
          </div>
        )}

        {/* Alternative disponible */}
        {activeTab === TABS.MY_APPS && !isLoadingSkeleton && app.grade !== 'A' && (app.alternative || customMigration) && (
          <div className="space-y-1">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectMigration(app.id); }}
              className="w-full flex items-center gap-1.5 pl-0.5 text-left"
            >
              <CornerDownRight size={14} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-600 hover:underline truncate">
                {app.alternative || customMigration}
              </span>
              {app.alternativeAdopted && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500 shrink-0">
                  <CheckCircle size={11} /> Dans vos apps
                </span>
              )}
            </button>

            {/* Une alternative encore mieux notée existe, mais n'est pas (encore) utilisée */}
            {app.betterAlternative && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelectMigration(app.id); }}
                className="w-full flex items-center gap-1.5 pl-0.5 text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ArrowUpRight size={12} className="shrink-0" />
                <span className="flex-grow text-left truncate">
                  Encore mieux noté : <span className="font-black">{app.betterAlternative.name}</span> (grade {app.betterAlternative.grade})
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AppCard.displayName = 'AppCard';

export default AppCard;
