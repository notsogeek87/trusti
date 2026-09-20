import React from 'react';
import { DetectionStatus } from '../../technical';

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs py-1">
    <span className="text-slate-500">{label}</span>
    <span className="font-black text-slate-800">{value}</span>
  </div>
);

const STATUS_SYMBOL = {
  [DetectionStatus.DETECTED]: '✓',
  [DetectionStatus.NOT_DETECTED]: '❌',
  [DetectionStatus.UNKNOWN]: '⚪',
};

/**
 * 📊 Vue synthétique en tête de l'analyse technique — résumé des sections
 * détaillées ci-dessous, jamais une source d'information à elle seule
 * (spec §11). Ne montre que ce qui est effectivement implémenté.
 */
const TechnicalSummary = ({ analysis }) => (
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
      <StatRow label="Target SDK" value={analysis.security.targetSdkVersion ?? '⚪'} />
      <StatRow label="Debuggable" value={STATUS_SYMBOL[analysis.security.debuggable]} />
      <StatRow label="Cleartext HTTP" value={STATUS_SYMBOL[analysis.security.usesCleartextTraffic]} />
    </div>
  </div>
);

export default TechnicalSummary;
