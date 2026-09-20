import React, { useState } from 'react';
import { Search, Boxes, Eye, Package, Download, Info, AlertTriangle } from 'lucide-react';
import DependencyLevelBadge from './DependencyLevelBadge';
import DetectionEntryList from './DetectionEntryList';
import TechnicalPermissionsCard from './TechnicalPermissionsCard';
import AppInfoCard from './AppInfoCard';
import AboutTechnicalAnalysisModal from '../modals/AboutTechnicalAnalysisModal';
import { exportTechnicalAnalysisJSON } from '../../technical';
import { downloadJSON } from '../../utils/downloadJSON';

/**
 * Section "🔎 Analyse technique" — totalement découplée du Trusti-Score
 * communautaire/éditorial affiché plus haut dans AppDetailModal. N'apparaît
 * que dans l'app Android native, quand l'application analysée est installée
 * sur l'appareil (voir useTechnicalAnalysis).
 */
const TechnicalAnalysisSection = ({ status, analysis, error }) => {
  const [showAbout, setShowAbout] = useState(false);

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
    );
  }

  if (status !== 'ready' || !analysis) {
    return null;
  }

  const handleExport = () => {
    downloadJSON(exportTechnicalAnalysisJSON(analysis), `${analysis.packageName}-analyse-technique.json`);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-sm uppercase tracking-tight text-slate-800 flex items-center gap-2">
          <Search size={18} className="text-indigo-600" /> Analyse technique
        </h2>
        <button
          onClick={() => setShowAbout(true)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
          title="À propos de l'analyse"
        >
          <Info size={16} />
        </button>
      </div>

      {!analysis.componentsAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Certaines informations de cette application n'ont pas pu être lues sur cet appareil.
            Les sections ci-dessous peuvent être incomplètes.
          </p>
        </div>
      )}

      <DependencyLevelBadge level={analysis.dependencyLevel} />

      <DetectionEntryList
        icon={Boxes}
        title="Google"
        countLabel={(n) => (n === 0 ? 'Aucune détectée' : `${n} dépendance${n > 1 ? 's' : ''} détectée${n > 1 ? 's' : ''}`)}
        entries={analysis.googleDependencies}
        emptyLabel="Aucune dépendance Google connue détectée."
        accentClassName="text-blue-600"
      />

      <DetectionEntryList
        icon={Eye}
        title="Trackers"
        countLabel={(n) => (n === 0 ? 'Aucun détecté' : `${n} détecté${n > 1 ? 's' : ''}`)}
        entries={analysis.trackers}
        emptyLabel="Aucun SDK de tracking connu détecté."
        accentClassName="text-rose-600"
      />

      <DetectionEntryList
        icon={Package}
        title="SDK"
        countLabel={(n) => (n === 0 ? 'Aucun détecté' : `${n} détecté${n > 1 ? 's' : ''}`)}
        entries={analysis.sdks}
        emptyLabel="Aucun SDK connu détecté."
        accentClassName="text-violet-600"
      />

      <TechnicalPermissionsCard permissions={analysis.permissions} />

      <AppInfoCard appInfo={analysis.appInfo} />

      {analysis.limitations?.length > 0 && (
        <div className="text-[11px] text-slate-400 leading-relaxed mb-4 px-1">
          {analysis.limitations.map((text) => (
            <p key={text} className="mb-1 last:mb-0">{text}</p>
          ))}
        </div>
      )}

      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-[0.98] mb-4"
      >
        <Download size={14} /> Exporter l'analyse (JSON)
      </button>

      {showAbout && <AboutTechnicalAnalysisModal onClose={() => setShowAbout(false)} />}
      {error && null /* erreur déjà traduite en `unavailable` par le hook : rien à afficher ici */}
    </div>
  );
};

export default TechnicalAnalysisSection;
