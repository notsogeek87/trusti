import React, { useState } from 'react';
import { Search, Boxes, Eye, Package, Download, Info, AlertTriangle, HelpCircle } from 'lucide-react';
import Accordion from '../ui/Accordion';
import TechnicalSummary from './TechnicalSummary';
import KeyTakeaways from './KeyTakeaways';
import DependencyLevelBadge from './DependencyLevelBadge';
import CompositionCard from './CompositionCard';
import SecurityCard from './SecurityCard';
import DetectionEntryList from './DetectionEntryList';
import TechnicalPermissionsCard from './TechnicalPermissionsCard';
import AppInfoCard from './AppInfoCard';
import AboutTechnicalAnalysisModal from '../modals/AboutTechnicalAnalysisModal';
import { exportTechnicalAnalysisJSON } from '../../technical';
import { downloadJSON } from '../../utils/downloadJSON';
import { countSignalsByLevel } from './technicalSignals';
import { t } from '../../i18n/index.js';
import BoldText from '../ui/BoldText';

/**
 * Section "🔎 Analyse technique" — totalement découplée du Trusti-Score
 * communautaire/éditorial affiché plus haut dans AppDetailModal. Repliée par
 * défaut dans un accordéon (c'est un bloc volumineux, secondaire par rapport
 * au Trusti-Score) et accompagnée d'un texte d'explication pour un public non
 * technique. N'apparaît que dans l'app Android native, quand l'application
 * analysée est installée sur l'appareil (voir useTechnicalAnalysis).
 *
 * Ordre des sous-sections (voir spec §21) : vue synthétique → composition →
 * permissions → sécurité → trackers → SDK → Google → informations générales.
 * Réseau / authentification / monétisation / capacités / IA / open source /
 * écosystème arrivent en P2/P3 (voir docs/architecture/technical-analysis.md).
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
    downloadJSON(exportTechnicalAnalysisJSON(analysis), t('technical.ui.exportFile', { pkg: analysis.packageName })).catch(err => console.error('Export', err));
  };

  const { alert, watch } = countSignalsByLevel(analysis);
  const attentionCount = alert + watch;
  // Volontairement discret (gris) : section réservée aux curieux, on ne veut
  // pas alarmer l'utilisateur lambda avant même qu'il l'ouvre.
  const headerBadge = attentionCount > 0 ? (
    <span className="text-[10px] text-slate-400">
      {t('technical.ui.points', { count: attentionCount })}
    </span>
  ) : null;

  return (
    <Accordion
      icon={Search}
      title={t('technical.ui.sectionTitle')}
      subtitle={null}
      subtle
      badge={headerBadge}
    >
      {/* Ce qu'il faut retenir, en langage clair, avant même le détail. */}
      <KeyTakeaways analysis={analysis} />

      {/* Explicatif pour un public non technique : à quoi sert cette section,
          en quoi elle diffère du Trusti-Score, et ses limites. */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4 flex items-start gap-2">
        <HelpCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-indigo-900 leading-relaxed space-y-1.5">
          <p>
            <BoldText text={t('technical.ui.intro1')} />
          </p>
          <p>
            {t('technical.ui.intro2')}{' '}
            <button onClick={() => setShowAbout(true)} className="underline font-semibold">
              {t('technical.ui.aboutLink')}
            </button>.
          </p>
        </div>
      </div>

      {!analysis.componentsAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {t('technical.ui.partial')}
          </p>
        </div>
      )}

      {/* 📊 Vue synthétique */}
      <TechnicalSummary analysis={analysis} />
      <DependencyLevelBadge level={analysis.dependencyLevel} />

      {/* 📦 Composition */}
      <CompositionCard composition={analysis.composition} />

      {/* 🔐 Permissions */}
      <TechnicalPermissionsCard permissions={analysis.permissions} />

      {/* 🛡️ Sécurité */}
      <SecurityCard security={analysis.security} />

      {/* 🕵️ Trackers */}
      <DetectionEntryList
        icon={Eye}
        title={t('technical.signals.trackers')}
        intro={t('technical.ui.trackersIntro')}
        countLabel={(n) => (n === 0 ? t('technical.ui.noneDetected') : t('technical.ui.detected', { count: n }))}
        entries={analysis.trackers}
        emptyLabel={t('technical.ui.noTracker')}
        accentClassName="text-rose-600"
      />

      {/* 📦 SDK */}
      <DetectionEntryList
        icon={Package}
        title="SDK"
        intro={t('technical.ui.sdkIntro')}
        countLabel={(n) => (n === 0 ? t('technical.ui.noneDetected') : t('technical.ui.detected', { count: n }))}
        entries={analysis.sdks}
        emptyLabel={t('technical.ui.noSdk')}
        accentClassName="text-violet-600"
      />

      {/* 🇬 Google */}
      <DetectionEntryList
        icon={Boxes}
        title="Google"
        intro={t('technical.ui.googleIntro')}
        countLabel={(n) => (n === 0 ? t('technical.ui.noneDetectedF') : t('technical.ui.deps', { count: n }))}
        entries={analysis.googleDependencies}
        emptyLabel={t('technical.ui.noGoogle')}
        accentClassName="text-blue-600"
      />

      {/* 📱 Informations générales */}
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
        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-[0.98] mb-2"
      >
        <Download size={14} /> {t('technical.ui.exportJson')}
      </button>

      <button
        onClick={() => setShowAbout(true)}
        className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-indigo-600 text-[11px] font-semibold py-1.5 transition-colors"
      >
        <Info size={12} /> {t('technical.ui.about')}
      </button>

      {showAbout && <AboutTechnicalAnalysisModal onClose={() => setShowAbout(false)} />}
      {error && null /* erreur déjà traduite en `unavailable` par le hook : rien à afficher ici */}
    </Accordion>
  );
};

export default TechnicalAnalysisSection;
