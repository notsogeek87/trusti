import React from 'react';
import { DetectionStatus } from '../../technical';
import { getSecuritySignals, SIGNAL_STYLE } from './technicalSignals';

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs py-1">
    <span className="text-slate-500">{label}</span>
    <span className="font-black text-slate-800">{value}</span>
  </div>
);

// Petit pastille colorée réutilisant les mêmes niveaux (bon / à surveiller /
// alerte / neutre) que le reste de l'analyse technique — plutôt qu'un simple
// ✓/❌ générique qui ne dit rien du sens favorable ou non du fait affiché.
const SignalStatRow = ({ label, level, text }) => {
  const style = SIGNAL_STYLE[level];
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-slate-500">{label}</span>
      <span className="inline-flex items-center gap-1 font-black text-slate-800">
        <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
        {text}
      </span>
    </div>
  );
};

/**
 * 📊 Vue synthétique en tête de l'analyse technique — résumé des sections
 * détaillées ci-dessous, jamais une source d'information à elle seule
 * (spec §11). Ne montre que ce qui est effectivement implémenté.
 */
const TechnicalSummary = ({ analysis }) => {
  const [debuggable, cleartext, , targetSdk] = getSecuritySignals(analysis.security);

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5">Dépendances tierces</p>
        <StatRow label="Google" value={analysis.googleDependencies.length} />
        <StatRow label="Trackers" value={analysis.trackers.length} />
        <StatRow label="SDK" value={analysis.sdks.length} />
        <StatRow label="Permissions" value={analysis.permissions.length} />
      </div>
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5">Sécurité</p>
        <SignalStatRow label="Target SDK" level={targetSdk.level} text={analysis.security.targetSdkVersion ?? '⚪'} />
        <SignalStatRow label="Debuggable" level={debuggable.level} text={debuggable.value === DetectionStatus.DETECTED ? 'Oui' : debuggable.value === DetectionStatus.NOT_DETECTED ? 'Non' : '⚪'} />
        <SignalStatRow label="Cleartext HTTP" level={cleartext.level} text={cleartext.value === DetectionStatus.DETECTED ? 'Oui' : cleartext.value === DetectionStatus.NOT_DETECTED ? 'Non' : '⚪'} />
      </div>
    </div>
  );
};

export default TechnicalSummary;
